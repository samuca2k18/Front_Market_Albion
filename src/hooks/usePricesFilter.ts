/**
 * Hook centralizado para toda lógica de filtros da PricesPage
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MyItemPrice } from '../api/types';
import { useToggleSet } from './useToggleSet';
import {
  applyFilters,
  sortItems,
  extractCities,
  extractQualities,
  extractEnchantments,
  extractTiers,
  extractUniqueItems,
  hasActiveFilters,
  createEmptyFilterState,
  type FilterState,
  type SortBy,
} from '../utils/filters';

import { getItemDisplayNameWithEnchantment } from '../utils/items';

// ============================================
// TIPOS
// ============================================

export interface UsePricesFilterOptions {
  items: MyItemPrice[];
  locale?: string;
}

export interface UsePricesFilterReturn {
  // Estado dos filtros
  filters: FilterState;

  // Valores únicos disponíveis
  uniqueItems: string[];
  availableCities: string[];
  availableQualities: number[];
  availableEnchantments: number[];
  availableTiers: (number | null)[];

  // Itens filtrados e ordenados
  filteredItems: MyItemPrice[];
  resultCount: number;

  // Ordenação
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;

  // Handlers de filtro - Item
  setSelectedItem: (item: string | undefined) => void;

  // Handlers de filtro - Cidades
  toggleCity: (city: string) => void;
  clearCities: () => void;
  selectAllCities: () => void;

  // Handlers de filtro - Qualidades
  toggleQuality: (quality: number) => void;
  clearQualities: () => void;
  selectAllQualities: () => void;

  // Handlers de filtro - Encantamentos
  toggleEnchantment: (enchant: number) => void;
  clearEnchantments: () => void;
  selectAllEnchantments: () => void;

  // Handlers de filtro - Tiers
  toggleTier: (tier: number | null) => void;
  clearTiers: () => void;
  selectAllTiers: () => void;

  // Busca por texto
  setSearchQuery: (query: string) => void;

  // Limpar tudo
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function usePricesFilter(options: UsePricesFilterOptions): UsePricesFilterReturn {
  const { items, locale = 'pt-BR' } = options;
  const { i18n } = useTranslation();

  // Estado dos filtros principais
  const [selectedItem, setSelectedItem] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('price');

  // Usar os hooks de toggle para gerenciar Sets
  const {
    set: selectedCities,
    toggle: toggleCity,
    clear: clearCities,
    add: addCities,
  } = useToggleSet<string>();

  const {
    set: selectedQualities,
    toggle: toggleQuality,
    clear: clearQualities,
    add: addQualities,
  } = useToggleSet<number>();

  const {
    set: selectedEnchantments,
    toggle: toggleEnchantment,
    clear: clearEnchantments,
    add: addEnchantments,
  } = useToggleSet<number>();

  const {
    set: selectedTiers,
    toggle: toggleTier,
    clear: clearTiers,
    add: addTiers,
  } = useToggleSet<number | null>();

  // Extrair valores únicos disponíveis
  const uniqueItems = useMemo(
    () =>
      extractUniqueItems(items).sort((a, b) =>
        getItemDisplayNameWithEnchantment(a, i18n.language as 'pt-BR' | 'en-US').localeCompare(
          getItemDisplayNameWithEnchantment(b, i18n.language as 'pt-BR' | 'en-US'),
          i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'
        )
      ),
    [items, i18n.language]
  );

  const availableCities = useMemo(
    () => extractCities(items),
    [items]
  );

  const availableQualities = useMemo(
    () => extractQualities(items),
    [items]
  );

  const availableEnchantments = useMemo(
    () => extractEnchantments(items),
    [items]
  );

  const availableTiers = useMemo(
    () => extractTiers(items),
    [items]
  );

  // Construir estado de filtro
  const filters = useMemo<FilterState>(
    () => ({
      item: selectedItem,
      cities: selectedCities,
      qualities: selectedQualities,
      enchantments: selectedEnchantments,
      tiers: new Set<number>(
        Array.from(selectedTiers).filter(
          (tier): tier is number => tier !== null
        )
      ),
      searchQuery,
    }),
    [
      selectedItem,
      selectedCities,
      selectedQualities,
      selectedEnchantments,
      selectedTiers,
      searchQuery,
    ]
  );
  

  // Função customizada para exibir nomes
  const displayNameFn = (itemName: string) =>
    getItemDisplayNameWithEnchantment(
      itemName,
      i18n.language as 'pt-BR' | 'en-US'
    );

  // Aplicar filtros e ordenação
  const filteredItems = useMemo(
    () =>
      sortItems(
        applyFilters(items, filters, displayNameFn),
        sortBy,
        locale
      ),
    [items, filters, sortBy, locale, displayNameFn]
  );

  // Detectar mudança de idioma e limpar cache
  useEffect(() => {
    // Força re-render dos nomes quando idioma muda
  }, [i18n.language]);

  // Handlers de seleção múltipla
  const selectAllCities = () => addCities(availableCities);
  const selectAllQualities = () => addQualities(availableQualities);
  const selectAllEnchantments = () => addEnchantments(availableEnchantments);
  const selectAllTiers = () => addTiers(availableTiers);

  // Limpar todos os filtros
  const handleClearAllFilters = () => {
    const empty = createEmptyFilterState();
  
    setSelectedItem(empty.item);
    setSearchQuery(empty.searchQuery);
    clearCities();
    clearQualities();
    clearEnchantments();
    clearTiers();
    setSortBy('price');
  };
  

  // Verificar se tem filtros ativos
  const isFiltered = hasActiveFilters(filters) || sortBy !== 'price';

  return {
    // Estado
    filters,

    // Valores disponíveis
    uniqueItems,
    availableCities,
    availableQualities,
    availableEnchantments,
    availableTiers,

    // Resultados
    filteredItems,
    resultCount: filteredItems.length,

    // Ordenação
    sortBy,
    setSortBy,

    // Item selecionado
    setSelectedItem,

    // Cidades
    toggleCity,
    clearCities,
    selectAllCities,

    // Qualidades
    toggleQuality,
    clearQualities,
    selectAllQualities,

    // Encantamentos
    toggleEnchantment,
    clearEnchantments,
    selectAllEnchantments,

    // Tiers
    toggleTier,
    clearTiers,
    selectAllTiers,

    // Busca
    setSearchQuery,

    // Limpar tudo
    clearAllFilters: handleClearAllFilters,
    hasActiveFilters: isFiltered,
  };
}