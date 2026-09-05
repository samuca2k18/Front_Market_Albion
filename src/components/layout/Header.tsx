import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderNav } from "./HeaderNav";
import { HeaderActions } from "./HeaderActions";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { MobileMenu } from "./MobileMenu";
import { BanditEventIndicator } from "./BanditEventIndicator";
import { GlobalSearchTrigger } from "../search/GlobalSearch";
import "./layout.css";
import "./styles/premium-design.css";

const navItems = [
  { label: "dashboard", path: "/dashboard", protected: true },
  { label: "prices", path: "/prices", protected: true },
  { label: "opportunities", path: "/opportunities", protected: true },
  { label: "crafting", path: "/crafting", protected: true },
  { label: "priceGrid", path: "/price-grid", protected: true },
  { label: "killboard", path: "/killboard", protected: false },
  { label: "tracker", path: "/tracker", protected: true },
  { label: "metaMarket", path: "/meta-market", protected: true },
  { label: "guildHub", path: "/guild-hub", protected: true },
  { label: "items", path: "/items", protected: false },
  { label: "contribute", path: "/data-client", protected: false },
];

export function Header() {
  useTranslation();
  const { token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const availableItems = navItems.filter((item) =>
    item.protected ? !!token : true
  );
  const hasNavigation = availableItems.length > 0;
  const showDesktopTopNav = hasNavigation && !token;

  return (
    <header className="glass-header sticky top-0 z-40 transition-all duration-300">
      <div className="app-header-inner flex min-w-0 items-center gap-2 lg:gap-3 overflow-hidden">
        {/* Brand */}
        <div className="shrink-0 min-w-0">
          <HeaderBrand onMobileMenuClick={() => setIsMenuOpen(false)} />
        </div>

        {/* Desktop Navigation */}
        {showDesktopTopNav && (
          <div className="hidden lg:block min-w-0 flex-1 overflow-hidden">
            <HeaderNav items={availableItems} />
          </div>
        )}

        <div className="hidden md:flex min-w-0 items-center gap-1.5 lg:gap-2 shrink-0 ml-auto max-w-full">
          <div className="hidden xl:block rounded-2xl border border-border/45 bg-background/40 p-1.5 backdrop-blur-md">
            <GlobalSearchTrigger />
          </div>
          <div className="hidden xl:block rounded-2xl border border-border/45 bg-background/35 px-2.5 py-1.5 backdrop-blur-md">
            <BanditEventIndicator />
          </div>
          <HeaderActions />
        </div>

        {/* Mobile / tablet menu toggle (desktop nav starts at lg) */}
        {hasNavigation && (
          <div className="shrink-0 lg:hidden ml-auto md:ml-2">
            <MobileMenuToggle
              isOpen={isMenuOpen}
              onToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {hasNavigation && (
        <MobileMenu
          items={availableItems}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
