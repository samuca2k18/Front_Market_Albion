// src/pages/dashboard/components/PriceHistoryChart.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import type { ChartPoint } from "../utils/chartFormatters";

type RangeOption = "1D" | "5D" | "1M" | "6M" | "YTD" | "1A" | "5A" | "MAX";

// ⚠️ seu backend hoje parece limitar em 30 dias
const BACKEND_MAX_DAYS = 30;

const RANGE_OPTIONS: RangeOption[] = ["1D", "5D", "1M", "6M", "YTD", "1A", "5A", "MAX"];
const RANGE_LABEL: Record<RangeOption, string> = {
  "1D": "1 D",
  "5D": "5 D",
  "1M": "1 M",
  "6M": "6 M",
  "YTD": "YTD",
  "1A": "1 A",
  "5A": "5 A",
  "MAX": "Máx",
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

  /**
   * Opcional: se você quiser que ao clicar nos botões o dashboard
   * refaça o fetch com days/resolution diferentes.
   *
   * Exemplo de implementação no pai:
   * onRangeChange={(range) => setRange(range)}
   */
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

  // ✅ se seu dashboard ainda não refaz fetch por range, pelo menos
  // filtramos “visualmente” pegando o final do array.
  const filteredData = useMemo(() => {
    if (!chartData?.length) return [];

    // heurística simples (depende do seu formatter):
    // se for 1D: pega últimos ~24 pontos
    // se for 5D: últimos ~120 pontos
    // se for 1M: últimos ~720 pontos
    // OBS: isso é apenas visual, o ideal é o backend devolver por range.
    if (range === "1D") return chartData.slice(-24);
    if (range === "5D") return chartData.slice(-120);
    return chartData; // 1M e demais ficam como veio
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
    onRangeChange?.(r); // se o pai implementar, refaz fetch
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const v = payload[0]?.value;
    return (
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: 14,
          padding: 12,
          boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
          minWidth: 210,
          color: "hsl(var(--foreground))",
        }}
      >
        <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.2 }}>
          {Number(v).toLocaleString("pt-BR")}{" "}
          <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--muted-foreground))" }}>
            silver
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6" style={{ minWidth: 0 }}>
      {/* Header + botões */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 10,
          minWidth: 0,
        }}
      >
        <h3 className="text-sm font-semibold mb-0" style={{ minWidth: 0 }}>
          {t("dashboard.priceHistory")}{" "}
          <span className="text-muted-foreground" style={{ display: "inline-block", maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {title}
          </span>
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 6,
            borderRadius: 999,
            border: "1px solid hsl(var(--border))",
            background: "hsla(220, 30%, 10%, 0.55)",
            backdropFilter: "blur(10px)",
            overflowX: "auto",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {RANGE_OPTIONS.map((opt) => {
            const active = opt === range;
            const disabled = isLongRange(opt) && BACKEND_MAX_DAYS <= 30;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && handleRange(opt)}
                disabled={disabled}
                title={disabled ? `Backend ainda limita a ${BACKEND_MAX_DAYS} dias.` : ""}
                style={{
                  border: "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  opacity: disabled ? 0.35 : 1,
                  background: active ? "hsl(var(--primary))" : "transparent",
                  color: active ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                }}
              >
                {RANGE_LABEL[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estados */}
      {historyQuery.isLoading && (
        <p className="text-sm text-muted-foreground">{t("dashboard.loadingChart")}</p>
      )}

      {historyQuery.isError && (
        <p className="text-sm text-destructive">{t("dashboard.errorLoadingHistory")}</p>
      )}

      {!historyQuery.isLoading && !historyQuery.isError && filteredData.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("dashboard.insufficientData")}</p>
      )}

      {/* Cards de stats */}
      {!historyQuery.isLoading && !historyQuery.isError && stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
            marginBottom: 12,
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid hsl(var(--border))",
              background: "hsla(220, 30%, 10%, 0.55)",
              backdropFilter: "blur(10px)",
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Variação</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 16,
                fontWeight: 900,
                color: stats.isPositive ? "hsl(154 80% 52%)" : "hsl(0 84% 60%)",
              }}
            >
              {stats.isPositive ? "+" : ""}
              {stats.change.toLocaleString("pt-BR")} silver
              {stats.percent !== null ? ` (${stats.isPositive ? "+" : ""}${stats.percent}%)` : ""}
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid hsl(var(--border))",
              background: "hsla(220, 30%, 10%, 0.55)",
              backdropFilter: "blur(10px)",
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Mín / Máx</div>
            <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: "hsl(var(--foreground))" }}>
              {stats.min.toLocaleString("pt-BR")} • {stats.max.toLocaleString("pt-BR")}
            </div>
          </div>

          <div
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid hsl(var(--border))",
              background: "hsla(220, 30%, 10%, 0.55)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              minWidth: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}>Período</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: "hsl(var(--foreground))" }}>
                {range}
              </div>
            </div>
            <div style={{ fontSize: 22 }}>{stats.isPositive ? "📈" : "📉"}</div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      {!historyQuery.isLoading && !historyQuery.isError && filteredData.length > 0 && (
        <div
          style={{
            width: "100%",
            minWidth: 0,
            height: 320,
            minHeight: 320,
            borderRadius: 18,
            border: "1px solid hsl(var(--border))",
            background: "linear-gradient(140deg, hsla(222, 26%, 12%, 1), hsla(220, 26%, 8%, 1))",
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", height: 270, minHeight: 270, minWidth: 0, padding: "14px 10px 0 10px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <defs>
                  <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "hsla(210, 40%, 96%, 0.65)" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsla(210, 40%, 96%, 0.65)" }}
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  tickFormatter={(v) => {
                    const n = Number(v);
                    if (!Number.isFinite(n)) return "";
                    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
                    return `${n}`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                <Line
                  type="monotone"
                  dataKey="avg_price"
                  dot={false}
                  strokeWidth={2.5}
                  stroke="url(#lineStroke)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              padding: "10px 14px",
              fontSize: 12,
              color: "hsla(210, 40%, 96%, 0.7)",
              borderTop: "1px solid hsla(220, 24%, 22%, 0.7)",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>{filteredData.length} pontos</span>
            <span style={{ opacity: 0.9 }}>
              {isLongRange(range) && BACKEND_MAX_DAYS <= 30 ? "Longo indisponível (max 30d)" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
