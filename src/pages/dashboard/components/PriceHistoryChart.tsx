// src/pages/dashboard/components/PriceHistoryChart.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Clock, Info } from "lucide-react";

import type { ChartPoint } from "../utils/chartFormatters";

type RangeOption = "1D" | "5D" | "1M" | "6M" | "YTD" | "1A" | "5A" | "MAX";

const BACKEND_MAX_DAYS = 30;

const RANGE_OPTIONS: RangeOption[] = ["1D", "5D", "1M", "6M", "YTD", "1A", "5A", "MAX"];
const RANGE_LABEL: Record<RangeOption, string> = {
  "1D": "1D",
  "5D": "5D",
  "1M": "1M",
  "6M": "6M",
  "YTD": "YTD",
  "1A": "1A",
  "5A": "5A",
  "MAX": "MÁX",
};

function isLongRange(r: RangeOption) {
  return r === "6M" || r === "YTD" || r === "1A" || r === "5A" || r === "MAX";
}

interface PriceHistoryChartProps {
  selectedHistoryItem: string | null;
  chartData: ChartPoint[];
  historyQuery: {
    isLoading: boolean;
    isError: boolean;
  };
  getItemDisplayName: (name: string) => string;
  onRangeChange?: (range: RangeOption) => void;
}

export function PriceHistoryChart({
  selectedHistoryItem,
  chartData,
  historyQuery,
  getItemDisplayName,
  onRangeChange,
}: PriceHistoryChartProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<RangeOption>("1M");

  const filteredData = useMemo(() => {
    if (!chartData?.length) return [];
    if (range === "1D") return chartData.slice(-24);
    if (range === "5D") return chartData.slice(-120);
    return chartData;
  }, [chartData, range]);

  const stats = useMemo(() => {
    if (!filteredData.length) return null;
    const prices = filteredData.map((p: any) => Number(p.avg_price)).filter((n) => Number.isFinite(n));
    if (!prices.length) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = last - first;
    const percent = first > 0 ? ((change / first) * 100).toFixed(1) : null;

    return { min, max, first, last, change, percent, isPositive: change >= 0 };
  }, [filteredData]);

  if (!selectedHistoryItem) return null;

  const title = getItemDisplayName(selectedHistoryItem);

  const handleRange = (r: RangeOption) => {
    setRange(r);
    onRangeChange?.(r);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.value;
    return (
      <div className="bg-popover/95 border border-primary/20 p-3 rounded-xl backdrop-blur-xl shadow-2xl min-w-[180px]">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/40 pb-1">
          {label}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black tracking-tighter text-foreground">
            {Number(v).toLocaleString("pt-BR")}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">silver</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm overflow-hidden animate-fade-up">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-primary opacity-70" />
              {t("dashboard.priceHistory")}
            </CardTitle>
            <CardDescription className="text-muted-foreground truncate max-w-[300px] mt-0.5 font-medium">
              {title}
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 bg-background/40 p-1 rounded-full border border-border/40 overflow-x-auto no-scrollbar">
            {RANGE_OPTIONS.map((opt) => {
              const active = opt === range;
              const disabled = isLongRange(opt) && BACKEND_MAX_DAYS <= 30;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !disabled && handleRange(opt)}
                  disabled={disabled}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : disabled
                      ? "opacity-20 cursor-not-allowed"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  title={disabled ? `Indisponível (max ${BACKEND_MAX_DAYS}d)` : ""}
                >
                  {RANGE_LABEL[opt]}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* States / Error / Loading */}
        <div className="relative min-h-[350px] flex flex-col">
          {historyQuery.isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/10 backdrop-blur-[2px] z-10">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                {t("dashboard.loadingChart")}
              </p>
            </div>
          ) : historyQuery.isError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive z-10 bg-destructive/5">
              <TrendingDown className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">{t("dashboard.errorLoadingHistory")}</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-10 bg-muted/5">
              <Info className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">{t("dashboard.insufficientData")}</p>
            </div>
          ) : null}

          {/* Stats Bar */}
          {!historyQuery.isLoading && !historyQuery.isError && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-background/40 border border-border/20 rounded-xl p-3 flex flex-col shadow-inner">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Variação</span>
                <div className={`flex items-baseline gap-1.5 font-black tracking-tighter ${stats.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  <span className="text-lg">{stats.isPositive ? "+" : ""}{stats.change.toLocaleString("pt-BR")}</span>
                  <span className="text-[10px] opacity-80 uppercase">Silver</span>
                  {stats.percent !== null && (
                    <Badge variant="outline" className={`ml-1 text-[9px] font-black px-1.5 h-4 border-none ${stats.isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {stats.isPositive ? "↑" : "↓"} {stats.percent}%
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-background/40 border border-border/20 rounded-xl p-3 flex flex-col shadow-inner">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sessão (Mín/Máx)</span>
                <div className="flex items-center gap-2 font-black tracking-tighter text-foreground overflow-hidden whitespace-nowrap">
                  <span className="text-lg truncate">{stats.min.toLocaleString("pt-BR")}</span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="text-lg truncate">{stats.max.toLocaleString("pt-BR")}</span>
                </div>
              </div>

              <div className="hidden sm:flex bg-background/40 border border-border/20 rounded-xl p-3 flex-col justify-between shadow-inner group overflow-hidden relative">
                <div className="flex justify-between items-start z-10">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Sinal de Tendência</span>
                  {stats.isPositive ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
                </div>
                <div className="text-xl font-black tracking-tighter z-10">
                  {stats.isPositive ? "ALTA" : "BAIXA"}
                </div>
                {stats.isPositive ? (
                  <TrendingUp className="absolute -right-4 -bottom-4 w-16 h-16 text-emerald-500/5 group-hover:scale-125 transition-transform" />
                ) : (
                  <TrendingDown className="absolute -right-4 -bottom-4 w-16 h-16 text-red-500/5 group-hover:scale-125 transition-transform" />
                )}
              </div>
            </div>
          )}

          {/* Main Chart Rendering */}
          <div className="flex-1 w-full bg-background/20 rounded-2xl border border-border/20 p-4 pt-6 group">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.1} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v) => {
                    const n = Number(v);
                    if (!Number.isFinite(n)) return "";
                    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
                    return `${n}`;
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                />

                <Area
                  type="monotone"
                  dataKey="avg_price"
                  strokeWidth={3}
                  stroke="url(#lineStroke)"
                  fill="url(#areaFill)"
                  animationDuration={1500}
                  isAnimationActive={true}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex justify-between items-center mt-4 px-2">
              <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {filteredData.length} pontos de dados
                </span>
              </div>
              {range !== "MAX" && isLongRange(range) && BACKEND_MAX_DAYS <= 30 && (
                <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                  Longo Prazo Indisponível
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
