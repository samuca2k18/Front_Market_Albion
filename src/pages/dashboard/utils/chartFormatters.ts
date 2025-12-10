// src/pages/dashboard/utils/chartFormatters.ts
import type { AlbionHistoryResponse } from "@/api/albion";

export interface ChartPoint {
  time: string;
  avg_price: number;
  city: string;
}

export function formatHistoryToChartData(
  history: AlbionHistoryResponse,
  locale: string,
): ChartPoint[] {
  if (!history?.data) return [];

  return history.data.map((point) => ({
    time: new Date(point.date).toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    avg_price: point.avg_price,
    city: point.city,
  }));
}
