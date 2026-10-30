import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

export function StatCard({ icon: Icon, label, value, hint, accent = "#4f46e5" }) {
  return (
    <Card className="!p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: accent + "1a", color: accent }}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}

export function Badge({ children, color = "#4f46e5" }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: color + "1a", color }}>
      {children}
    </span>
  );
}

export function ChartTooltip({ active, payload, label, valueFmt = (v) => v }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-lg">
      {label !== undefined && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey ?? p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-mono font-medium">{valueFmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}