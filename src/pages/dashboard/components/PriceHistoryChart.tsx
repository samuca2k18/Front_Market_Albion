// src/pages/dashboard/components/PriceHistoryChart.tsx
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

interface PriceHistoryChartProps {
  selectedHistoryItem: string | null;
  chartData: ChartPoint[];
  historyQuery: {
    isLoading: boolean;
    isError: boolean;
  };
  getItemDisplayName: (name: string) => string;
}

export function PriceHistoryChart({
  selectedHistoryItem,
  chartData,
  historyQuery,
  getItemDisplayName,
}: PriceHistoryChartProps) {
  const { t } = useTranslation();

  if (!selectedHistoryItem) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-2">
        {t("dashboard.priceHistory")}{" "}
        <span className="text-muted-foreground">
          {getItemDisplayName(selectedHistoryItem)}
        </span>
      </h3>

      {historyQuery.isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("dashboard.loadingChart")}
        </p>
      )}

      {historyQuery.isError && (
        <p className="text-sm text-destructive">
          {t("dashboard.errorLoadingHistory")}
        </p>
      )}

      {!historyQuery.isLoading &&
        !historyQuery.isError &&
        chartData.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.insufficientData")}
          </p>
        )}

      {!historyQuery.isLoading &&
        !historyQuery.isError &&
        chartData.length > 0 && (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avg_price"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
    </div>
  );
}
