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

  return (
    <header className="glass-header sticky top-0 z-40 transition-all duration-300">
      <div className="app-header-inner flex items-center justify-between">
        {/* Brand */}
        <HeaderBrand onMobileMenuClick={() => setIsMenuOpen(false)} />

        {/* Desktop Navigation */}
        {hasNavigation && (
          <HeaderNav items={availableItems} />
        )}
        <div className="hidden md:flex items-center gap-2 floating-nav p-1.5 backdrop-blur-sm shadow-inner shadow-white/5">
          <GlobalSearchTrigger />
          <span className="h-5 w-px bg-border/45" />
          <BanditEventIndicator />
          <HeaderActions />
        </div>

        {/* Mobile Menu Toggle */}
        {hasNavigation && (
          <MobileMenuToggle
            isOpen={isMenuOpen}
            onToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
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
