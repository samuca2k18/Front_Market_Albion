import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Factory,
  Flame,
  Hammer,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";

import { fetchAlbionPrices } from "@/api/albion";
import {
  fetchConsumableCraftings,
  fetchConsumables,
  getOpenAlbionUniqueName,
} from "@/api/catalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/context/RegionContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getItemDisplayNameWithEnchantment, getItemImageUrl } from "@/utils/items";

const CITIES = [
  "Bridgewatch",
  "Caerleon",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
];

function getUnitPriceByCity(
  entries: { item_id?: string; city: string; sell_price_min: number }[],
  itemId: string,
  city: string,
): number {
  const candidates = entries.filter(
    (entry) => entry.item_id === itemId && entry.city === city && entry.sell_price_min > 0,
  );
  if (candidates.length === 0) return 0;
  return candidates.reduce(
    (acc, row) => (row.sell_price_min < acc ? row.sell_price_min : acc),
    candidates[0].sell_price_min,
  );
}

export function CraftingPage() {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();

  const [searchTerm, setSearchTerm] = useState("");
  // Debounce para evitar re-renders a cada tecla
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedConsumableId, setSelectedConsumableId] = useState<number | null>(null);
  // Cidades independentes: compra dos materiais vs venda do produto
  const [cityBuy, setCityBuy] = useState("Caerleon");
  const [citySell, setCitySell] = useState("Caerleon");
  const [focusReturnPct, setFocusReturnPct] = useState(0);
  // journalBonusPct: percentual dos materiais economizados pelos diários (≠ multiplicador de yield)
  const [journalBonusPct, setJournalBonusPct] = useState(0);
  const [marketTaxPct, setMarketTaxPct] = useState(6.5);
  const [craftingFee, setCraftingFee] = useState(0);

  const numberLocale = useMemo(
    () => (i18n.language.startsWith("pt") ? "pt-BR" : "en-US"),
    [i18n.language],
  );

  const consumablesQuery = useQuery({
    queryKey: ["crafting-consumables"],
    queryFn: () => fetchConsumables(),
    staleTime: 1000 * 60 * 60,
  });

  const consumables = consumablesQuery.data?.data ?? [];
  const filteredConsumables = (() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return consumables.slice(0, 18);

    return consumables
      .filter((item) => {
        const base = item.name.toLowerCase();
        const unique = getOpenAlbionUniqueName(item).toLowerCase();
        return base.includes(query) || unique.includes(query);
      })
      .slice(0, 18);
  })();

  const selectedConsumable = consumables.find((item) => item.id === selectedConsumableId);
  const selectedUniqueName = selectedConsumable
    ? getOpenAlbionUniqueName(selectedConsumable)
    : "";

  const recipeQuery = useQuery({
    queryKey: ["crafting-recipe", selectedConsumableId],
    queryFn: () => fetchConsumableCraftings(selectedConsumableId!),
    enabled: Boolean(selectedConsumableId),
    staleTime: 1000 * 60 * 60,
  });

  const recipe = recipeQuery.data?.data?.[0];
  const materialIds = recipe?.materials.map((mat) => mat.resource) ?? [];

  // Busca preços das duas cidades de uma vez
  const allCities = Array.from(new Set([cityBuy, citySell]));
  const itemNamesToPrice = Array.from(
    new Set([selectedUniqueName, ...materialIds].filter((value): value is string => Boolean(value))),
  );

  const pricesQuery = useQuery({
    queryKey: ["crafting-prices", region, allCities.join(","), itemNamesToPrice.join(",")],
    queryFn: () => fetchAlbionPrices(itemNamesToPrice, allCities, undefined, region),
    enabled: itemNamesToPrice.length > 0,
    staleTime: 1000 * 60 * 3,
  });

  const calculation =
    recipe && selectedUniqueName && pricesQuery.data
      ? (() => {
          const entries = pricesQuery.data.all_data;
          const materialRows = recipe.materials.map((material) => {
            const unitPrice = getUnitPriceByCity(entries, material.resource, cityBuy);
            const totalCost = unitPrice * material.amount;
            return {
              ...material,
              unitPrice,
              totalCost,
            };
          });

          const rawMaterialCost = materialRows.reduce((sum, row) => sum + row.totalCost, 0);
          // Foco reduz o custo dos materiais consumidos
          const focusMultiplier = Math.max(0, 1 - focusReturnPct / 100);
          // Diários economizam materiais (redução adicional no custo, não no yield)
          const journalMultiplier = Math.max(0, 1 - journalBonusPct / 100);
          const effectiveMaterialCost = rawMaterialCost * focusMultiplier * journalMultiplier;

          // Economia dos diários em prata (para exibição)
          const journalSavings = rawMaterialCost * focusMultiplier - effectiveMaterialCost;

          // Preço de venda na cidade de venda (citySell)
          const saleUnitPrice = getUnitPriceByCity(entries, selectedUniqueName, citySell);
          // Yield é fixo — diários não multiplicam o produto fabricado no Albion
          const effectiveYield = recipe.yield_amount;
          const grossRevenue = saleUnitPrice * effectiveYield;
          const netRevenue = grossRevenue * (1 - marketTaxPct / 100);

          const profit = netRevenue - effectiveMaterialCost - craftingFee;
          const roi = effectiveMaterialCost > 0 ? (profit / effectiveMaterialCost) * 100 : 0;

          return {
            materialRows,
            rawMaterialCost,
            effectiveMaterialCost,
            journalSavings,
            saleUnitPrice,
            effectiveYield,
            grossRevenue,
            netRevenue,
            profit,
            roi,
          };
        })()
      : null;

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight lg:text-4xl">
          <Hammer className="h-8 w-8 text-primary" />
          {t("crafting.title")}
        </h1>
        <p className="font-medium text-muted-foreground">{t("crafting.subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/40 shadow-xl backdrop-blur-md">
            <CardHeader className="border-b border-border/20 bg-muted/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                <Search className="h-4 w-4 text-primary" />
                {t("crafting.searchCardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <Input
                placeholder={t("crafting.searchPlaceholder")}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="border-border/40 bg-background/60 font-mono text-sm"
              />

              <div className="custom-scrollbar max-h-[440px] space-y-2 overflow-y-auto pr-2">
                {consumablesQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                    ))
                  : filteredConsumables.map((item) => {
                      const uniqueName = getOpenAlbionUniqueName(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedConsumableId(item.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border p-3 transition-all ${
                            selectedConsumableId === item.id
                              ? "border-primary/40 bg-primary/10 shadow-sm"
                              : "border-border/20 bg-background/40 hover:bg-background/80"
                          }`}
                        >
                          <div className="rounded-xl bg-black/30 p-1.5">
                            <img
                              src={getItemImageUrl(uniqueName || item.name)}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-black">
                              {getItemDisplayNameWithEnchantment(item.name)}
                            </p>
                            <p className="truncate font-mono text-[10px] text-muted-foreground">
                              {uniqueName || item.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          {!selectedConsumableId ? (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/40 bg-card/20 p-12 text-center">
              <Factory className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-xl font-black text-foreground">
                {t("crafting.emptyStateTitle")}
              </h3>
              <p className="text-muted-foreground">{t("crafting.emptyStateDescription")}</p>
            </div>
          ) : recipeQuery.isLoading || pricesQuery.isLoading ? (
            <div className="rounded-3xl border border-border/20 bg-card/10 p-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
              <p className="animate-pulse font-bold uppercase tracking-widest text-muted-foreground">
                {t("crafting.loadingMessage")}
              </p>
            </div>
          ) : !recipe ? (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-12 text-center">
              <Hammer className="mb-4 h-14 w-14 text-amber-500/40" />
              <h3 className="mb-2 text-xl font-black text-foreground">
                {t("crafting.recipeUnavailableTitle")}
              </h3>
              <p className="mb-3 max-w-md text-sm font-medium text-muted-foreground">
                {t("crafting.recipeUnavailableDescription")}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-500/80">
                {t("crafting.noRecipeFound")}
              </p>
            </div>
          ) : !calculation ? (
            <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/5 p-12 text-center">
              <p className="font-bold text-red-400">{t("crafting.calculationError")}</p>
            </div>
          ) : (
            <>
              <Card className="overflow-hidden rounded-3xl border border-border/40 bg-card/60 shadow-2xl backdrop-blur-xl">
                <CardContent className="grid gap-4 p-6 md:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-border/20 bg-black/40 p-3">
                      <img
                        src={getItemImageUrl(selectedUniqueName || selectedConsumable?.name || "")}
                        alt=""
                        className="h-16 w-16 object-contain"
                      />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="mb-2 border-primary/20 bg-primary/10 text-primary"
                      >
                        {t("crafting.yieldBaseBadge", { value: recipe.yield_amount })}
                      </Badge>
                      <h2 className="text-2xl font-black">
                        {getItemDisplayNameWithEnchantment(selectedConsumable?.name || "")}
                      </h2>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {selectedUniqueName || t("crafting.noUniqueName")}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Cidade de Compra */}
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.cityBuy")}
                      <select
                        value={cityBuy}
                        onChange={(event) => setCityBuy(event.target.value)}
                        className="h-10 w-full rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Cidade de Venda */}
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.citySell")}
                      <select
                        value={citySell}
                        onChange={(event) => setCitySell(event.target.value)}
                        className="h-10 w-full rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.focusReturnPct")}
                      <Input
                        type="number"
                        min={0}
                        max={90}
                        value={focusReturnPct}
                        onChange={(event) => setFocusReturnPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.journalBonusPct")}
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={journalBonusPct}
                        onChange={(event) => setJournalBonusPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.marketTaxPct")}
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        value={marketTaxPct}
                        onChange={(event) => setMarketTaxPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.craftingFee")}
                      <Input
                        type="number"
                        min={0}
                        value={craftingFee}
                        onChange={(event) => setCraftingFee(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-border/40 bg-card/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {t("crafting.materialTreeTitle", { city: cityBuy })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calculation.materialRows.map((material) => (
                      <div
                        key={`${material.resource}-${material.id}`}
                        className="flex items-center justify-between rounded-2xl border border-border/20 bg-background/40 px-3 py-2"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <img
                            src={getItemImageUrl(material.resource)}
                            className="w-8 rounded-lg bg-black/40 outline outline-1 outline-border/40"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black">
                              {material.amount}x {getItemDisplayNameWithEnchantment(material.resource)}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {material.unitPrice > 0
                                ? t("crafting.unitPricePerUnit", {
                                    value: material.unitPrice.toLocaleString(numberLocale),
                                  })
                                : t("crafting.noCityPrice")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-orange-400">
                          {material.totalCost.toLocaleString(numberLocale)} Ag
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/40 bg-card/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      {t("crafting.financialResultTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("crafting.metrics.baseMaterialCost")}</span>
                      <strong>{calculation.rawMaterialCost.toLocaleString(numberLocale)} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("crafting.metrics.focusAdjustedCost")}</span>
                      <strong>{calculation.effectiveMaterialCost.toLocaleString(numberLocale)} Ag</strong>
                    </div>
                    {calculation.journalSavings > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t("crafting.metrics.journalSavings")}</span>
                        <strong className="text-sky-400">
                          -{calculation.journalSavings.toLocaleString(numberLocale)} Ag
                        </strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.saleUnitPrice", { city: citySell })}
                      </span>
                      <strong>{calculation.saleUnitPrice.toLocaleString(numberLocale)} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("crafting.metrics.netRevenue")}</span>
                      <strong>{calculation.netRevenue.toLocaleString(numberLocale)} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t("crafting.metrics.craftingFee")}</span>
                      <strong>{craftingFee.toLocaleString(numberLocale)} Ag</strong>
                    </div>

                    <div className="flex items-end justify-between border-t border-border/30 pt-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {t("crafting.metrics.estimatedProfit")}
                        </p>
                        <p
                          className={`text-3xl font-black tracking-tight ${
                            calculation.profit >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {calculation.profit >= 0 ? "+" : ""}
                          {calculation.profit.toLocaleString(numberLocale)}
                        </p>
                      </div>
                      <Badge
                        className={
                          calculation.roi >= 0
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }
                      >
                        {t("crafting.metrics.roiPrefix")} {calculation.roi >= 0 ? "+" : ""}
                        {calculation.roi.toFixed(2)}%
                      </Badge>
                    </div>

                    <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                      {t("crafting.regionNotice", { region, cityBuy, citySell })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}