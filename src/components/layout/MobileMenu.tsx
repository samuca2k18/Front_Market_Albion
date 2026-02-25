import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { NotificationsBell } from "./NotificationsBell";

interface NavItem {
  label: string;
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

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  const firstLetter = user?.username?.[0]?.toUpperCase() ?? "A";

  return (
    <div
      className={`md:hidden border-t border-border/60 bg-background/95 backdrop-blur transition-[max-height,opacity] duration-200 ${
        isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 space-y-3">
        {/* Navigation */}
        <nav className="flex flex-col gap-1 text-sm">
          {items.map((item) => (
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
              onClick={onClose}
            >
              {t(`header.${item.label}`)}
            </NavLink>
          ))}
        </nav>

        {/* Language Switcher + Notificações */}
        <div className="py-2 border-t border-border/40 flex items-center gap-3">
          <LanguageSwitcher />
          <NotificationsBell />
        </div>

        {/* User Info / Auth */}
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
                <Link to="/login" onClick={onClose}>
                  {t("login.submit")}
                </Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup" onClick={onClose}>
                  {t("signup.submit")}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}