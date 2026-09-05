// src/pages/dashboard/DashboardPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


import { searchItems } from "@/api/albion";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";

import { useDashboardItems } from "./hooks/useDashboardItems";
import { useDashboardPrices } from "./hooks/useDashboardPrices";
import { usePriceHistory } from "./hooks/usePriceHistory";
import { useLivePrices } from "./hooks/useLivePrices";
import { useRegion } from "@/context/RegionContext";

import { QuickSummary } from "./components/QuickSummary";
import { AddItemForm } from "./components/AddItemForm";
import { GoldPriceCard } from "./components/GoldPriceCard";
import { fetchArbitrageOpportunities } from "@/api/albion";
import { useQuery } from "@tanstack/react-query";
import { ItemsListSection } from "./components/ItemsListSection";
import { PricesTableSection } from "./components/PricesTableSection";
import { PriceHistoryChart } from "./components/PriceHistoryChart";
import { PriceAlertsSection } from "./components/PriceAlertsSection";
import { SEO } from "@/components/SEO";

import { splitItemName } from "./utils/itemFilters";


export function DashboardPage() {
  const { t, i18n } = useTranslation();


  const [itemNamesCache, setItemNamesCache] = useState<Map<string, string>>(
    () => new Map(),
  );

  // Locale amigável pro toLocaleString
  const locale =
    i18n.language === "pt"
      ? "pt-BR"
      : i18n.language === "en"
        ? "en-US"
        : i18n.language || "en-US";

  const { region } = useRegion();

  // Hooks de dados
  const {
    trackedItems,
    itemsQueryIsLoading,
    itemsQueryIsError,
    itemsQueryErrorMessage,
    refetchItems,
    createMutation,
    selectedItems,
    isDeleting,
    handleDeleteSingle,
    handleToggleSelect,
    handleSelectAll,
    reorderMutation,
    handleDeleteSelected,
  } = useDashboardItems();

  const findTrackedIndexByItemName = (targetName: string) => {
    const normalizedTarget = targetName.toUpperCase();
    const exactIndex = trackedItems.findIndex(
      (item) => item.item_name.toUpperCase() === normalizedTarget,
    );
    if (exactIndex !== -1) return exactIndex;

    const baseTarget = targetName.split("@")[0].toUpperCase();
    return trackedItems.findIndex(
      (item) => item.item_name.split("@")[0].toUpperCase() === baseTarget,
    );
  };

  const handleReorderItem = (draggedItemName: string, targetItemName: string) => {
    const draggedIdx = findTrackedIndexByItemName(draggedItemName);
    const targetIdx = findTrackedIndexByItemName(targetItemName);

    if (draggedIdx === -1 || targetIdx === -1 || draggedIdx === targetIdx) return;

    const newItems = [...trackedItems];
    const [removed] = newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, removed);

    const payload = newItems.map((item, index) => ({
      id: item.id,
      sort_order: index + 1,
    }));

    reorderMutation.mutate(payload);
  };

  const {
    myPricesQuery,
    myPrices,
    selectedTier,
    setSelectedTier,
  } = useDashboardPrices(trackedItems);

  const arbitrageQuery = useQuery({
    queryKey: ["arbitrage-summary", region],
    queryFn: () => fetchArbitrageOpportunities(region),
    refetchInterval: 1000 * 60 * 10, // 10 min é suficiente pro dashboard
  });

  const {
    selectedHistoryItem,
    setSelectedHistoryItem,
    historyQuery,
    chartData,
  } = usePriceHistory(locale);

  const { updates: liveUpdates, nowTs, recentUpdateCount } = useLivePrices(
    trackedItems.map((item) => item.item_name),
    myPrices.map((entry) => entry.city),
  );

  // Cache de nomes traduzidos
  useEffect(() => {
    const fetchNames = async () => {
      const bases = Array.from(
        new Set([
          ...myPrices.map((p) => p.item_name.split("@")[0]),
          ...trackedItems.map((t) => t.item_name.split("@")[0]),
        ]),
      );

      const missing = bases.filter(
        (base) => !itemNamesCache.has(`${i18n.language}:${base}`),
      );
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (base) => {
          try {
            const items = await searchItems(base, i18n.language as "pt-BR" | "en-US");
            const item = items.find((i) => i.unique_name === base);

            if (item) {
              const name =
                i18n.language.startsWith("pt")
                  ? item.name_pt || item.name_en || base
                  : item.name_en || item.name_pt || base;

              return { base, name };
            }
          } catch {
            // ignora erro
          }
          return null;
        }),
      );

      const valid = results.filter(
        (r): r is { base: string; name: string } => r !== null,
      );

      if (valid.length > 0) {
        setItemNamesCache((prev) => {
          const next = new Map(prev);
          valid.forEach(({ base, name }) => {
            next.set(`${i18n.language}:${base}`, name);
          });
          return next;
        });
      }
    };

    if (myPrices.length > 0 || trackedItems.length > 0) {
      void fetchNames();
    }
  }, [myPrices, trackedItems, i18n.language, itemNamesCache]);

  const getItemDisplayName = (name: string): string => {
    const { base, enchant } = splitItemName(name);
    const cached = itemNamesCache.get(`${i18n.language}:${base}`);
    const display = cached ?? getItemDisplayNameWithEnchantment(base);
    return enchant ? `${display} @${enchant}` : display;
  };

  return (
    <div className="bg-background">
      <SEO title={t("navigation.dashboard")} />
      <div className="app-container py-8 space-y-10">
        {/* Resumo em largura total — evita ficar miúdo numa coluna de 1/3 */}
        <section>
          <QuickSummary
            trackedCount={trackedItems.length}
            activePricesCount={myPrices.length}
            opportunityCount={arbitrageQuery.data?.length || 0}
            liveBumpsCount={recentUpdateCount}
          />
        </section>

        {/* Gold + adicionar item */}
        <section className="grid gap-6 lg:grid-cols-2">
          <GoldPriceCard region={region} />
          <AddItemForm createMutation={createMutation} />
        </section>

        {/* Bottom: lista + preços / gráfico + alertas */}
        <section className="grid gap-6 lg:grid-cols-5 items-start pb-8">
          {/* Itens cadastrados */}
          <div className="lg:col-span-2 space-y-6">
            <ItemsListSection
              trackedItems={trackedItems}
              isItemsLoading={itemsQueryIsLoading}
              itemsErrorMessage={itemsQueryIsError ? itemsQueryErrorMessage : null}
              selectedItems={selectedItems}
              locale={locale}
              isDeleting={isDeleting}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              onDeleteSingle={handleDeleteSingle}
              onRetryLoadItems={refetchItems}
              getItemDisplayName={getItemDisplayName}
            />

            <PriceAlertsSection />
          </div>

          {/* Preços em tempo real + histórico */}
          <div className="lg:col-span-3">
            <PricesTableSection
              myPrices={myPrices}
              myPricesQueryIsLoading={myPricesQuery.isLoading}
              myPricesQueryIsError={myPricesQuery.isError}
              locale={locale}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              onSelectHistoryItem={(itemName) => setSelectedHistoryItem(itemName)}
              onReorderItem={handleReorderItem}
              liveUpdates={liveUpdates}
              nowTs={nowTs}
            />

            <PriceHistoryChart
              selectedHistoryItem={selectedHistoryItem}
              chartData={chartData}
              historyQuery={historyQuery}
              getItemDisplayName={getItemDisplayName}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
