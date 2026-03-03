// src/pages/dashboard/DashboardPage.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


import { searchItems } from "@/api/albion";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";

import { useDashboardItems } from "./hooks/useDashboardItems";
import { useDashboardPrices } from "./hooks/useDashboardPrices";
import { usePriceHistory } from "./hooks/usePriceHistory";
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

import { splitItemName } from "./utils/itemFilters";


export function DashboardPage() {
  const { i18n } = useTranslation();


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

  // Quando muda idioma, limpa cache para recarregar nomes
  useEffect(() => {
    setItemNamesCache(new Map());
  }, [i18n.language]);

  const { region } = useRegion();

  // Hooks de dados
  const {
    trackedItems,
    createMutation,
    selectedItems,
    isDeleting,
    handleDeleteSingle,
    handleToggleSelect,
    handleSelectAll,
    handleDeleteSelected,
  } = useDashboardItems();

  const {
    myPricesQuery,
    myPrices,
    selectedTier,
    setSelectedTier,
  } = useDashboardPrices();

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

  // Cache de nomes traduzidos
  useEffect(() => {
    const fetchNames = async () => {
      const bases = Array.from(
        new Set([
          ...myPrices.map((p) => p.item_name.split("@")[0]),
          ...trackedItems.map((t) => t.item_name.split("@")[0]),
        ]),
      );

      const missing = bases.filter((b) => !itemNamesCache.has(b));
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
          valid.forEach(({ base, name }) => next.set(base, name));
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
    const cached = itemNamesCache.get(base);
    const display = cached ?? getItemDisplayNameWithEnchantment(base);
    return enchant ? `${display} @${enchant}` : display;
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top: Resumo + Ouro + Adicionar item */}
        <section className="grid gap-6 md:grid-cols-3">
          <QuickSummary
            trackedCount={trackedItems.length}
            activePricesCount={myPrices.length}
            opportunityCount={arbitrageQuery.data?.length || 0}
          />

          <GoldPriceCard region={region} />

          <AddItemForm createMutation={createMutation} />
        </section>

        {/* Bottom: lista + preços / gráfico + alertas */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Itens cadastrados */}
          <div className="lg:col-span-1 space-y-6">
            <ItemsListSection
              trackedItems={trackedItems}
              selectedItems={selectedItems}
              locale={locale}
              isDeleting={isDeleting}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              onDeleteSingle={handleDeleteSingle}
            />

            <PriceAlertsSection />
          </div>

          {/* Preços em tempo real + histórico */}
          <div className="lg:col-span-2">
            <PricesTableSection
              myPrices={myPrices}
              myPricesQueryIsLoading={myPricesQuery.isLoading}
              myPricesQueryIsError={myPricesQuery.isError}
              locale={locale}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
              onSelectHistoryItem={(itemName) =>
                setSelectedHistoryItem(itemName)
              }
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
