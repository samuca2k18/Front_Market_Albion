// src/pages/dashboard/utils/itemFilters.ts
import type { MyItemPrice } from "@/api/types";

export type TierFilter = "all" | "no-tier" | number;

export function splitItemName(itemName: string): { base: string; enchant?: number } {
  const [base, enchantStr] = itemName.split("@");
  const enchant = enchantStr ? Number(enchantStr) : undefined;
  return { base, enchant };
}

export function getTierFromItemName(itemName: string): number | null {
  if (!itemName) return null;
  const match = itemName.match(/^T(\d+)_/);
  if (!match) return null;
  const tier = parseInt(match[1], 10);
  if (Number.isNaN(tier)) return null;
  if (tier < 1 || tier > 8) return null;
  return tier;
}

/**
 * Imagem a partir do objeto de preço
 */
export function buildItemImageUrl(item: MyItemPrice): string {
  const { base } = splitItemName(item.item_name);
  const enchant =
    item.enchantment && item.enchantment > 0 ? item.enchantment : undefined;
  const enchantSuffix = enchant ? `@${enchant}` : "";
  const fullName = `${base}${enchantSuffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}

/**
 * Imagem a partir do nome interno
 */
export function buildItemImageUrlFromName(itemName: string): string {
  const [baseName, enchant] = itemName.split("@");
  const enchantSuffix = enchant ? `@${enchant}` : "";
  const fullName = `${baseName}${enchantSuffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}

/**
 * Filtro de preços por tier e preço > 0
 */
export function filterPricesByTier(
  prices: MyItemPrice[],
  selectedTier: TierFilter,
): MyItemPrice[] {
  return prices
    .filter((p) => p && typeof p.price === "number" && p.price > 0)
    .filter((p) => {
      const tier = getTierFromItemName(p.item_name);
      if (selectedTier === "all") return true;
      if (selectedTier === "no-tier") return tier === null;
      return tier === selectedTier;
    });
}
