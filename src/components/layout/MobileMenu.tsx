import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { RegionSwitcher } from "../common/RegionSwitcher";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "../common/ThemeToggle";
import { GlobalSearchTrigger } from "../search/GlobalSearch";

interface NavItem {
  label: string;
  labelFallback?: string;
  path: string;
  protected: boolean;
}

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const MARKET_PATHS = ["/dashboard", "/prices", "/opportunities", "/crafting"];
  const COMBAT_PATHS = ["/killboard", "/tracker", "/meta-market", "/guild-hub"];
  const RESOURCES_PATHS = ["/items", "/data-client"];
  const groupedPaths = [...MARKET_PATHS, ...COMBAT_PATHS, ...RESOURCES_PATHS];

  const groupedItems = [
    {
      key: "market",
      label: t("header.sections.market", { defaultValue: "Mercado" }),
      items: items.filter((item) => MARKET_PATHS.includes(item.path)),
    },
    {
      key: "combat",
      label: t("header.sections.combat", { defaultValue: "PvP" }),
      items: items.filter((item) => COMBAT_PATHS.includes(item.path)),
    },
    {
      key: "resources",
      label: t("header.sections.resources", { defaultValue: "Recursos" }),
      items: items.filter((item) => RESOURCES_PATHS.includes(item.path)),
    },
    {
      key: "other",
      label: t("header.sections.other", { defaultValue: "Outros" }),
      items: items.filter((item) => !groupedPaths.includes(item.path)),
    },
  ].filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  const firstLetter = user?.username?.[0]?.toUpperCase() ?? "A";

  return (
    <div
      className={`border-t border-border/60 bg-background/92 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden ${
        isOpen ? "max-h-[720px] opacity-100" : "max-h-0 overflow-hidden opacity-0"
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-3">
        <div className="rounded-2xl border border-border/45 bg-background/45 p-2 backdrop-blur-sm">
          <GlobalSearchTrigger />
        </div>

        <nav className="space-y-2 rounded-2xl border border-border/45 bg-background/40 p-2 text-sm">
          {groupedItems.map((section) => (
            <div key={section.key} className="rounded-xl border border-border/35 bg-background/35 p-2">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
                {section.label}
              </p>
              <div className="grid gap-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        "rounded-xl px-3 py-2.5 font-semibold tracking-tight transition-all",
                        isActive
                          ? "bg-primary/14 text-primary shadow-[inset_0_1px_0_rgba(74,222,128,0.3)]"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                      ].join(" ")
                    }
                  >
                    {t(`header.${item.label}`, {
                      defaultValue: item.labelFallback ?? item.label,
                    })}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/45 bg-background/35 p-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <RegionSwitcher />
          <NotificationsBell />
        </div>

        <div className="rounded-2xl border border-border/45 bg-background/35 p-3">
          {user ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-sm font-bold text-primary">
                  <span>{firstLetter}</span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                    {t("header.loggedAs")}
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.username}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-xl border-border/50 bg-background/60"
              >
                {t("header.logout")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl border-border/50 bg-background/60"
              >
                <Link to="/login" onClick={onClose}>
                  {t("login.submit")}
                </Link>
              </Button>
              <Button
                variant="hero"
                size="sm"
                asChild
                className="rounded-xl"
              >
                <Link to="/signup" onClick={onClose}>
                  {t("signup.submit")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
