import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start">
          {/* Brand / description */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold tracking-tight">
              Albion Market
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {t("footer.description")}
            </p>
          </div>

          {/* Columns */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold tracking-tight">
                {t("footer.product")}
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>{t("footer.realtimeDashboard")}</li>
                <li>{t("footer.priceHistory")}</li>
                <li>{t("footer.apiIntegration")}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-semibold tracking-tight">
                {t("footer.data")}
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>{t("footer.albionAPI")}</li>
                <li>{t("footer.periodicUpdate")}</li>
                <li>{t("footer.marketFocus")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            © {year} {t("footer.copyright")}
          </span>
          <span className="text-[11px] text-muted-foreground max-w-xl">
            {t("footer.disclaimer")}
          </span>
        </div>
      </div>
    </footer>
  );
}