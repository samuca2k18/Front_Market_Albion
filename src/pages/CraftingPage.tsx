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
  Clock,
  Trophy,
  Sparkles,
} from "lucide-react";

import { searchItems } from "@/api/albion";
import { fetchCraftProfit, fetchCraftRecipe, fetchCraftTop } from "@/api/craft";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRegion } from "@/context/RegionContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getItemImageUrl } from "@/utils/items";
import { RefinePanel } from "@/pages/crafting/RefinePanel";

const BUY_CITIES = [
  "Bridgewatch",
  "Caerleon",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
];

const SELL_CITIES = [...BUY_CITIES, "Black Market"];

function DataAgeBadge({
  hours,
  t,
  compact = false,
}: {
  hours: number | null | undefined;
  t: (k: string, o?: Record<string, unknown>) => string;
  compact?: boolean;
}) {
  const base =
    compact
      ? "shrink-0 max-w-[7.5rem] truncate px-1.5 py-0 text-[10px] leading-5"
      : "";
  if (hours == null) {
    return (
      <Badge
        variant="outline"
        className={`border-border/40 text-muted-foreground ${base}`}
      >
        {compact ? "?" : t("crafting.dataAge.unknown")}
      </Badge>
    );
  }
  const tone =
    hours < 1
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : hours < 6
        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
        : "border-red-500/40 bg-red-500/15 text-red-300";
  const label =
    hours < 1
      ? t("crafting.dataAge.fresh", { hours: hours.toFixed(1) })
      : hours < 6
        ? t("crafting.dataAge.ok", { hours: hours.toFixed(1) })
        : t("crafting.dataAge.stale", { hours: hours.toFixed(1) });
  const compactLabel = `${hours.toFixed(1)}h`;
  return (
    <Badge variant="outline" className={`gap-1 ${tone} ${base}`} title={label}>
      <Clock className={compact ? "h-2.5 w-2.5 shrink-0" : "h-3 w-3"} />
      <span className={compact ? "truncate" : undefined}>
        {compact ? compactLabel : label}
      </span>
    </Badge>
  );
}

function formatSilver(
  value: number | null | undefined,
  locale: string,
  missing: string,
): string {
  if (value == null || Number.isNaN(value)) return missing;
  return `${Math.round(value).toLocaleString(locale)} Ag`;
}

