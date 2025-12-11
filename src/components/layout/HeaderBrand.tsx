import { Link } from "react-router-dom";

interface HeaderBrandProps {
  onMobileMenuClick?: () => void;
}

export function HeaderBrand({ onMobileMenuClick }: HeaderBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/"
        className="flex items-center gap-3 group"
        onClick={onMobileMenuClick}
      >
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/90 via-emerald-400 to-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/50">
          <span className="text-lg font-black">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight leading-none">
            Albion Market
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Market Intelligence
          </span>
        </div>
      </Link>
    </div>
  );
}