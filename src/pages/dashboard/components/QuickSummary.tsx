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
    <Card className="bg-card/40 border-border/60 shadow-xl overflow-hidden backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
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
          <div className="relative">
            <Activity className="text-primary w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {/* Tracked Items */}
          <div className="flex flex-col p-4 md:p-5 rounded-xl border border-border/40 bg-background/40 hover:bg-background/60 hover:border-primary/20 transition-all duration-300 group/card">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <BarChart3 className="w-3.5 h-3.5 group-hover/card:text-primary transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t("dashboard.trackedItems")}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tighter">
              <AnimatedNumber value={trackedCount} />
            </p>
          </div>

          {/* Active Prices */}
          <div className={`flex flex-col p-4 md:p-5 rounded-xl border transition-all duration-300 group/card ${
            liveBumpsCount > 0
              ? "border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.2)]"
              : "border-primary/20 bg-primary/5 hover:bg-primary/10"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-3.5 h-3.5 group-hover/card:animate-pulse ${liveBumpsCount > 0 ? "text-emerald-400" : "text-primary"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${liveBumpsCount > 0 ? "text-emerald-300" : "text-primary/80"}`}>
                {t("dashboard.activePrices")}
              </span>
            </div>
            <p className={`text-3xl font-black tracking-tighter ${liveBumpsCount > 0 ? "text-emerald-300" : "text-primary"}`}>
              <AnimatedNumber value={activePricesCount} />
            </p>
            {liveBumpsCount > 0 && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300/90">
                {t("dashboard.liveUpdates", { count: liveBumpsCount })}
              </p>
            )}
          </div>

          {/* Opportunities */}
          <Link
            to="/opportunities"
            className="flex flex-col p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all group/opp relative overflow-hidden"
          >
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover/opp:translate-x-full transition-transform duration-700" />

            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                {t("dashboard.opportunitiesLabel")}
              </span>
              <TrendingUp
                size={14}
                className="text-blue-400 group-hover/opp:scale-125 group-hover/opp:rotate-12 transition-all"
              />
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-3xl font-black tracking-tighter text-blue-100">
                <AnimatedNumber value={opportunityCount} />
              </p>
              <span className="text-xs font-medium text-blue-400/60 uppercase">
                {t("dashboard.routesLabel")}
              </span>
            </div>
            <div className="mt-2 text-[10px] font-bold text-blue-400/40 group-hover/opp:text-blue-400/80 transition-colors uppercase tracking-widest relative z-10">
              {t("dashboard.viewDetails")}
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
