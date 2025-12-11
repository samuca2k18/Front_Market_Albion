import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { HeaderBrand } from "./HeaderBrand";
import { HeaderNav } from "./HeaderNav";
import { HeaderActions } from "./HeaderActions";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { MobileMenu } from "./MobileMenu";
import "./layout.css";

const navItems = [
  { label: "dashboard", path: "/dashboard", protected: true },
  { label: "prices", path: "/prices", protected: true },
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
    <header className="app-header sticky top-0 z-40">
      <div className="app-header-inner flex items-center justify-between">
        {/* Brand */}
        <HeaderBrand onMobileMenuClick={() => setIsMenuOpen(false)} />

        {/* Desktop Navigation */}
        {hasNavigation && (
          <HeaderNav items={availableItems} />
        )}

        {/* Right Actions */}
        <HeaderActions />

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