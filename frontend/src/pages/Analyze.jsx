import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Card, PageHeader, Badge } from "../components/ui";
import { analyzeFeedback } from "../lib/classify";
import { THEME_COLORS, SENTIMENT, themes } from "../lib/data";

const EXAMPLES = [
  "The teacher explains concepts clearly with practical examples",
  "Sir never gives us time to ask doubts in class",
  "More programming and lab sessions are needed",
  "Teacher is very friendly and polite with everyone",
];

export default function Analyze() {
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (t = text) => {
    if (!t.trim()) return;
    setBusy(true);
    try { setRes({ input: t, ...(await analyzeFeedback(t)) }); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Analyze New Feedback" subtitle="Enter a student comment to see which discovered theme it belongs to." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card title="Student comment">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && run()}
            rows={5}
            maxLength={400}
            placeholder="Type or paste a comment…"
            className="w-full resize-none rounded-xl border border-line bg-slate-50 p-3 text-sm outline-none focus:border-brand focus:bg-white"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => { setText(e); run(e); }} className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand">
                {e}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted">Ctrl + Enter to analyze</span>
            <button onClick={() => run()} disabled={!text.trim() || busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />} Analyze
            </button>
          </div>
        </Card>

        <Card title="Predicted theme">
          {!res && <p className="py-16 text-center text-sm text-muted">Results will appear here.</p>}

          {res && !res.ok && (
            <p className="py-10 text-center text-sm text-muted">No known words in this comment, so no theme could be assigned. Try a longer comment about teaching.</p>
          )}

          {res?.ok && (
            <>
              <div className="rounded-xl p-4" style={{ background: THEME_COLORS[res.best.cluster] + "14" }}>
                <div className="flex items-center gap-2">
                  <Badge color={THEME_COLORS[res.best.cluster]}>Cluster {res.best.cluster}</Badge>
                  <span className="ml-auto font-mono text-xs text-muted">{Math.round(res.best.share * 100)}% match</span>
                </div>
                <p className="mt-2 text-lg font-semibold">{res.best.theme.name}</p>
              </div>

              <ul className="mt-4 space-y-2">
                {res.ranking.map((r) => (
                  <li key={r.cluster} className="flex items-center gap-3 text-xs">
                    <span className="w-36 truncate text-muted">{r.theme.short}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-all" style={{ width: `${r.share * 100}%`, background: THEME_COLORS[r.cluster] }} />
                    </div>
                    <span className="w-9 text-right font-mono">{Math.round(r.share * 100)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      {res && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Preprocessing" subtitle="Same cleaning as the training data">
            <Step label="Original" value={res.input} />
            <Step label="Cleaned" value={res.cleaned || "—"} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {res.tokens.map((t, i) => (
                <span key={i} className={`rounded-md px-2 py-0.5 font-mono text-xs ${res.known.includes(t) ? "bg-brand-soft text-brand" : "bg-slate-100 text-muted line-through"}`}>{t}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">Highlighted = used for matching. Struck out = stopword or unseen word.</p>
          </Card>

          <Card title="Most similar existing comments">
            {res.neighbors.length ? (
              <ul className="divide-y divide-line">
                {res.neighbors.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 py-2.5 text-sm">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: THEME_COLORS[n.cluster] }} />
                    <span className="flex-1">{n.text}</span>
                    <Badge color={SENTIMENT[n.sentiment].color}>{SENTIMENT[n.sentiment].label}</Badge>
                    <span className="w-10 text-right font-mono text-xs text-muted">{n.sim.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted">No similar comments found.</p>}
          </Card>
        </div>
      )}

      <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-xs text-muted">
        This demo matches your text to the labelled comments using TF-IDF similarity in the browser. It approximates, but is not identical to, the SBERT + K-Means assignment from the notebooks.
      </p>
    </>
  );
}

const Step = ({ label, value }) => (
  <div className="mb-2 flex gap-3 text-sm">
    <span className="flex w-16 shrink-0 items-center gap-1 text-[11px] uppercase tracking-wide text-muted">{label}</span>
    <span className="min-w-0 break-words">{value}</span>
  </div>
);