import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PageHeader, ChartTooltip } from "../components/ui";
import { summary, themes, SENTIMENT, THEME_COLORS, fmt } from "../lib/data";

const ORDER = ["positive", "neutral", "negative"];

export default function Sentiment() {
  const [mode, setMode] = useState("pct"); // pct | count

  const pie = ORDER.map((k) => ({ name: SENTIMENT[k].label, value: summary.sentiment[k], key: k }));
  const total = summary.analyzed;

  const rows = themes.map((t) => {
    const r = { short: t.short, cluster: t.cluster, total: t.count };
    ORDER.forEach((k) => {
      r[k] = mode === "pct" ? +((t.sentiment[k] / t.count) * 100).toFixed(1) : t.sentiment[k];
    });
    r.negPct = (t.sentiment.negative / t.count) * 100;
    r.posPct = (t.sentiment.positive / t.count) * 100;
    return r;
  });
  const ranked = [...rows].sort((a, b) => b.negPct - a.negPct);
  const mostNeg = ranked[0];
  const mostPos = [...rows].sort((a, b) => b.posPct - a.posPct)[0];

  return (
    <>
      <PageHeader title="Sentiment Analysis" subtitle="Sentiment labels were not used for clustering — they are analysed after the fact.">
        <div className="inline-flex rounded-lg border border-line bg-surface p-0.5 text-xs font-medium">
          {[["pct", "Percent"], ["count", "Count"]].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} className={`rounded-md px-3 py-1.5 ${mode === k ? "bg-brand text-white" : "text-muted"}`}>{l}</button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card title="Overall distribution" subtitle={`${fmt(total)} comments`}>
          <div className="relative h-60">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={68} outerRadius={100} paddingAngle={2} stroke="none">
                  {pie.map((d) => <Cell key={d.key} fill={SENTIMENT[d.key].color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip valueFmt={fmt} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div><p className="text-2xl font-semibold">{fmt(total)}</p><p className="text-xs text-muted">comments</p></div>
            </div>
          </div>
          <ul className="mt-2 space-y-2">
            {pie.map((d) => (
              <li key={d.key} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: SENTIMENT[d.key].color }} />
                {d.name}
                <span className="ml-auto font-mono">{fmt(d.value)}</span>
                <span className="w-14 text-right font-mono text-muted">{((d.value / total) * 100).toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Sentiment by theme" subtitle={mode === "pct" ? "Share of each theme's comments" : "Number of comments"}>
          <div className="h-[22rem]">
            <ResponsiveContainer>
              <BarChart data={rows} layout="vertical" stackOffset="none" margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="#eef0f5" />
                <XAxis type="number" domain={mode === "pct" ? [0, 100] : undefined} tickFormatter={(v) => (mode === "pct" ? v + "%" : v)} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="short" width={130} tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} content={<ChartTooltip valueFmt={(v) => (mode === "pct" ? v + "%" : v)} />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                {ORDER.map((k) => (
                  <Bar key={k} dataKey={k} name={SENTIMENT[k].label} stackId="s" fill={SENTIMENT[k].color} barSize={22} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <Card title="Compare themes" subtitle="Sorted by negative share">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="pb-2 font-medium">Theme</th>
                  <th className="pb-2 text-right font-medium">Comments</th>
                  {ORDER.map((k) => <th key={k} className="pb-2 text-right font-medium">{SENTIMENT[k].label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ranked.map((r) => {
                  const t = themes.find((x) => x.cluster === r.cluster);
                  return (
                    <tr key={r.cluster}>
                      <td className="py-2.5"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: THEME_COLORS[r.cluster] }} />{r.short}</td>
                      <td className="py-2.5 text-right font-mono">{fmt(r.total)}</td>
                      {ORDER.map((k) => {
                        const p = (t.sentiment[k] / t.count) * 100;
                        return (
                          <td key={k} className="py-2.5 text-right font-mono">
                            <span className="rounded px-1.5 py-0.5" style={{ background: SENTIMENT[k].color + Math.round(Math.min(p, 70) / 70 * 40 + 8).toString(16).padStart(2, "0") }}>{p.toFixed(1)}%</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Key takeaways">
          <ul className="space-y-3 text-sm">
            <li><b>{mostNeg.short}</b> is the most negative theme ({mostNeg.negPct.toFixed(0)}% negative).</li>
            <li><b>{mostPos.short}</b> is the most positive ({mostPos.posPct.toFixed(0)}% positive).</li>
            <li className="text-muted">Every theme mixes sentiments — themes and sentiment are related but not the same thing.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}