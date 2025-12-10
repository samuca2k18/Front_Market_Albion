// src/pages/dashboard/hooks/useDashboardPrices.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { MyItemPrice } from "@/api/types";
import { fetchMyItemsPrices } from "@/api/albion";
import {
  filterPricesByTier,
  type TierFilter,
} from "../utils/itemFilters";
import {
  getCheapestPricesByItemName,
  getLowestPrice,
} from "../utils/priceCalculations";

interface UseDashboardPricesReturn {
  myPricesQuery: ReturnType<typeof useQuery<MyItemPrice[]>>;
  myPrices: MyItemPrice[];
  selectedTier: TierFilter;
  setSelectedTier: (tier: TierFilter) => void;
  lowestPrice: number | null;
}

export function useDashboardPrices(): UseDashboardPricesReturn {
  const [selectedTier, setSelectedTier] = useState<TierFilter>("all");

  const myPricesQuery = useQuery<MyItemPrice[]>({
    queryKey: ["my-items-prices"],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    const raw = myPricesQuery.data ?? [];
    return filterPricesByTier(raw, selectedTier);
  }, [myPricesQuery.data, selectedTier]);

  const myPrices = useMemo(
    () => getCheapestPricesByItemName(filtered),
    [filtered],
  );

  const lowestPrice = getLowestPrice(myPrices);

  return {
    myPricesQuery,
    myPrices,
    selectedTier,
    setSelectedTier,
    lowestPrice,
  };
}
