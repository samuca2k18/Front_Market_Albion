import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

const navItems = [
  { label: "dashboard", path: "/dashboard", protected: true },
  { label: "prices", path: "/prices", protected: true },
];

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const availableItems = navItems.filter((item) =>
    item.protected ? !!token : true
  );
  const hasNavigation = availableItems.length > 0;

  const firstLetter = user?.username?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 group"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="h-9 w-9 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm group-hover:bg-primary/15 transition-colors">
              <span className="text-lg font-bold text-primary">₿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight">
                Albion Market
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("header.tagline")}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop nav */}
        {hasNavigation && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {availableItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "relative inline-flex items-center text-sm transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {t(`header.${item.label}`)}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Right side (language switcher + user / auth buttons) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                  <span>{firstLetter}</span>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t("header.loggedAs")}
                  </span>
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {user.username}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-1"
              >
                {t("header.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  {t("login.submit")}
                </Link>
              </Button>
              <Button
                variant="hero"
                size="sm"
                asChild
              >
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  {t("signup.submit")}
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        {hasNavigation && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 md:hidden border border-border/70 bg-background/80"
            aria-expanded={isMenuOpen}
            aria-label={t("header.toggleMenu")}
            onClick={() => setIsMenuOpen((state) => !state)}
          >
            <span
              className={`block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
                isMenuOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
                isMenuOpen ? "-translate-y-[3px] -rotate-45" : "mt-1"
              }`}
            />
          </button>
        )}
      </div>

      {/* Mobile nav + actions */}
      {hasNavigation && (
        <div
          className={`md:hidden border-t border-border/60 bg-background/95 backdrop-blur transition-[max-height,opacity] duration-200 ${
            isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-3">
            <nav className="flex flex-col gap-1 text-sm">
              {availableItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "px-3 py-2 rounded-xl transition-colors",
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    ].join(" ")
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`header.${item.label}`)}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Language Switcher */}
            <div className="py-2 border-t border-border/40">
              <LanguageSwitcher />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                      <span>{firstLetter}</span>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                        {t("header.loggedAs")}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {user.username}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    {t("header.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      {t("login.submit")}
                    </Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      {t("signup.submit")}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}