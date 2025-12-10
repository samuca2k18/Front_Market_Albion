// src/pages/dashboard/components/QuickSummary.tsx
import { useTranslation } from "react-i18next";
import { Card } from "@/components/common/Card";

interface QuickSummaryProps {
  trackedCount: number;
  activePricesCount: number;
  lowestPrice: number | null;
  locale: string;
}

export function QuickSummary({
  trackedCount,
  activePricesCount,
  lowestPrice,
  locale,
}: QuickSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("dashboard.quickSummary")}
      description={t("dashboard.quickSummaryDesc")}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {t("dashboard.trackedItems")}
          </span>
          <p className="mt-2 text-2xl font-semibold">{trackedCount}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {t("dashboard.activePrices")}
          </span>
          <p className="mt-2 text-2xl font-semibold">{activePricesCount}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {t("dashboard.bestOpportunity")}
          </span>
          <p className="mt-2 text-lg font-semibold">
            {lowestPrice !== null
              ? `${lowestPrice.toLocaleString(locale)} ${t(
                  "dashboard.silver",
                )}`
              : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
}
