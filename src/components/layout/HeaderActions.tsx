import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

export function HeaderActions() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="hidden md:flex items-center gap-3">
      {/* Language Switcher */}
      <LanguageSwitcher />

      {user ? (
        <>
          {/* User Profile */}
          <HeaderUserMenu user={user} onLogout={handleLogout} />
        </>
      ) : (
        <>
          {/* Auth Buttons */}
          <Button variant="outline" size="sm" asChild>
            <Link to="/login">{t("login.submit")}</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">{t("signup.submit")}</Link>
          </Button>
        </>
      )}
    </div>
  );
}

// Componente interno
function HeaderUserMenu({ user, onLogout }: any) {
  const { t } = useTranslation();
  const firstLetter = user?.username?.[0]?.toUpperCase() ?? "A";

  return (
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
      <Button variant="outline" size="sm" onClick={onLogout} className="ml-1">
        {t("header.logout")}
      </Button>
    </>
  );
}