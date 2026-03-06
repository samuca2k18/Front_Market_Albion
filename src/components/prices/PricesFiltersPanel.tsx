/**
 * Painel de filtros da PricesPage - Versão shadcn UI
 */
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { FilterGroup } from './FilterGroup';
import { getQualityLabel } from '../../constants/qualities';
import type { UsePricesFilterReturn } from "../../hooks/usePricesFilter";
import { getItemDisplayNameWithEnchantment, getItemDisplayNameWithEnchantmentAsync } from "../../utils/items";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, Eraser } from "lucide-react";

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
        filter.uniqueItems.map(async (itemName: string) => {
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
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm mb-8">
      <CardHeader className="pb-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            {t('common.filters')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive group transition-all"
            onClick={filter.clearAllFilters}
            disabled={!filter.hasActiveFilters}
          >
            <Eraser size={14} className="mr-2 opacity-50 group-hover:opacity-100" />
            {t('prices.clearFilters')}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        {/* Top Row: Search and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">
              {t('prices.searchItem')}
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder={t('prices.searchPlaceholder')}
                value={filter.filters.searchQuery}
                onChange={(e) => filter.setSearchQuery(e.target.value)}
                className="pl-10 bg-background/40 border-border/40 focus:ring-primary/40 focus:border-primary/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1">
              {t('prices.selectItem')}
            </label>
            <Select
              value={filter.filters.item || 'all'}
              onValueChange={(val) => filter.setSelectedItem(val === 'all' ? undefined : val)}
            >
              <SelectTrigger className="bg-background/40 border-border/40">
                <SelectValue placeholder={t('prices.allItems')} />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                <SelectItem value="all" className="font-bold">{t('prices.allItems')}</SelectItem>
                {filter.uniqueItems.map((itemName: string) => (
                  <SelectItem key={itemName} value={itemName}>
                    {labelsMap[itemName] ?? getItemDisplayNameWithEnchantment(itemName, i18n.language as 'pt-BR' | 'en-US')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 pl-1 flex items-center gap-1">
              <SortAsc size={10} />
              {t('prices.sortBy')}
            </label>
            <Select
              value={filter.sortBy}
              onValueChange={(val) => filter.setSortBy(val as any)}
            >
              <SelectTrigger className="bg-background/40 border-border/40 font-bold uppercase tracking-wider text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-border/60">
                <SelectItem value="price" className="text-xs font-bold uppercase tracking-widest">{t('prices.priceAsc')}</SelectItem>
                <SelectItem value="city" className="text-xs font-bold uppercase tracking-widest">{t('prices.city')}</SelectItem>
                <SelectItem value="name" className="text-xs font-bold uppercase tracking-widest">{t('prices.itemName')}</SelectItem>
                <SelectItem value="quality" className="text-xs font-bold uppercase tracking-widest">{t('prices.table.quality')}</SelectItem>
                <SelectItem value="enchantment" className="text-xs font-bold uppercase tracking-widest">{t('prices.table.enchantment')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Detailed Filters Grid */}
        <div className="grid grid-cols-1 gap-8 pt-4 border-t border-border/10">
          <FilterGroup
            title={t('prices.filterByCity')}
            items={filter.availableCities.map((city: string) => ({
              id: city,
              label: city,
            }))}
            selectedIds={filter.filters.cities}
            onToggle={(id) => filter.toggleCity(id as string)}
            onSelectAll={filter.selectAllCities}
            onClear={filter.clearCities}
          />

          <FilterGroup
            title={t('prices.filterByQuality')}
            items={filter.availableQualities.map((quality: number) => ({
              id: quality,
              label: getQualityLabel(quality),
            }))}
            selectedIds={filter.filters.qualities}
            onToggle={(id) => filter.toggleQuality(Number(id))}
            onSelectAll={filter.selectAllQualities}
            onClear={filter.clearQualities}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FilterGroup
              title={t('prices.filterByEnchantment')}
              items={filter.availableEnchantments.map((enchant: number) => ({
                id: enchant,
                label: enchant === 0 ? t('prices.noEnchantment') : `@${enchant}`,
              }))}
              selectedIds={filter.filters.enchantments}
              onToggle={(id) => filter.toggleEnchantment(Number(id))}
              onSelectAll={filter.selectAllEnchantments}
              onClear={filter.clearEnchantments}
            />

            <FilterGroup
              title={t('dashboard.tier')}
              items={filter.availableTiers.map((tier: number | null) => ({
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
        </div>
      </CardContent>
    </Card>
  );
}
