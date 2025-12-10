/**
 * Utilitários para filtrar e ordenar dados
 */

import type { MyItemPrice } from '../api/types';
import {
  getBaseItemName,
  getEnchantmentFromItemName,
  getTierFromItemName,
} from './items';

// ============================================
// TIPOS
// ============================================

export interface FilterState {
  item?: string;
  cities: Set<string>;
  qualities: Set<number>;
  enchantments: Set<number>;
  tiers: Set<number>;
  searchQuery: string;
}

export type SortBy = 'price' | 'city' | 'quality' | 'enchantment' | 'name';

// ============================================
// FACTORY
// ============================================

/**
 * Cria um estado de filtro vazio
 */
export function createEmptyFilterState(): FilterState {
  return {
    item: undefined,
    cities: new Set(),
    qualities: new Set(),
    enchantments: new Set(),
    tiers: new Set(),
    searchQuery: '',
  };
}

/**
 * Clona um estado de filtro
 */
export function cloneFilterState(state: FilterState): FilterState {
  return {
    item: state.item,
    cities: new Set(state.cities),
    qualities: new Set(state.qualities),
    enchantments: new Set(state.enchantments),
    tiers: new Set(state.tiers),
    searchQuery: state.searchQuery,
  };
}

// ============================================
// APLICAÇÃO DE FILTROS
// ============================================

/**
 * Aplica todos os filtros a uma lista de itens
 */
export function applyFilters(
  items: MyItemPrice[],
  filters: FilterState,
  displayNameFn?: (name: string) => string
): MyItemPrice[] {
  return items.filter(item => {
    // Filtro por item específico
    if (filters.item && getBaseItemName(item.item_name) !== filters.item) {
      return false;
    }

    // Filtro por cidades
    if (filters.cities.size > 0 && !filters.cities.has(item.city)) {
      return false;
    }

    // Filtro por qualidades
    if (filters.qualities.size > 0 && !filters.qualities.has(item.quality)) {
      return false;
    }

    // Filtro por encantamentos
    const enchant = getEnchantmentFromItemName(item.item_name);
    if (filters.enchantments.size > 0 && !filters.enchantments.has(enchant)) {
      return false;
    }

    // Filtro por tiers
    const tier = getTierFromItemName(item.item_name);
    if (filters.tiers.size > 0) {
      if (tier === null && !filters.tiers.has(0)) return false;
      if (tier !== null && !filters.tiers.has(tier)) return false;
    }

    // Filtro por busca de texto
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const displayName = displayNameFn
        ? displayNameFn(item.item_name)
        : item.item_name;

      if (!displayName.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  });
}

// ============================================
// ORDENAÇÃO
// ============================================

/**
 * Ordena itens filtrados
 */
export function sortItems(
  items: MyItemPrice[],
  sortBy: SortBy,
  locale = 'pt-BR'
): MyItemPrice[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));

    case 'city':
      return sorted.sort((a, b) =>
        (a.city || '').localeCompare(b.city || '', locale)
      );

    case 'quality':
      return sorted.sort((a, b) => b.quality - a.quality);

    case 'enchantment':
      return sorted.sort((a, b) => {
        const enchantA = getEnchantmentFromItemName(a.item_name);
        const enchantB = getEnchantmentFromItemName(b.item_name);
        return enchantB - enchantA;
      });

    case 'name':
      return sorted.sort((a, b) =>
        a.item_name.localeCompare(b.item_name, locale)
      );

    default:
      return sorted;
  }
}

/**
 * Aplica filtros E ordenação em sequência
 */
export function filterAndSort(
  items: MyItemPrice[],
  filters: FilterState,
  sortBy: SortBy,
  locale = 'pt-BR',
  displayNameFn?: (name: string) => string
): MyItemPrice[] {
  const filtered = applyFilters(items, filters, displayNameFn);
  return sortItems(filtered, sortBy, locale);
}

// ============================================
// EXTRAÇÃO DE VALORES ÚNICOS
// ============================================

/**
 * Extrai todas as cidades disponíveis dos itens
 */
export function extractCities(items: MyItemPrice[]): string[] {
  const set = new Set<string>();
  items.forEach(item => {
    if (item.city) set.add(item.city);
  });
  return Array.from(set).sort();
}

/**
 * Extrai todas as qualidades disponíveis
 */
export function extractQualities(items: MyItemPrice[]): number[] {
  const set = new Set<number>();
  items.forEach(item => {
    set.add(item.quality);
  });
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Extrai todos os encantamentos disponíveis
 */
export function extractEnchantments(items: MyItemPrice[]): number[] {
  const set = new Set<number>();
  items.forEach(item => {
    const enchant = getEnchantmentFromItemName(item.item_name);
    set.add(enchant);
  });
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Extrai todos os tiers disponíveis
 */
export function extractTiers(items: MyItemPrice[]): (number | null)[] {
  const set = new Set<number | null>();
  items.forEach(item => {
    const tier = getTierFromItemName(item.item_name);
    set.add(tier);
  });
  return Array.from(set).sort((a, b) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a - b;
  });
}

/**
 * Extrai todos os nomes de items únicos (base)
 */
export function extractUniqueItems(items: MyItemPrice[]): string[] {
  const set = new Set<string>();
  items.forEach(item => {
    set.add(getBaseItemName(item.item_name));
  });
  return Array.from(set).sort();
}

// ============================================
// HELPER: TOGGLE DE FILTRO
// ============================================

/**
 * Alterna um valor em um Set (add/remove)
 */
export function toggleSetValue<T>(set: Set<T>, value: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(value)) {
    newSet.delete(value);
  } else {
    newSet.add(value);
  }
  return newSet;
}

/**
 * Limpa todos os filtros
 */
export function clearAllFilters(state: FilterState): FilterState {
  return {
    ...state,
    item: undefined,
    cities: new Set(),
    qualities: new Set(),
    enchantments: new Set(),
    tiers: new Set(),
    searchQuery: '',
  };
}

/**
 * Verifica se algum filtro está ativo
 */
export function hasActiveFilters(state: FilterState): boolean {
  return (
    state.item !== undefined ||
    state.cities.size > 0 ||
    state.qualities.size > 0 ||
    state.enchantments.size > 0 ||
    state.tiers.size > 0 ||
    state.searchQuery.trim().length > 0
  );
}