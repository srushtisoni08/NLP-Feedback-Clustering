import { useMemo, useState } from "react";
import { Quote } from "lucide-react";
import { Card, PageHeader, Badge } from "../components/ui";
import { themes, comments, THEME_COLORS, SENTIMENT, fmt } from "../lib/data";

const PAGE = 12;

export default function Themes() {
  const [active, setActive] = useState(themes[0].cluster);
  const [limit, setLimit] = useState(PAGE);
  const theme = themes.find((t) => t.cluster === active);
  const color = THEME_COLORS[active];
  const rows = useMemo(() => comments.filter((c) => c.cluster === active), [active]);

  const pick = (c) => { setActive(c); setLimit(PAGE); };

  return (
    <>
      <PageHeader title="Theme Exploration" subtitle="Seven themes discovered by SBERT + K-Means. Select one to see its comments." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* theme list */}
        <div className="flex flex-col gap-2">
          {themes.map((t) => {
            const on = t.cluster === active;
            return (
              <button
                key={t.cluster}
                onClick={() => pick(t.cluster)}
                className={`rounded-xl border bg-surface p-3 text-left transition ${on ? "border-transparent shadow-md ring-2" : "border-line hover:border-slate-300"}`}
                style={on ? { "--tw-ring-color": THEME_COLORS[t.cluster] } : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{t.name}</p>
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: THEME_COLORS[t.cluster] }} />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <span className="font-mono font-medium text-ink">{fmt(t.count)}</span> comments
                  <span className="ml-auto font-mono">{t.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${(t.pct / themes[0].pct) * 100}%`, background: THEME_COLORS[t.cluster] }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* detail */}
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: color }} />
              <h2 className="text-lg font-semibold">{theme.name}</h2>
              <Badge color={color}>Cluster {theme.cluster}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Mini label="Comments" value={fmt(theme.count)} />
              <Mini label="Share" value={`${theme.pct}%`} />
              <Mini label="Negative" value={`${Math.round((theme.sentiment.negative / theme.count) * 100)}%`} />
            </div>
          </Card>

          <Card title="Representative comments" subtitle="Closest to the theme's centre">
            <ul className="grid gap-2 sm:grid-cols-2">
              {theme.examples.map((e, i) => (
                <li key={i} className="flex gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                  <Quote size={14} className="mt-0.5 shrink-0" style={{ color }} />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title={`All comments in this theme (${fmt(rows.length)})`}>
            <ul className="divide-y divide-line">
              {rows.slice(0, limit).map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <span>{c.text}</span>
                  <Badge color={SENTIMENT[c.sentiment].color}>{SENTIMENT[c.sentiment].label}</Badge>
                </li>
              ))}
            </ul>
            {limit < rows.length && (
              <button onClick={() => setLimit((l) => l + PAGE * 2)} className="mt-3 w-full rounded-lg border border-line py-2 text-sm font-medium text-brand hover:bg-brand-soft">
                Show more ({fmt(rows.length - limit)} left)
              </button>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

const Mini = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
    <p className="mt-1 text-xl font-semibold">{value}</p>
  </div>
);