import { Link } from "react-router-dom";

interface HeaderBrandProps {
  onMobileMenuClick?: () => void;
}

export function HeaderBrand({ onMobileMenuClick }: HeaderBrandProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        to="/"
        className="flex items-center gap-3 group rounded-2xl px-1.5 py-1 transition-colors hover:bg-white/[0.03]"
        onClick={onMobileMenuClick}
      >
        <div className="relative h-10 w-10 rounded-[1rem] bg-gradient-to-br from-emerald-400 via-cyan-300 to-sky-400 text-slate-950 flex items-center justify-center shadow-[0_10px_28px_rgba(34,197,94,0.3)] ring-1 ring-emerald-200/70 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
          <span className="text-lg font-black tracking-tight">A</span>
          <span className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-tr from-white/35 to-transparent" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight leading-none">
            Albion Market
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80">
            Market Intelligence
          </span>
        </div>
      </Link>
    </div>
  );
}
