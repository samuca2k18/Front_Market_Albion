// src/pages/dashboard/components/QuickSummary.tsx
import { useTranslation } from "react-i18next";
import { Card } from "@/components/common/Card";

import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

interface QuickSummaryProps {
  trackedCount: number;
  activePricesCount: number;
  opportunityCount?: number;
}

export function QuickSummary({
  trackedCount,
  activePricesCount,
  opportunityCount = 0,
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

        <Link
          to="/opportunities"
          className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 shadow-sm hover:bg-blue-500/10 transition-colors group relative overflow-hidden"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-blue-400">
              Oportunidades
            </span>
            <TrendingUp size={14} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {opportunityCount} <span className="text-sm font-normal text-muted-foreground">vias</span>
          </p>
          <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-blue-400 font-bold">VER TODAS</span>
          </div>
        </Link>
      </div>
    </Card>
  );
}
