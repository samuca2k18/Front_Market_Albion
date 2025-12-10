/**
 * Utilitários para gerenciar e calcular preços
 */

import type { MyItemPrice } from '../api/types';

// ============================================
// FORMATAÇÃO
// ============================================

/**
 * Formata um preço para exibição
 * Exemplo: 1245000 => "1.245.000" (pt-BR) ou "1,245,000" (en-US)
 */
export function formatPrice(price: number, locale = 'pt-BR'): string {
  return price.toLocaleString(locale);
}

/**
 * Formata preço com símbolo de moeda
 * Exemplo: 1245000 => "₿ 1.245.000"
 */
export function formatPriceWithCurrency(
  price: number,
  locale = 'pt-BR',
  currency = '₿'
): string {
  return `${currency} ${formatPrice(price, locale)}`;
}

/**
 * Converte string de preço para número
 * Exemplo: "1.245.000" => 1245000
 */
export function parsePriceString(priceStr: string): number {
  const clean = priceStr.replace(/[^\d]/g, '');
  return parseInt(clean, 10) || 0;
}

// ============================================
// CÁLCULOS E COMPARAÇÕES
// ============================================

/**
 * Encontra o item com menor preço em uma lista
 */
export function getCheapestItem(
  items: MyItemPrice[]
): MyItemPrice | null {
  if (items.length === 0) return null;
  return items.reduce((min, item) =>
    (item.price ?? Infinity) < (min.price ?? Infinity) ? item : min
  );
}

/**
 * Encontra o item com maior preço em uma lista
 */
export function getMostExpensiveItem(
  items: MyItemPrice[]
): MyItemPrice | null {
  if (items.length === 0) return null;
  return items.reduce((max, item) =>
    (item.price ?? 0) > (max.price ?? 0) ? item : max
  );
}

/**
 * Agrupa itens por nome, mantendo apenas o mais barato
 */
export function groupPricesByItem(
  prices: MyItemPrice[]
): MyItemPrice[] {
  const map = new Map<string, MyItemPrice>();

  prices.forEach(p => {
    const existing = map.get(p.item_name);
    if (!existing || (p.price ?? Infinity) < (existing.price ?? Infinity)) {
      map.set(p.item_name, p);
    }
  });

  return Array.from(map.values());
}

/**
 * Agrupa itens por cidade
 */
export function groupPricesByCity(
  prices: MyItemPrice[]
): Map<string, MyItemPrice[]> {
  const map = new Map<string, MyItemPrice[]>();

  prices.forEach(p => {
    const city = p.city || 'Unknown';
    if (!map.has(city)) {
      map.set(city, []);
    }
    map.get(city)!.push(p);
  });

  return map;
}

/**
 * Calcula preço médio de um conjunto de itens
 */
export function calculateAveragePrice(items: MyItemPrice[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  return Math.round(total / items.length);
}

/**
 * Calcula variação de preço (diferença entre dois preços)
 */
export function calculatePriceVariation(
  oldPrice: number,
  newPrice: number
): {
  change: number;
  percent: number;
  isPositive: boolean;
} {
  const change = newPrice - oldPrice;
  const percent = oldPrice > 0 ? (change / oldPrice) * 100 : 0;

  return {
    change,
    percent: parseFloat(percent.toFixed(2)),
    isPositive: change >= 0,
  };
}

// ============================================
// VALIDAÇÃO
// ============================================

/**
 * Verifica se um preço é válido
 */
export function isValidPrice(price: number | undefined): boolean {
  return typeof price === 'number' && price > 0 && !isNaN(price);
}

/**
 * Filtra itens com preço válido
 */
export function filterValidPrices(items: MyItemPrice[]): MyItemPrice[] {
  return items.filter(item => isValidPrice(item.price));
}

// ============================================
// RANKINGS
// ============================================

/**
 * Classifica itens por preço (do mais barato ao mais caro)
 */
export function rankByPrice(items: MyItemPrice[]): MyItemPrice[] {
  return [...items].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
}

/**
 * Classifica itens por qualidade (do mais raro ao menos raro)
 */
export function rankByQuality(items: MyItemPrice[]): MyItemPrice[] {
  return [...items].sort((a, b) => b.quality - a.quality);
}

/**
 * Classifica itens por encantamento (do maior ao menor)
 */
export function rankByEnchantment(items: MyItemPrice[]): MyItemPrice[] {
  return [...items].sort((a, b) => b.enchantment - a.enchantment);
}

// ============================================
// OPORTUNIDADES
// ============================================

/**
 * Encontra melhor oportunidade de compra em uma cidade específica
 * (preço mais baixo)
 */
export function findBestBuyOpportunity(
  items: MyItemPrice[],
  city?: string
): MyItemPrice | null {
  const filtered = city
    ? items.filter(item => item.city === city)
    : items;

  return getCheapestItem(filtered);
}

/**
 * Encontra melhor oportunidade de venda em uma cidade específica
 * (preço mais alto)
 */
export function findBestSellOpportunity(
  items: MyItemPrice[],
  city?: string
): MyItemPrice | null {
  const filtered = city
    ? items.filter(item => item.city === city)
    : items;

  return getMostExpensiveItem(filtered);
}

/**
 * Calcula profit potencial entre compra e venda
 */
export function calculatePotentialProfit(
  buyPrice: number,
  sellPrice: number,
  quantity = 1
): {
  profit: number;
  profitPercent: number;
} {
  const profit = (sellPrice - buyPrice) * quantity;
  const profitPercent = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;

  return {
    profit: Math.round(profit),
    profitPercent: parseFloat(profitPercent.toFixed(2)),
  };
}