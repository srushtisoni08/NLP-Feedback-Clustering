import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PageHeader, StatCard, ChartTooltip, Badge } from "../components/ui";
import { comparison, summary, MODEL_COLORS } from "../lib/data";
import { Trophy, GitMerge, Target } from "lucide-react";

const REASONS = [
  ["TF-IDF counts words", "Two comments with the same meaning but different words (\"kind\" vs \"friendly\") look unrelated, so clusters follow vocabulary."],
  ["SBERT encodes meaning", "Sentence embeddings place paraphrases close together, even with no shared words."],
  ["Short comments suit SBERT", "Most comments are under ~10 words. TF-IDF vectors are sparse and noisy at that length; SBERT stays dense and stable."],
  ["Context and negation", "SBERT sees word order and context (\"not clear\" vs \"clear\"); TF-IDF treats words independently."],
];

export default function Models() {
  const k7 = summary.k7;
  const wins = comparison.filter((r) => r.sbert > r.tfidf).length;

  return (
    <>
      <PageHeader title="Model Comparison" subtitle="TF-IDF vs SBERT (all-MiniLM-L6-v2), both clustered with K-Means." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Trophy} label="SBERT wins" value={`${wins} / ${comparison.length} K values`} hint="Higher silhouette at every tested K" />
        <StatCard icon={Target} accent="#0ea5e9" label="Silhouette at K=7" value={`${k7.sbert.toFixed(4)}`} hint={`TF-IDF: ${k7.tfidf.toFixed(4)}`} />
        <StatCard icon={GitMerge} accent="#ec4899" label="ARI (TF-IDF vs SBERT)" value={summary.ari.toFixed(4)} hint="Near 0 = very different groupings" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        <Card title="Silhouette score by K" subtitle="Different K values, both representations">
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={comparison} margin={{ left: 0, right: 8, top: 8 }} barGap={3}>
                <CartesianGrid vertical={false} stroke="#eef0f5" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: "K (clusters)", position: "insideBottom", offset: -2, fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} content={<ChartTooltip valueFmt={(v) => v.toFixed(4)} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="tfidf" name="TF-IDF" fill={MODEL_COLORS.tfidf} radius={[4, 4, 0, 0]} />
                <Bar dataKey="sbert" name="SBERT" fill={MODEL_COLORS.sbert} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Scores table">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="pb-2 font-medium">K</th>
                <th className="pb-2 text-right font-medium">TF-IDF</th>
                <th className="pb-2 text-right font-medium">SBERT</th>
                <th className="pb-2 text-right font-medium">Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {comparison.map((r) => (
                <tr key={r.k} className={r.k === 7 ? "bg-brand-soft/60" : ""}>
                  <td className="py-2 pl-1 font-sans font-medium">{r.k}{r.k === 7 && <span className="ml-1 text-[10px] text-brand">used</span>}</td>
                  <td className="py-2 text-right">{r.tfidf.toFixed(4)}</td>
                  <td className="py-2 text-right text-brand">{r.sbert.toFixed(4)}</td>
                  <td className="py-2 text-right text-emerald-600">{(r.sbert / r.tfidf).toFixed(1)}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Adjusted Rand Index (ARI)" subtitle="Agreement between TF-IDF and SBERT clusters at K=7">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-semibold tracking-tight">{summary.ari.toFixed(4)}</p>
            <Badge color="#f59e0b">Low agreement</Badge>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(summary.ari, 0) * 100}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted"><span>0 · random</span><span>1 · identical</span></div>
          <p className="mt-4 text-sm text-muted">The two methods group comments very differently. TF-IDF groups by shared words, SBERT by meaning.</p>
        </Card>

        <Card title="Why SBERT performs better">
          <ul className="space-y-3">
            {REASONS.map(([h, b]) => (
              <li key={h} className="text-sm"><b>{h}.</b> <span className="text-muted">{b}</span></li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Caveat: all silhouette scores are low (SBERT's best is {summary.bestSbert.score.toFixed(4)} at K={summary.bestSbert.k}), so themes overlap. SBERT is better, but clusters are not sharply separated.
      </p>
    </>
  );
}