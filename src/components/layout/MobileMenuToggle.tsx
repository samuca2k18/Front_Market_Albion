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
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 transition-colors hover:bg-background/90 md:hidden"
      aria-expanded={isOpen}
      aria-label={t("header.toggleMenu")}
      onClick={onToggle}
    >
      <span className="relative h-4 w-4">
        <span
          className={`absolute left-0 top-[3px] block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
            isOpen ? "translate-y-[3px] rotate-45" : ""
          }`}
        />
        <span
          className={`absolute left-0 top-[9px] block h-0.5 w-4 rounded-full bg-foreground transition-transform ${
            isOpen ? "-translate-y-[3px] -rotate-45" : ""
          }`}
        />
      </span>
    </button>
  );
}
