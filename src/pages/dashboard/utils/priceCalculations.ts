// src/pages/dashboard/utils/priceCalculations.ts
import type { MyItemPrice } from "@/api/types";

/**
 * Groups by item_name and keeps the cheapest row for each item.
 */
export function getCheapestPricesByItemName(
  prices: MyItemPrice[],
  orderRef?: { item_name: string; sort_order?: number }[],
): MyItemPrice[] {
  const cheapestByItem = new Map<string, MyItemPrice>();

  for (const price of prices) {
    const current = cheapestByItem.get(price.item_name);
    if (!current || price.price < current.price) {
      cheapestByItem.set(price.item_name, price);
    }
  }

  const result = Array.from(cheapestByItem.values());

  if (orderRef && orderRef.length > 0) {
    const exactOrder = new Map<string, number>();
    const baseOrder = new Map<string, number>();

    orderRef.forEach((entry, index) => {
      const rank = typeof entry.sort_order === "number" ? entry.sort_order : index + 1;
      const exact = entry.item_name.toUpperCase();
      const base = exact.split("@")[0];
      if (!exactOrder.has(exact)) exactOrder.set(exact, rank);
      if (!baseOrder.has(base)) baseOrder.set(base, rank);
    });

    result.sort((a, b) => {
      const exactA = a.item_name.toUpperCase();
      const exactB = b.item_name.toUpperCase();
      const baseA = exactA.split("@")[0];
      const baseB = exactB.split("@")[0];

      const posA = exactOrder.get(exactA) ?? baseOrder.get(baseA) ?? 999;
      const posB = exactOrder.get(exactB) ?? baseOrder.get(baseB) ?? 999;

      if (posA !== posB) return posA - posB;
      return a.price - b.price;
    });
  } else {
    result.sort((a, b) => a.price - b.price);
  }

  return result;
}

/**
 * Returns the lowest price in the list.
 */
export function getLowestPrice(prices: MyItemPrice[]): number | null {
  if (!prices.length) return null;
  return prices[0].price;
}
