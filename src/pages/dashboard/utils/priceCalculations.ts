// src/pages/dashboard/utils/priceCalculations.ts
import type { MyItemPrice } from "@/api/types";

/**
 * Agrupa por item_name e pega o mais barato para cada item.
 */
export function getCheapestPricesByItemName(
  prices: MyItemPrice[],
): MyItemPrice[] {
  const cheapestByItem = new Map<string, MyItemPrice>();

  for (const p of prices) {
    const existing = cheapestByItem.get(p.item_name);
    if (!existing || p.price < existing.price) {
      cheapestByItem.set(p.item_name, p);
    }
  }

  return Array.from(cheapestByItem.values()).sort((a, b) => a.price - b.price);
}

/**
 * Menor preço absoluto da lista (ou null).
 */
export function getLowestPrice(prices: MyItemPrice[]): number | null {
  if (!prices.length) return null;
  return prices[0].price;
}
