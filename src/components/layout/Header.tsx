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
  { label: "killboard", path: "/killboard", protected: true },
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
      <div className="app-header-inner flex items-center gap-3">
        {/* Brand */}
        <div className="shrink-0">
          <HeaderBrand onMobileMenuClick={() => setIsMenuOpen(false)} />
        </div>

        {/* Desktop Navigation */}
        {showDesktopTopNav && (
          <div className="hidden md:block min-w-0 flex-1">
            <HeaderNav items={availableItems} />
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
          <div className="rounded-lg border border-border/30 bg-card/50 p-1.5 backdrop-blur-sm">
            <GlobalSearchTrigger />
          </div>
          <div className="rounded-lg border border-border/30 bg-card/50 px-2.5 py-1.5 backdrop-blur-sm">
            <BanditEventIndicator />
          </div>
          <HeaderActions />
        </div>

        {/* Mobile Menu Toggle */}
        {hasNavigation && (
          <div className="ml-auto md:hidden">
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
