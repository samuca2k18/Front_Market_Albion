// src/pages/dashboard/hooks/usePriceHistory.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAlbionHistory, type AlbionHistoryResponse } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import { formatHistoryToChartData, type ChartPoint } from "../utils/chartFormatters";

interface UsePriceHistoryReturn {
  selectedHistoryItem: string | null;
  setSelectedHistoryItem: (name: string | null) => void;
  historyQuery: ReturnType<typeof useQuery<AlbionHistoryResponse>>;
  chartData: ChartPoint[];
}

export function usePriceHistory(locale: string): UsePriceHistoryReturn {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const { region } = useRegion();

  const historyQuery = useQuery<AlbionHistoryResponse>({
    queryKey: ["albion-history", selectedHistoryItem, region],
    queryFn: () =>
      fetchAlbionHistory(selectedHistoryItem!, 7, ["Caerleon"], "6h", region),
    enabled: !!selectedHistoryItem,
  });

  const chartData = useMemo(
    () =>
      historyQuery.data
        ? formatHistoryToChartData(historyQuery.data, locale)
        : [],
    [historyQuery.data, locale],
  );

  return {
    selectedHistoryItem,
    setSelectedHistoryItem,
    historyQuery,
    chartData,
  };
}
