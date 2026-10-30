import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Layers, Smile, GitCompare, Search, Wand2, Sparkles } from "lucide-react";

export const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/themes", label: "Theme Exploration", icon: Layers },
  { to: "/sentiment", label: "Sentiment Analysis", icon: Smile },
  { to: "/models", label: "Model Comparison", icon: GitCompare },
  { to: "/explorer", label: "Feedback Explorer", icon: Search },
  { to: "/analyze", label: "Analyze New Feedback", icon: Wand2 },
];

export default function Layout() {
  return (
    <div className="flex h-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2 pt-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><Sparkles size={18} /></span>
          <div>
            <p className="text-sm font-semibold leading-tight">Feedback Themes</p>
            <p className="text-[11px] text-muted">TF-IDF vs SBERT · K-Means</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-soft text-brand" : "text-muted hover:bg-slate-50 hover:text-ink"
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <p className="px-2 text-[11px] leading-relaxed text-muted">
          Unsupervised discovery of themes in student feedback.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface p-2 md:hidden">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${isActive ? "bg-brand-soft text-brand" : "text-muted"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}