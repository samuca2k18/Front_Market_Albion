import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { RegionSwitcher } from "../common/RegionSwitcher";
import { NotificationsBell } from "./NotificationsBell";

export function HeaderActions() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      {/* Idioma + Região + Notificações */}
      <div className="flex items-center gap-1.5">
        <LanguageSwitcher />
        <RegionSwitcher />
        <NotificationsBell />
      </div>

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
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
          <span>{firstLetter}</span>
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border-2 border-background" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground leading-tight">
            {t("header.loggedAs")}
          </span>
          <span className="text-xs font-medium truncate max-w-[110px]">
            {user.username}
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout} className="ml-1 text-xs h-7 px-2">
        {t("header.logout")}
      </Button>
    </>
  );
}