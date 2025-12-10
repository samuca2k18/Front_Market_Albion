import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import type { User } from "../../api/types";

interface HeaderUserMenuProps {
  user: User;
  onLogout?: () => void;
}

export function HeaderUserMenu({ user, onLogout }: HeaderUserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
    navigate("/");
  };

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
      <Button variant="outline" size="sm" onClick={handleLogout} className="ml-1">
        {t("header.logout")}
      </Button>
    </>
  );
}