// src/pages/dashboard/components/QuickSummary.tsx
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";

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
    <Card className="bg-card/40 border-border/60 shadow-xl overflow-hidden backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {t("dashboard.quickSummary")}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {t("dashboard.quickSummaryDesc")}
            </CardDescription>
          </div>
          <Activity className="text-primary w-5 h-5 opacity-50" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("dashboard.trackedItems")}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tighter">{trackedCount}</p>
          </div>

          <div className="flex flex-col p-4 rounded-xl border border-border/40 bg-background/40 hover:bg-background/60 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                {t("dashboard.activePrices")}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tighter">{activePricesCount}</p>
          </div>

          <Link
            to="/opportunities"
            className="flex flex-col p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Oportunidades
              </span>
              <TrendingUp size={14} className="text-blue-400 group-hover:scale-125 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black tracking-tighter text-blue-100">{opportunityCount}</p>
              <span className="text-xs font-medium text-blue-400/60 uppercase">vias</span>
            </div>
            <div className="mt-2 text-[10px] font-bold text-blue-400/40 group-hover:text-blue-400/80 transition-colors uppercase tracking-widest">
              Ver Detalhes →
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
