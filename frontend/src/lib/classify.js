// Client-side theme assignment (TF-IDF + weighted k-NN over the 1,063 labelled comments).
// It approximates the SBERT clusters. To use the real model later, replace the body of
// analyzeFeedback() with a fetch() to your backend returning the same shape.
import { comments, themeByCluster } from "./data";

const STOP = new Set("a an the and or of to in on at for is are was were be been it its this that these those i we you they he she them us our your their my me with as by from so very much more not no do does did have has had can could should would will just".split(" "));
const K = 15;

export function preprocess(text) {
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const tokens = cleaned.split(" ").filter(Boolean);
  return { cleaned, tokens, kept: tokens.filter((t) => !STOP.has(t)) };
}

let index = null;
function build() {
  const docs = comments.map((c) => preprocess(c.clean).kept);
  const df = new Map();
  docs.forEach((d) => new Set(d).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const idf = new Map([...df].map(([t, n]) => [t, Math.log((1 + N) / (1 + n)) + 1]));
  const vec = (toks) => {
    const tf = new Map();
    toks.forEach((t) => idf.has(t) && tf.set(t, (tf.get(t) || 0) + 1));
    let norm = 0;
    tf.forEach((v, t) => { const w = v * idf.get(t); tf.set(t, w); norm += w * w; });
    norm = Math.sqrt(norm) || 1;
    tf.forEach((v, t) => tf.set(t, v / norm));
    return tf;
  };
  index = { idf, vec, vectors: docs.map(vec) };
  return index;
}

export async function analyzeFeedback(text) {
  const { idf, vec, vectors } = index || build();
  const pre = preprocess(text);
  const q = vec(pre.kept);
  const known = pre.kept.filter((t) => idf.has(t));

  const sims = vectors.map((v, i) => {
    let s = 0;
    q.forEach((w, t) => { const x = v.get(t); if (x) s += w * x; });
    return { i, s };
  });
  const top = sims.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, K);

  const base = { ...pre, known, neighbors: [] };
  if (!top.length) return { ...base, ok: false };

  const score = {};
  top.forEach(({ i, s }) => { const c = comments[i].cluster; score[c] = (score[c] || 0) + s; });
  const total = Object.values(score).reduce((a, b) => a + b, 0);
  const ranking = Object.entries(score)
    .map(([c, v]) => ({ cluster: +c, share: v / total, theme: themeByCluster[c] }))
    .sort((a, b) => b.share - a.share);

  return {
    ...base,
    ok: true,
    best: ranking[0],
    ranking,
    neighbors: top.slice(0, 5).map(({ i, s }) => ({ ...comments[i], sim: s })),
  };
}