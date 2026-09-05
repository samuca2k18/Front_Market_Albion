import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Coins,
  TrendingUp,
  Hammer,
  Swords,
  Radar,
  Flame,
  Shield,
  Database,
  Download,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  label: string;
  path: string;
  protected: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "dashboard", path: "/dashboard", protected: true },
  { label: "prices", path: "/prices", protected: true },
  { label: "opportunities", path: "/opportunities", protected: true },
  { label: "crafting", path: "/crafting", protected: true },
  { label: "killboard", path: "/killboard", protected: false },
  { label: "tracker", path: "/tracker", protected: true },
  { label: "metaMarket", path: "/meta-market", protected: true },
  { label: "guildHub", path: "/guild-hub", protected: true },
  { label: "items", path: "/items", protected: false },
  { label: "contribute", path: "/data-client", protected: false },
];

const ICONS: Record<string, any> = {
  dashboard: BarChart3,
  prices: Coins,
  opportunities: TrendingUp,
  crafting: Hammer,
  killboard: Swords,
  tracker: Radar,
  metaMarket: Flame,
  guildHub: Shield,
  items: Database,
  contribute: Download,
};

const SECTION_PATHS: Record<string, string[]> = {
  market: ["/dashboard", "/prices", "/opportunities", "/crafting"],
  combat: ["/killboard", "/tracker", "/meta-market", "/guild-hub"],
  resources: ["/items", "/data-client"],
};

export function SideNav() {
  const { t } = useTranslation();
  const { token } = useAuth();

  if (!token) return null;

  const availableItems = NAV_ITEMS.filter((item) => (item.protected ? !!token : true));
  const sections = [
    {
      key: "market",
      label: t("header.sections.market", { defaultValue: "Mercado" }),
      items: availableItems.filter((item) => SECTION_PATHS.market.includes(item.path)),
    },
    {
      key: "combat",
      label: t("header.sections.combat", { defaultValue: "PvP" }),
      items: availableItems.filter((item) => SECTION_PATHS.combat.includes(item.path)),
    },
    {
      key: "resources",
      label: t("header.sections.resources", { defaultValue: "Recursos" }),
      items: availableItems.filter((item) => SECTION_PATHS.resources.includes(item.path)),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <aside className="hidden md:block">
      <div className="sticky top-[84px] rounded-3xl border border-border/40 bg-card/35 p-3 backdrop-blur-md shadow-xl">
        <div className="px-2 pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/75">
            Navegação
          </p>
        </div>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.key} className="rounded-2xl border border-border/35 bg-background/30 p-2">
              <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
                {section.label}
              </p>
              <nav className="grid gap-1">
                {section.items.map((item) => {
                  const Icon = ICONS[item.label];
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        [
                          "flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all",
                          isActive
                            ? "bg-primary/14 text-primary border border-primary/25"
                            : "text-muted-foreground border border-transparent hover:bg-background/70 hover:text-foreground",
                        ].join(" ")
                      }
                    >
                      {Icon && <Icon className="h-4 w-4 opacity-90" />}
                      <span className="truncate">
                        {t(`header.${item.label}`, { defaultValue: item.label })}
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

