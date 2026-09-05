import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  labelFallback?: string;
  path: string;
  protected: boolean;
}

interface HeaderNavProps {
  items: NavItem[];
}

export function HeaderNav({ items }: HeaderNavProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const primaryPaths = [
    "/dashboard",
    "/prices",
    "/opportunities",
    "/crafting",
    "/price-grid",
    "/killboard",
    "/tracker",
  ];

  const primaryItems = items.filter((item) => primaryPaths.includes(item.path));
  const secondaryItems = items.filter((item) => !primaryPaths.includes(item.path));

  const navItemsToRender = primaryItems.length > 0 ? primaryItems : items;

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const secondaryActive = secondaryItems.some((item) => isPathActive(item.path));

  return (
    <nav className="flex min-w-0 items-center gap-1.5 rounded-2xl border border-border/40 bg-background/30 p-1 backdrop-blur-sm overflow-hidden">
      {navItemsToRender.map((item) => (
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
              {t(`header.${item.label}`, {
                defaultValue: item.labelFallback ?? item.label,
              })}
              {isActive && (
                <span className="absolute -bottom-0.5 left-2 right-2 h-px rounded-full bg-primary/70" />
              )}
            </>
          )}
        </NavLink>
      ))}

      {primaryItems.length > 0 && secondaryItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={[
                "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[12px] font-semibold tracking-tight transition-all duration-200",
                secondaryActive
                  ? "bg-primary/15 text-primary shadow-[0_8px_20px_rgba(34,197,94,0.14)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              ].join(" ")}
            >
              {t("header.more", { defaultValue: "Mais" })}
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-border/50 bg-card/95 backdrop-blur-xl"
          >
            {secondaryItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link to={item.path} className="w-full cursor-pointer">
                  {t(`header.${item.label}`, {
                    defaultValue: item.labelFallback ?? item.label,
                  })}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
