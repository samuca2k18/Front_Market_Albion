import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const rawVersion = import.meta.env.VITE_APP_VERSION ?? "1.0.0";
  const siteVersion = rawVersion.startsWith("v") ? rawVersion : `v${rawVersion}`;

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
            <span className="inline-flex w-fit rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              {t("footer.version", { version: siteVersion, defaultValue: `Versão ${siteVersion}` })}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-border/35 bg-background/25 p-5">
              <h5 className="text-sm font-semibold tracking-tight">
                {t("footer.product")}
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">{t("footer.realtimeDashboard")}</Link></li>
                <li><Link to="/prices" className="hover:text-foreground transition-colors">{t("footer.priceHistory")}</Link></li>
                <li><Link to="/meta-market" className="hover:text-foreground transition-colors">{t("footer.apiIntegration")}</Link></li>
              </ul>
            </div>
            <div className="space-y-3 rounded-3xl border border-border/35 bg-background/25 p-5">
              <h5 className="text-sm font-semibold tracking-tight">
                {t("footer.data")}
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><Link to="/items" className="hover:text-foreground transition-colors">{t("footer.albionAPI")}</Link></li>
                <li><Link to="/data-client" className="hover:text-foreground transition-colors">{t("footer.periodicUpdate")}</Link></li>
                <li>{t("footer.marketFocus")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border/35 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-xs text-muted-foreground">
            Copyright {year} {t("footer.copyright")}
          </span>
          <span className="inline-flex w-fit rounded-full border border-border/40 bg-background/30 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {siteVersion}
          </span>
          <span className="max-w-xl text-[11px] text-muted-foreground sm:text-right">
            {t("footer.disclaimer")}
          </span>
        </div>
      </div>
    </footer>
  );
}

