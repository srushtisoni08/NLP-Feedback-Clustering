import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
import { Card, PageHeader, Badge } from "../components/ui";
import { comments, themes, THEME_COLORS, SENTIMENT, fmt } from "../lib/data";

const SIZE = 15;
const sel = "rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

function toCsv(rows) {
  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["id", "comment", "sentiment", "cluster", "theme"];
  const body = rows.map((r) => [r.id, r.text, r.sentiment, r.cluster, r.theme].map(q).join(","));
  return "﻿" + [head.join(","), ...body].join("\n");
}

export default function Explorer() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [sent, setSent] = useState("all");
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return comments.filter(
      (c) =>
        (theme === "all" || c.cluster === +theme) &&
        (sent === "all" || c.sentiment === sent) &&
        (!q || c.text.toLowerCase().includes(q))
    );
  }, [query, theme, sent]);

  const pages = Math.max(1, Math.ceil(rows.length / SIZE));
  const cur = Math.min(page, pages - 1);
  const view = rows.slice(cur * SIZE, cur * SIZE + SIZE);
  const dirty = query || theme !== "all" || sent !== "all";
  const set = (fn) => (e) => { fn(e.target.value); setPage(0); };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "filtered_feedback.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Feedback Explorer" subtitle="Search, filter and export individual comments." />

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={query} onChange={set(setQuery)} placeholder="Search comments…" className={`${sel} w-full pl-9`} />
          </div>
          <select value={theme} onChange={set(setTheme)} className={sel}>
            <option value="all">All themes</option>
            {themes.map((t) => <option key={t.cluster} value={t.cluster}>{t.short}</option>)}
          </select>
          <select value={sent} onChange={set(setSent)} className={sel}>
            <option value="all">All sentiments</option>
            {Object.entries(SENTIMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {dirty && (
            <button onClick={() => { setQuery(""); setTheme("all"); setSent("all"); setPage(0); }} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
              <X size={14} /> Clear
            </button>
          )}
          <button onClick={download} disabled={!rows.length} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
            <Download size={15} /> Download CSV
          </button>
        </div>

        <p className="mt-4 text-xs text-muted"><span className="font-mono font-medium text-ink">{fmt(rows.length)}</span> of {fmt(comments.length)} comments</p>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Comment</th>
                <th className="py-2 pr-3 font-medium">Sentiment</th>
                <th className="py-2 font-medium">Assigned cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {view.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 pr-3 font-mono text-xs text-muted">{c.id}</td>
                  <td className="py-2.5 pr-3">{c.text}</td>
                  <td className="py-2.5 pr-3"><Badge color={SENTIMENT[c.sentiment].color}>{SENTIMENT[c.sentiment].label}</Badge></td>
                  <td className="whitespace-nowrap py-2.5">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: THEME_COLORS[c.cluster] }} />
                    <span className="font-mono text-xs text-muted">{c.cluster}</span> · {c.theme}
                  </td>
                </tr>
              ))}
              {!view.length && <tr><td colSpan={4} className="py-10 text-center text-muted">No comments match these filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">Page {cur + 1} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={cur === 0} onClick={() => setPage(cur - 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">Prev</button>
            <button disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="rounded-lg border border-line px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
    </>
  );
}