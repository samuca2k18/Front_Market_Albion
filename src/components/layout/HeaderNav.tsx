import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavItem {
  label: string;
  path: string;
  protected: boolean;
}

interface HeaderNavProps {
  items: NavItem[];
}

export function HeaderNav({ items }: HeaderNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex items-center gap-1.5 rounded-2xl border border-border/40 bg-background/30 p-1 backdrop-blur-sm">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            [
              "relative inline-flex items-center rounded-xl px-3 py-1.5 text-[12px] font-semibold tracking-tight transition-all duration-200",
              isActive
                ? "bg-primary/15 text-primary shadow-[0_8px_20px_rgba(34,197,94,0.14)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              {t(`header.${item.label}`)}
              {isActive && (
                <span className="absolute -bottom-0.5 left-2 right-2 h-px rounded-full bg-primary/70" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
