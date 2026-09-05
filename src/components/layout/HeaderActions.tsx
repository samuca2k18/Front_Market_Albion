import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
// LanguageSwitcher hidden until EN translations cover landing/auth chrome.
// import { LanguageSwitcher } from "../common/LanguageSwitcher";
import { RegionSwitcher } from "../common/RegionSwitcher";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "../common/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";
import type { User as AuthUser } from "@/api/types";

export function HeaderActions() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-w-0 items-center gap-1.5 lg:gap-2">
      <div className="flex items-center gap-1 rounded-2xl border border-border/40 bg-background/35 px-1.5 py-1.5 backdrop-blur-md">
        <ThemeToggle />
        <div className="hidden xl:block">
          <RegionSwitcher />
        </div>
        <NotificationsBell />
      </div>

      {user ? (
        <HeaderUserMenu user={user} onLogout={handleLogout} />
      ) : (
        <div className="flex min-w-0 items-center gap-1 rounded-2xl border border-border/45 bg-background/40 p-1 backdrop-blur-md">
          <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-accent/10 h-8 px-2.5 lg:px-3 text-xs font-semibold shrink-0">
            <Link to="/login">{t("login.submit")}</Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 h-8 px-2.5 lg:px-3 text-xs shrink-0 whitespace-nowrap"
          >
            <Link to="/signup">{t("signup.submit")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

interface HeaderUserMenuProps {
  user: AuthUser;
  onLogout: () => void;
}

function HeaderUserMenu({ user, onLogout }: HeaderUserMenuProps) {
  const { t } = useTranslation();
  const firstLetter = user?.username?.[0]?.toUpperCase() ?? "A";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-card/45 border border-border/45 hover:bg-card/80 transition-all outline-none group backdrop-blur-sm">
          <div className="relative h-8 w-8 rounded-xl bg-primary/18 flex items-center justify-center text-xs font-bold text-primary border border-primary/30">
            <span>{firstLetter}</span>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#090b0e]" />
          </div>
          <div className="flex flex-col items-start max-w-[110px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none mb-1">
              {t("header.loggedAs")}
            </span>
            <span className="text-xs font-semibold truncate w-full">
              {user.username}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 border-border/60 backdrop-blur-xl">
        <DropdownMenuLabel className="font-bold flex items-center gap-2 py-3 px-4">
          <User className="w-4 h-4 text-muted-foreground" />
          {user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem className="py-2.5 px-4 cursor-pointer gap-3 focus:bg-primary/10">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/60" />
        <DropdownMenuItem
          onClick={onLogout}
          className="py-2.5 px-4 cursor-pointer gap-3 text-red-400 focus:text-red-400 focus:bg-red-400/10"
        >
          <LogOut className="w-4 h-4" />
          <span>{t("header.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
