import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NavItem {
  label: string;
  path: string;
  protected: boolean;
}

interface HeaderNavProps {
  items: NavItem[];
}

export function HeaderNav({ items }: HeaderNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
      {items.map((item) => (
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
  );
}