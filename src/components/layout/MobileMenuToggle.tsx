import { useTranslation } from "react-i18next";

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-md p-2 md:hidden border border-border/70 bg-background/80"
      aria-expanded={isOpen}
      aria-label={t("header.toggleMenu")}
      onClick={onToggle}
    >
      <span
        className={`block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
          isOpen ? "translate-y-[3px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
          isOpen ? "-translate-y-[3px] -rotate-45" : "mt-1"
        }`}
      />
    </button>
  );
}