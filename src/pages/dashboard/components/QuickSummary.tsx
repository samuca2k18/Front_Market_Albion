// src/pages/dashboard/components/QuickSummary.tsx
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { TrendingUp, Activity, BarChart3, Sparkles } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface QuickSummaryProps {
  trackedCount: number;
  activePricesCount: number;
  opportunityCount?: number;
  liveBumpsCount?: number;
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const animated = useCountUp(value, 800);
  return <span className={className}>{animated}</span>;
}

export function QuickSummary({
  trackedCount,
  activePricesCount,
  opportunityCount = 0,
  liveBumpsCount = 0,
}: QuickSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card className="bg-card/60 border-border/40 overflow-hidden backdrop-blur-sm group hover:border-border/60 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {t("dashboard.quickSummary")}
            </CardTitle>
            <CardDescription className="text-muted-foreground/70 mt-0.5 text-sm">
              {t("dashboard.quickSummaryDesc")}
            </CardDescription>
          </div>
          <div className="relative">
            <Activity className="text-primary/70 w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tracked Items */}
          <div className="flex flex-col p-3.5 rounded-lg border border-border/30 bg-background/50 hover:bg-background/70 hover:border-border/50 transition-colors group/card">
            <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5 group-hover/card:text-primary/70 transition-colors" />
              <span className="text-[11px] font-medium">
                {t("dashboard.trackedItems")}
              </span>
            </div>
            <p className="text-2xl font-bold">
              <AnimatedNumber value={trackedCount} />
            </p>
          </div>

          {/* Active Prices */}
          <div className={`flex flex-col p-3.5 rounded-lg border transition-colors group/card ${
            liveBumpsCount > 0
              ? "border-emerald-500/30 bg-emerald-500/8"
              : "border-primary/20 bg-primary/5 hover:bg-primary/8"
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${liveBumpsCount > 0 ? "text-emerald-400/80" : "text-primary/70"}`} />
              <span className={`text-[11px] font-medium ${liveBumpsCount > 0 ? "text-emerald-300/80" : "text-primary/70"}`}>
                {t("dashboard.activePrices")}
              </span>
            </div>
            <p className={`text-2xl font-bold ${liveBumpsCount > 0 ? "text-emerald-300" : "text-primary"}`}>
              <AnimatedNumber value={activePricesCount} />
            </p>
            {liveBumpsCount > 0 && (
              <p className="mt-1 text-[10px] font-medium text-emerald-400/70">
                {liveBumpsCount} update(s) ao vivo
              </p>
            )}
          </div>

          {/* Opportunities */}
          <Link
            to="/opportunities"
            className="flex flex-col p-3.5 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/8 transition-colors group/opp relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-1.5 relative z-10">
              <span className="text-[11px] font-medium text-blue-400/80">
                Oportunidades
              </span>
              <TrendingUp
                size={13}
                className="text-blue-400/70 group-hover/opp:text-blue-400 transition-colors"
              />
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-2xl font-bold text-blue-100/90">
                <AnimatedNumber value={opportunityCount} />
              </p>
              <span className="text-xs font-medium text-blue-400/50">
                vias
              </span>
            </div>
            <div className="mt-1.5 text-[10px] font-medium text-blue-400/50 group-hover/opp:text-blue-400/70 transition-colors relative z-10">
              Ver Detalhes →
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
