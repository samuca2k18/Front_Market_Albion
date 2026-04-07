import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-container">
        <div className="footer-grid items-start">
          <div className="space-y-3 rounded-3xl border border-border/35 bg-background/35 p-5 backdrop-blur-md">
            <p className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Market Intelligence
            </p>
            <h4 className="text-base font-bold tracking-tight">Albion Market</h4>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-border/35 bg-background/25 p-5">
              <h5 className="text-sm font-semibold tracking-tight">
                {t("footer.product")}
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>{t("footer.realtimeDashboard")}</li>
                <li>{t("footer.priceHistory")}</li>
                <li>{t("footer.apiIntegration")}</li>
              </ul>
            </div>
            <div className="space-y-3 rounded-3xl border border-border/35 bg-background/25 p-5">
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

        <div className="mt-4 flex flex-col gap-2 border-t border-border/35 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Copyright {year} {t("footer.copyright")}
          </span>
          <span className="max-w-xl text-[11px] text-muted-foreground">
            {t("footer.disclaimer")}
          </span>
        </div>
      </div>
    </footer>
  );
}