export function CraftingPage() {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedItem, setSelectedItem] = useState<{
    unique_name: string;
    name_pt: string;
    name_en: string;
  } | null>(null);

  const [cityBuy, setCityBuy] = useState("Caerleon");
  const [citySell, setCitySell] = useState("Black Market");
  const [focusReturnPct, setFocusReturnPct] = useState(36);
  const [journalBonusPct, setJournalBonusPct] = useState(0);
  const [marketTaxPct, setMarketTaxPct] = useState<number | "">( "");
  const [craftingFee, setCraftingFee] = useState(0);
  const [topSort, setTopSort] = useState<"profit" | "roi" | "silver_per_focus">("profit");
  const [activeTab, setActiveTab] = useState<"craft" | "refine">("craft");

  const numberLocale = useMemo(
    () => (i18n.language.startsWith("pt") ? "pt-BR" : "en-US"),
    [i18n.language],
  );
  const missingLabel = t("crafting.noData");

  const searchQuery = useQuery({
    queryKey: ["craft-search", debouncedSearch, i18n.language],
    queryFn: () =>
      searchItems(
        debouncedSearch,
        i18n.language.startsWith("en") ? "en-US" : "pt-BR",
      ),
    enabled: activeTab === "craft" && debouncedSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const recipeQuery = useQuery({
    queryKey: ["craft-recipe", selectedItem?.unique_name],
    queryFn: () => fetchCraftRecipe(selectedItem!.unique_name),
    enabled: activeTab === "craft" && Boolean(selectedItem?.unique_name),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const effectiveTax =
    marketTaxPct === ""
      ? citySell === "Black Market"
        ? 0
        : 6.5
      : Number(marketTaxPct);

  const profitQuery = useQuery({
    queryKey: [
      "craft-profit",
      selectedItem?.unique_name,
      region,
      cityBuy,
      citySell,
      focusReturnPct,
      journalBonusPct,
      effectiveTax,
      craftingFee,
    ],
    queryFn: () =>
      fetchCraftProfit({
        item: selectedItem!.unique_name,
        city_buy: cityBuy,
        city_sell: citySell,
        region,
        focus_return_pct: focusReturnPct,
        journal_bonus_pct: journalBonusPct,
        market_tax_pct: effectiveTax,
        crafting_fee: craftingFee,
      }),
    enabled:
      activeTab === "craft" &&
      Boolean(selectedItem?.unique_name) &&
      recipeQuery.isSuccess,
    staleTime: 1000 * 60 * 2,
  });

  const topQuery = useQuery({
    queryKey: [
      "craft-top",
      region,
      cityBuy,
      citySell,
      focusReturnPct,
      journalBonusPct,
      effectiveTax,
      craftingFee,
      topSort,
    ],
    queryFn: () =>
      fetchCraftTop({
        city_buy: cityBuy,
        city_sell: citySell,
        region,
        focus_return_pct: focusReturnPct,
        journal_bonus_pct: journalBonusPct,
        market_tax_pct: effectiveTax,
        crafting_fee: craftingFee,
        limit: 12,
        scan_limit: 180,
        sort_by: topSort,
      }),
    enabled: activeTab === "craft",
    staleTime: 1000 * 60 * 5,
  });

  const displayName = (pt: string, en: string, fallback: string) =>
    i18n.language.startsWith("en") ? en || fallback : pt || fallback;

  const searchResults = searchQuery.data ?? [];
  const profit = profitQuery.data;

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight lg:text-4xl">
            <Hammer className="h-8 w-8 text-primary" />
            {t("crafting.title")}
          </h1>
          <p className="font-medium text-muted-foreground">{t("crafting.subtitle")}</p>
        </div>
        {profit && activeTab === "craft" && (
          <DataAgeBadge hours={profit.data_age_hours} t={t} />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeTab === "craft" ? "default" : "ghost"}
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => setActiveTab("craft")}
        >
          {t("crafting.tabs.craft")}
        </Button>
        <Button
          size="sm"
          variant={activeTab === "refine" ? "default" : "ghost"}
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => setActiveTab("refine")}
        >
          {t("crafting.tabs.refine")}
        </Button>
      </div>

      {activeTab === "refine" ? (
        <RefinePanel />
      ) : (
      <>
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
                {debouncedSearch.trim().length < 2 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    {t("crafting.searchHint")}
                  </p>
                ) : searchQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                  ))
                ) : searchResults.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    {t("crafting.noSearchResults")}
                  </p>
                ) : (
                  searchResults.slice(0, 24).map((item) => (
                    <button
                      key={item.unique_name}
                      onClick={() =>
                        setSelectedItem({
                          unique_name: item.unique_name,
                          name_pt: item.name_pt,
                          name_en: item.name_en,
                        })
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 transition-all ${
                        selectedItem?.unique_name === item.unique_name
                          ? "border-primary/40 bg-primary/10 shadow-sm"
                          : "border-border/20 bg-background/40 hover:bg-background/80"
                      }`}
                    >
                      <div className="rounded-xl bg-black/30 p-1.5">
                        <img
                          src={getItemImageUrl(item.unique_name)}
                          alt=""
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-black">
                          {displayName(item.name_pt, item.name_en, item.unique_name)}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {item.unique_name}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          {!selectedItem ? (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/40 bg-card/20 p-12 text-center">
              <Factory className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-xl font-black text-foreground">
                {t("crafting.emptyStateTitle")}
              </h3>
              <p className="text-muted-foreground">{t("crafting.emptyStateDescription")}</p>
            </div>
          ) : recipeQuery.isLoading || profitQuery.isLoading ? (
            <div className="rounded-3xl border border-border/20 bg-card/10 p-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
              <p className="animate-pulse font-bold uppercase tracking-widest text-muted-foreground">
                {t("crafting.loadingMessage")}
              </p>
            </div>
          ) : recipeQuery.isError ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 p-12 text-center">
              <Hammer className="mb-4 h-14 w-14 text-amber-500/40" />
              <h3 className="mb-2 text-xl font-black">{t("crafting.recipeUnavailableTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("crafting.recipeUnavailableDescription")}
              </p>
            </div>
          ) : !profit ? (
            <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/5 p-12 text-center">
              <p className="font-bold text-red-400">{t("crafting.calculationError")}</p>
            </div>
          ) : (
            <>
              <Card className="overflow-hidden rounded-3xl border border-border/40 bg-card/60 shadow-2xl backdrop-blur-xl">
                <CardContent className="grid gap-6 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl border border-border/20 bg-black/40 p-3">
                        <img
                          src={getItemImageUrl(profit.item)}
                          alt=""
                          className="h-16 w-16 object-contain"
                        />
                      </div>
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-primary"
                          >
                            {t("crafting.enchantBadge", { value: profit.enchant })}
                          </Badge>
                          {profit.is_black_market && (
                            <Badge className="bg-violet-500/20 text-violet-300">
                              Black Market
                            </Badge>
                          )}
                          <DataAgeBadge hours={profit.data_age_hours} t={t} />
                        </div>
                        <h2 className="text-2xl font-black">
                          {displayName(profit.name_pt, profit.name_en, profit.item)}
                        </h2>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {profit.item}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.cityBuy")}
                      <select
                        value={cityBuy}
                        onChange={(e) => setCityBuy(e.target.value)}
                        className="h-10 w-full min-w-0 rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
                      >
                        {BUY_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.citySell")}
                      <select
                        value={citySell}
                        onChange={(e) => {
                          setCitySell(e.target.value);
                          if (e.target.value === "Black Market" && marketTaxPct === "") {
                            /* keep auto 0 */
                          }
                        }}
                        className="h-10 w-full min-w-0 rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
                      >
                        {SELL_CITIES.map((city) => (
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
                        onChange={(e) => setFocusReturnPct(Number(e.target.value || 0))}
                        className="w-full min-w-0 bg-background/70"
                      />
                    </label>
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.journalBonusPct")}
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={journalBonusPct}
                        onChange={(e) => setJournalBonusPct(Number(e.target.value || 0))}
                        className="w-full min-w-0 bg-background/70"
                      />
                    </label>
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.marketTaxPct")}
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        placeholder={citySell === "Black Market" ? "0" : "6.5"}
                        value={marketTaxPct}
                        onChange={(e) =>
                          setMarketTaxPct(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-full min-w-0 bg-background/70"
                      />
                    </label>
                    <label className="space-y-1 text-xs font-bold text-muted-foreground">
                      {t("crafting.labels.craftingFee")}
                      <Input
                        type="number"
                        min={0}
                        value={craftingFee}
                        onChange={(e) => setCraftingFee(Number(e.target.value || 0))}
                        className="w-full min-w-0 bg-background/70"
                      />
                    </label>
                  </div>

                  {profit.tax_note && (
                    <p className="text-[11px] text-violet-300/90">{profit.tax_note}</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-3xl border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("crafting.metrics.estimatedProfit")}
                    </p>
                    <p
                      className={`mt-1 text-3xl font-black ${
                        (profit.profit ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {profit.profit == null
                        ? missingLabel
                        : `${profit.profit >= 0 ? "+" : ""}${profit.profit.toLocaleString(numberLocale)}`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/40 bg-card/40">
                  <CardContent className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      ROI
                    </p>
                    <p className="mt-1 text-3xl font-black">
                      {profit.roi == null
                        ? missingLabel
                        : `${profit.roi >= 0 ? "+" : ""}${profit.roi.toFixed(1)}%`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/40 bg-card/40">
                  <CardContent className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("crafting.metrics.silverPerFocus")}
                    </p>
                    <p className="mt-1 text-3xl font-black text-sky-300">
                      {profit.silver_per_focus == null
                        ? missingLabel
                        : profit.silver_per_focus.toLocaleString(numberLocale)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl border-border/40 bg-card/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {t("crafting.materialTreeTitle", { city: cityBuy })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profit.materials.map((material) => (
                      <div
                        key={material.unique_name}
                        className="flex items-center justify-between rounded-2xl border border-border/20 bg-background/40 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={getItemImageUrl(material.unique_name)}
                            className="w-8 rounded-lg bg-black/40 outline outline-1 outline-border/40"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black">
                              {material.count}x{" "}
                              {displayName(
                                material.name_pt || "",
                                material.name_en || "",
                                material.unique_name,
                              )}
                            </p>
                            <p className="font-mono text-[10px] text-muted-foreground">
                              {material.unit_price != null
                                ? t("crafting.unitPricePerUnit", {
                                    value: material.unit_price.toLocaleString(numberLocale),
                                  })
                                : missingLabel}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-orange-400">
                          {formatSilver(material.total_cost, numberLocale, missingLabel)}
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
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.baseMaterialCost")}
                      </span>
                      <strong>
                        {formatSilver(profit.raw_material_cost, numberLocale, missingLabel)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.focusAdjustedCost")}
                      </span>
                      <strong>
                        {formatSilver(profit.effective_cost, numberLocale, missingLabel)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.saleUnitPrice", { city: citySell })}
                      </span>
                      <strong>
                        {formatSilver(profit.sell_price, numberLocale, missingLabel)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.netRevenue")}
                      </span>
                      <strong>
                        {formatSilver(profit.net_revenue, numberLocale, missingLabel)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("crafting.metrics.focusCost")}
                      </span>
                      <strong>
                        {profit.focus_cost == null
                          ? missingLabel
                          : profit.focus_cost.toLocaleString(numberLocale)}
                      </strong>
                    </div>
                    <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                      {t("crafting.regionNotice", {
                        region,
                        cityBuy,
                        citySell,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      <Card className="rounded-3xl border-border/40 bg-card/40 shadow-xl">
        <CardHeader className="flex flex-col gap-3 border-b border-border/20 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
            <Trophy className="h-4 w-4 text-amber-400" />
            {t("crafting.topTitle")}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(["profit", "roi", "silver_per_focus"] as const).map((key) => (
              <Button
                key={key}
                size="sm"
                variant={topSort === key ? "default" : "ghost"}
                className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                onClick={() => setTopSort(key)}
              >
                {t(`crafting.sort.${key}`)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {topQuery.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (topQuery.data?.items?.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("crafting.topEmpty")}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topQuery.data!.items.map((row) => (
                <button
                  key={row.item}
                  onClick={() =>
                    setSelectedItem({
                      unique_name: row.item,
                      name_pt: row.name_pt,
                      name_en: row.name_en,
                    })
                  }
                  className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/30 bg-background/40 p-4 text-left transition hover:border-primary/40 hover:bg-background/70"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <img
                      src={getItemImageUrl(row.item)}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg bg-black/40"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {displayName(row.name_pt, row.name_en, row.item)}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">
                        {row.item}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <DataAgeBadge hours={row.data_age_hours} t={t} compact />
                  </div>
                  <div className="grid grid-cols-2 gap-2 overflow-hidden">
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t("crafting.metrics.estimatedProfit")}
                      </p>
                      <p
                        className={`truncate text-lg font-black sm:text-xl ${
                          row.profit >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {row.profit >= 0 ? "+" : ""}
                        {row.profit.toLocaleString(numberLocale)}
                      </p>
                    </div>
                    <div className="min-w-0 overflow-hidden text-right">
                      <Badge className="max-w-full truncate bg-primary/15 text-primary">
                        ROI {row.roi.toFixed(1)}%
                      </Badge>
                      {row.silver_per_focus != null && (
                        <p className="mt-1 flex items-center justify-end gap-1 truncate text-[10px] text-sky-300">
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {row.silver_per_focus.toLocaleString(numberLocale)} / foco
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {topQuery.data && (
            <p className="mt-4 text-[10px] text-muted-foreground">
              {t("crafting.topMeta", {
                scanned: topQuery.data.scanned,
                withRecipe: topQuery.data.with_recipe,
              })}
            </p>
          )}
        </CardContent>
      </Card>

      </>
      )}
    </div>
  );
}
