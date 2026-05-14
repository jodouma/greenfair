import { PageKey } from "../types/greenfair";
import { PAGE_META } from "../utils/constants";

interface MobileNavProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

export function MobileNav({ activePage, onNavigate }: MobileNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {PAGE_META.map((page) => (
          <button
            key={page.key}
            className={`rounded-2xl px-2 py-2 text-xs font-medium ${
              page.key === activePage ? "bg-emerald-500/15 text-white" : "text-slate-400"
            }`}
            onClick={() => onNavigate(page.key)}
          >
            {page.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
