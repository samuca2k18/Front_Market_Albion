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
        <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm group-hover:bg-primary/15 transition-colors">
          <span className="text-lg font-bold text-primary">₿</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight">
            Albion Market
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Market Intelligence
          </span>
        </div>
      </Link>
    </div>
  );
}