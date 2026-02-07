/**
 * Painel de filtros da PricesPage
 */

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { FilterGroup } from './FilterGroup';
import { getQualityLabel } from '../../constants/qualities'
import type { UsePricesFilterReturn } from "hooks/usePricesFilter"
import { getItemDisplayNameWithEnchantment, getItemDisplayNameWithEnchantmentAsync } from "../../utils/items";
import '../prices/PricesPage.css';

interface PricesFiltersPanelProps {
  filter: UsePricesFilterReturn;
}

export function PricesFiltersPanel({ filter }: PricesFiltersPanelProps) {
  const { t, i18n } = useTranslation();
  const [labelsMap, setLabelsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const entries = await Promise.all(
        filter.uniqueItems.map(async (itemName) => {
          try {
            const label = await getItemDisplayNameWithEnchantmentAsync(
              itemName,
              i18n.language as 'pt-BR' | 'en-US'
            );
            return [itemName, label] as const;
          } catch {
            return [itemName, getItemDisplayNameWithEnchantment(itemName, i18n.language as 'pt-BR' | 'en-US')] as const;
          }
        })
      );
      if (!cancelled) {
        setLabelsMap(Object.fromEntries(entries));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [filter.uniqueItems, i18n.language]);

  return (
    <div className="prices-filters">
      {/* Top Row: Item Selector, Search, Sort */}
      <div className="filters-row">
        <label className="filter-group">
          <span>{t('prices.selectItem')}</span>
          <select
            value={filter.filters.item || ''}
            onChange={(e) => filter.setSelectedItem(e.target.value || undefined)}
          >
            <option value="">{t('prices.allItems')}</option>
            {filter.uniqueItems.map((itemName) => (
              <option key={itemName} value={itemName}>
                {labelsMap[itemName] ?? getItemDisplayNameWithEnchantment(itemName, i18n.language as 'pt-BR' | 'en-US')}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>{t('prices.searchItem')}</span>
          <input
            type="search"
            placeholder={t('prices.searchPlaceholder')}
            value={filter.filters.searchQuery}
            onChange={(e) => filter.setSearchQuery(e.target.value)}
          />
        </label>

        <label className="filter-group">
          <span>{t('prices.sortBy')}</span>
          <select
            value={filter.sortBy}
            onChange={(e) => filter.setSortBy(e.target.value as any)}
          >
            <option value="price">{t('prices.priceAsc')}</option>
            <option value="city">{t('prices.city')}</option>
            <option value="name">{t('prices.itemName')}</option>
            <option value="quality">{t('prices.table.quality')}</option>
            <option value="enchantment">{t('prices.table.enchantment')}</option>
          </select>
        </label>

        <button
          className="btn btn-secondary"
          onClick={filter.clearAllFilters}
          disabled={!filter.hasActiveFilters}
        >
          {t('prices.clearFilters')}
        </button>
      </div>

      {/* Cities Filter */}
      <FilterGroup
        title={t('prices.filterByCity')}
        items={filter.availableCities.map((city) => ({
          id: city,
          label: city,
        }))}
        selectedIds={filter.filters.cities}
        onToggle={(id) => filter.toggleCity(id as string)}
        onSelectAll={filter.selectAllCities}
        onClear={filter.clearCities}
      />

      {/* Qualities Filter */}
      <FilterGroup
        title={t('prices.filterByQuality')}
        items={filter.availableQualities.map((quality) => ({
          id: quality,
          label: getQualityLabel(quality),
        }))}
        selectedIds={filter.filters.qualities}
        onToggle={(id) => filter.toggleQuality(Number(id))}
        onSelectAll={filter.selectAllQualities}
        onClear={filter.clearQualities}
      />

      {/* Enchantments Filter */}
      <FilterGroup
        title={t('prices.filterByEnchantment')}
        items={filter.availableEnchantments.map((enchant) => ({
          id: enchant,
          label: enchant === 0 ? t('prices.noEnchantment') : `@${enchant}`,
        }))}
        selectedIds={filter.filters.enchantments}
        onToggle={(id) => filter.toggleEnchantment(Number(id))}
        onSelectAll={filter.selectAllEnchantments}
        onClear={filter.clearEnchantments}
      />

      {/* Tiers Filter (Bonus) */}
      <FilterGroup
        title={t('dashboard.tier')}
        items={filter.availableTiers.map((tier) => ({
          id: tier ?? 'none',
          label: tier === null ? t('dashboard.noTier') : `T${tier}`,
        }))}
        selectedIds={filter.filters.tiers}
        onToggle={(id) =>
          filter.toggleTier(id === 'none' ? null : (id as number))
        }
        onSelectAll={filter.selectAllTiers}
        onClear={filter.clearTiers}
      />
    </div>
  );
}
