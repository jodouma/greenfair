import { BarChart3, FlaskConical, Globe2, MapPinned, Radar, Scale, Telescope } from "lucide-react";
import { PageKey } from "../types/greenfair";
import { PAGE_META } from "../utils/constants";

const icons: Record<PageKey, typeof Globe2> = {
  overview: Globe2,
  country: MapPinned,
  compare: Scale,
  tunisia: Radar,
  forecast: Telescope,
  clustering: FlaskConical,
  methodology: BarChart3
};

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-0 flex h-screen flex-col border-r border-white/10 bg-slate-950/75 px-6 py-8 backdrop-blur">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">GreenFair</p>
          <h1 className="mt-4 text-3xl">Dashboard de durabilité</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Lecture comparée des trajectoires environnementales, sociales et économiques.
          </p>
        </div>
        <nav className="mt-10 space-y-2">
          {PAGE_META.map((page) => {
            const Icon = icons[page.key];
            const active = page.key === activePage;
            return (
              <button
                key={page.key}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
                  active ? "bg-emerald-500/20 text-white" : "text-slate-300 hover:bg-white/10"
                }`}
                onClick={() => onNavigate(page.key)}
              >
                <Icon className="h-4 w-4" />
                {page.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
