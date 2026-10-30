import { MessageSquareText, Layers, Trophy, Gauge } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, PageHeader, StatCard, ChartTooltip } from "../components/ui";
import { summary, themes, comparison, THEME_COLORS, MODEL_COLORS, fmt } from "../lib/data";

export default function Overview() {
  const ratio = (summary.k7.sbert / summary.k7.tfidf).toFixed(1);
  return (
    <>
      <PageHeader title="Overview" subtitle="Themes discovered in student feedback using unsupervised NLP." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageSquareText} label="Total feedback comments" value={fmt(summary.analyzed)} hint={`${fmt(summary.rawRows)} raw · after cleaning`} />
        <StatCard icon={Layers} accent="#0ea5e9" label="Discovered themes" value={summary.themes} hint="SBERT + K-Means (K = 7)" />
        <StatCard icon={Trophy} accent="#ec4899" label="Largest theme" value={`${summary.largestPct}%`} hint={`${summary.largest} · ${summary.largestCount} comments`} />
        <StatCard icon={Gauge} accent="#10b981" label="SBERT vs TF-IDF (K=7)" value={`${ratio}× higher`} hint={`Silhouette ${summary.k7.sbert.toFixed(4)} vs ${summary.k7.tfidf.toFixed(4)}`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Theme distribution" subtitle="Share of comments per discovered theme">
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={themes} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke="#eef0f5" />
                <XAxis type="number" tickFormatter={(v) => v + "%"} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="short" width={130} tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} content={<ChartTooltip valueFmt={(v) => v + "%"} />} />
                <Bar dataKey="pct" name="Share" radius={[0, 6, 6, 0]} barSize={20}>
                  {themes.map((t) => <Cell key={t.cluster} fill={THEME_COLORS[t.cluster]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="TF-IDF vs SBERT" subtitle="Silhouette score across K (higher = better separated)">
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={comparison} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid vertical={false} stroke="#eef0f5" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} label={{ value: "K (clusters)", position: "insideBottom", offset: -2, fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip content={<ChartTooltip valueFmt={(v) => v.toFixed(4)} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Line type="linear" dataKey="sbert" name="SBERT" stroke={MODEL_COLORS.sbert} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="linear" dataKey="tfidf" name="TF-IDF" stroke={MODEL_COLORS.tfidf} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-muted">Scores are low overall — themes overlap, so read clusters alongside their example comments.</p>
        </Card>
      </div>
    </>
  );
}