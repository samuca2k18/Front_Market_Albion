import { useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "@/api/client";

export interface LiveUpdate {
  item_name: string;
  city: string;
  old_price: number;
  new_price: number;
  variation_pct: number;
  type: string;
  timestamp: number;
}

export type LiveConnectionState = "connecting" | "open" | "error" | "closed";

const FLASH_WINDOW_MS = 3000;
const EVICT_WINDOW_MS = 15000;

function normalizeItemName(raw: string): string {
  return raw.split("@")[0].toUpperCase();
}

function parseUpdate(raw: unknown): Omit<LiveUpdate, "timestamp"> | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;

  const itemName = typeof candidate.item_name === "string" ? candidate.item_name : null;
  const city = typeof candidate.city === "string" ? candidate.city : null;
  const oldPrice = typeof candidate.old_price === "number" ? candidate.old_price : null;
  const newPrice = typeof candidate.new_price === "number" ? candidate.new_price : null;
  const variation =
    typeof candidate.variation_pct === "number" ? candidate.variation_pct : null;
  const type = typeof candidate.type === "string" ? candidate.type : "MOCK_BUMP";

  if (!itemName || !city || oldPrice === null || newPrice === null || variation === null) {
    return null;
  }

  return {
    item_name: itemName,
    city,
    old_price: oldPrice,
    new_price: newPrice,
    variation_pct: variation,
    type,
  };
}

export function useLivePrices(
  watchedItemNames: string[] = [],
  watchedCities: string[] = [],
) {
  const [updates, setUpdates] = useState<Record<string, LiveUpdate>>({});
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [connectionState, setConnectionState] =
    useState<LiveConnectionState>("connecting");

  const itemKey = Array.from(
    new Set(watchedItemNames.map((item) => normalizeItemName(item)).filter(Boolean)),
  )
    .sort()
    .join(",");
  const cityKey = Array.from(new Set(watchedCities.map((city) => city.trim()).filter(Boolean)))
    .sort()
    .join(",");

  useEffect(() => {
    const itemFilter = itemKey ? itemKey.split(",") : [];
    const cityFilter = cityKey ? cityKey.split(",") : [];
    const itemFilterSet = new Set(itemFilter);
    const cityFilterSet = new Set(cityFilter);

    const url = new URL(`${API_BASE_URL}/stream/prices`);

    if (itemFilter.length > 0) {
      url.searchParams.set("items", itemFilter.join(","));
    }
    if (cityFilter.length > 0) {
      url.searchParams.set("cities", cityFilter.join(","));
    }

    const eventSource = new EventSource(url.toString());

    const handlePayload = (payload: unknown) => {
      const parsed = parseUpdate(payload);
      if (!parsed) return;

      const itemKeyNormalized = normalizeItemName(parsed.item_name);
      if (itemFilterSet.size > 0 && !itemFilterSet.has(itemKeyNormalized)) return;
      if (cityFilterSet.size > 0 && !cityFilterSet.has(parsed.city)) return;

      const compoundKey = `${parsed.item_name}-${parsed.city}`;
      setUpdates((previous) => ({
        ...previous,
        [compoundKey]: {
          ...parsed,
          timestamp: Date.now(),
        },
      }));
    };

    const handlePriceUpdate = (event: MessageEvent<string>) => {
      try {
        handlePayload(JSON.parse(event.data));
      } catch {
        // Ignore malformed payloads.
      }
    };

    eventSource.addEventListener("price_update", handlePriceUpdate);
    eventSource.onopen = () => setConnectionState("open");
    eventSource.onerror = () => setConnectionState("error");

    return () => {
      setConnectionState("closed");
      eventSource.removeEventListener("price_update", handlePriceUpdate);
      eventSource.close();
    };
  }, [itemKey, cityKey]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowTs(now);
      setUpdates((previous) => {
        const next: Record<string, LiveUpdate> = {};
        for (const [key, value] of Object.entries(previous)) {
          if (now - value.timestamp < EVICT_WINDOW_MS) {
            next[key] = value;
          }
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const recentUpdateCount = useMemo(
    () => Object.values(updates).filter((entry) => nowTs - entry.timestamp < FLASH_WINDOW_MS).length,
    [updates, nowTs],
  );

  return {
    updates,
    nowTs,
    connectionState,
    recentUpdateCount,
  };
}
