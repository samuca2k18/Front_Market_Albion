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
          <div className="space-y-3">
            <span className="inline-flex rounded-md border border-primary/20 bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary">
              Market Intelligence
            </span>
            <h4 className="text-base font-semibold">Albion Market</h4>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.description")}
            </p>
            <span className="text-xs text-muted-foreground/60">
              {t("footer.version", { version: siteVersion, defaultValue: `Versão ${siteVersion}` })}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-foreground">
                {t("footer.product")}
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">{t("footer.realtimeDashboard")}</Link></li>
                <li><Link to="/prices" className="hover:text-foreground transition-colors">{t("footer.priceHistory")}</Link></li>
                <li><Link to="/meta-market" className="hover:text-foreground transition-colors">{t("footer.apiIntegration")}</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-foreground">
                {t("footer.data")}
              </h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/items" className="hover:text-foreground transition-colors">{t("footer.albionAPI")}</Link></li>
                <li><Link to="/data-client" className="hover:text-foreground transition-colors">{t("footer.periodicUpdate")}</Link></li>
                <li>{t("footer.marketFocus")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border/30 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground/70">
            © {year} {t("footer.copyright")}
          </span>
          <span className="max-w-lg text-[11px] text-muted-foreground/60 sm:text-right">
            {t("footer.disclaimer")}
          </span>
        </div>
      </div>
    </footer>
  );
}

