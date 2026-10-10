import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Anvil,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import { fetchRefineProfit, fetchRefineTop } from "@/api/craft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/context/RegionContext";
import { getItemImageUrl } from "@/utils/items";

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

const FAMILIES = [
  { id: "METALBAR", defaultCity: "Thetford" },
  { id: "LEATHER", defaultCity: "Martlock" },
  { id: "CLOTH", defaultCity: "Lymhurst" },
  { id: "PLANKS", defaultCity: "Fort Sterling" },
  { id: "STONEBLOCK", defaultCity: "Bridgewatch" },
] as const;

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

export function RefinePanel() {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();

  const [family, setFamily] = useState<(typeof FAMILIES)[number]["id"]>("METALBAR");
  const [tier, setTier] = useState(5);
  const [cityBuy, setCityBuy] = useState("Thetford");
  const [citySell, setCitySell] = useState("Thetford");
  const [focusReturnPct, setFocusReturnPct] = useState(15);
  const [cityBonusPct, setCityBonusPct] = useState(36.7);
  const [marketTaxPct, setMarketTaxPct] = useState<number | "">("");
  const [craftingFee, setCraftingFee] = useState(0);
  const [topSort, setTopSort] = useState<"profit" | "roi" | "silver_per_focus">("profit");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const numberLocale = useMemo(
    () => (i18n.language.startsWith("pt") ? "pt-BR" : "en-US"),
    [i18n.language],
  );
  const missingLabel = t("crafting.noData");
  const itemId = selectedItem || `T${tier}_${family}`;

  const effectiveTax =
    marketTaxPct === ""
      ? citySell === "Black Market"
        ? 0
        : 6.5
      : Number(marketTaxPct);

  const profitQuery = useQuery({
    queryKey: [
      "refine-profit",
      itemId,
      region,
      cityBuy,
      citySell,
      focusReturnPct,
      cityBonusPct,
      effectiveTax,
      craftingFee,
    ],
    queryFn: () =>
      fetchRefineProfit({
        item: itemId,
        city_buy: cityBuy,
        city_sell: citySell,
        region,
        focus_return_pct: focusReturnPct,
        city_bonus_pct: cityBonusPct,
        market_tax_pct: effectiveTax,
        crafting_fee: craftingFee,
      }),
    staleTime: 1000 * 60 * 2,
  });

  const topQuery = useQuery({
    queryKey: [
      "refine-top",
      region,
      cityBuy,
      citySell,
      focusReturnPct,
      cityBonusPct,
      effectiveTax,
      craftingFee,
      family,
      topSort,
    ],
    queryFn: () =>
      fetchRefineTop({
        city_buy: cityBuy,
        city_sell: citySell,
        region,
        focus_return_pct: focusReturnPct,
        city_bonus_pct: cityBonusPct,
        market_tax_pct: effectiveTax,
        crafting_fee: craftingFee,
        family,
        limit: 12,
        sort_by: topSort,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const displayName = (pt: string, en: string, fallback: string) =>
    i18n.language.startsWith("en") ? en || fallback : pt || fallback;

  const profit = profitQuery.data;
  const familyMeta = FAMILIES.find((f) => f.id === family);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/40 shadow-xl lg:col-span-4">
          <CardHeader className="border-b border-border/20 bg-muted/10 pb-4">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
              <Anvil className="h-4 w-4 text-amber-400" />
              {t("crafting.refine.configTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("crafting.refine.resourceType")}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {FAMILIES.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      setFamily(row.id);
                      setSelectedItem(null);
                      setCityBuy(row.defaultCity);
                      setCitySell(row.defaultCity);
                    }}
                    className={`flex min-w-0 flex-col gap-0.5 rounded-2xl border px-3 py-2.5 text-left transition ${
                      family === row.id
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border/20 bg-background/40 hover:bg-background/70"
                    }`}
                  >
                    <span className="text-sm font-black">
                      {t(`crafting.refine.families.${row.id}`)}
                    </span>
                    <span className="whitespace-normal text-[10px] leading-tight text-muted-foreground">
                      {row.defaultCity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1 text-xs font-bold text-muted-foreground">
              {t("crafting.refine.tier")}
              <select
                value={tier}
                onChange={(e) => {
                  setTier(Number(e.target.value));
                  setSelectedItem(null);
                }}
                className="h-10 w-full min-w-0 rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
              >
                {[4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    T{n}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-2xl border border-border/20 bg-background/40 p-3">
              <div className="flex items-center gap-3">
                <img src={getItemImageUrl(itemId)} alt="" className="h-12 w-12 rounded-xl bg-black/40" />
                <div>
                  <p className="text-sm font-black">{itemId}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("crafting.refine.bonusCityHint", {
                      city: familyMeta?.defaultCity ?? "—",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-8">
          <Card className="overflow-hidden rounded-3xl border border-border/40 bg-card/60 shadow-2xl">
            <CardContent className="grid gap-4 p-6">
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
                    onChange={(e) => setCitySell(e.target.value)}
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
                  {t("crafting.refine.cityBonusPct")}
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    step={0.1}
                    value={cityBonusPct}
                    onChange={(e) => setCityBonusPct(Number(e.target.value || 0))}
                    className="w-full min-w-0 bg-background/70"
                  />
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
                  {t("crafting.labels.marketTaxPct")}
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.1}
                    placeholder={citySell === "Black Market" ? "0" : "6.5"}
                    value={marketTaxPct}
                    onChange={(e) =>
                      setMarketTaxPct(e.target.value === "" ? "" : Number(e.target.value))
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
              {profit && (
                <p className="text-[11px] text-muted-foreground">
                  {t("crafting.refine.returnTotal", {
                    value: (profit.resource_return_pct ?? cityBonusPct + focusReturnPct).toFixed(1),
                  })}
                </p>
              )}
            </CardContent>
          </Card>

          {profitQuery.isLoading ? (
            <div className="rounded-3xl border border-border/20 bg-card/10 p-12 text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 animate-pulse text-amber-400" />
              <p className="animate-pulse font-bold uppercase tracking-widest text-muted-foreground">
                {t("crafting.loadingMessage")}
              </p>
            </div>
          ) : profitQuery.isError || !profit ? (
            <div className="rounded-3xl border-2 border-red-500/20 bg-red-500/5 p-12 text-center">
              <p className="font-bold text-red-400">{t("crafting.calculationError")}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src={getItemImageUrl(profit.item)}
                  alt=""
                  className="h-14 w-14 rounded-2xl border border-border/20 bg-black/40 p-1"
                />
                <div>
                  <h2 className="text-2xl font-black">
                    {displayName(profit.name_pt, profit.name_en, profit.item)}
                  </h2>
                  <p className="font-mono text-[11px] text-muted-foreground">{profit.item}</p>
                </div>
                <DataAgeBadge hours={profit.data_age_hours} t={t} />
              </div>

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
                    {profit.missing_prices && (
                      <p className="text-[11px] text-amber-300">{t("crafting.refine.missingPrices")}</p>
                    )}
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
            {t("crafting.refine.topTitle")}
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
              {t("crafting.refine.topEmpty")}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topQuery.data!.items.map((row) => (
                <button
                  key={row.item}
                  type="button"
                  onClick={() => {
                    setSelectedItem(row.item);
                    if (row.tier) setTier(row.tier);
                    if (row.family && FAMILIES.some((f) => f.id === row.family)) {
                      setFamily(row.family as (typeof FAMILIES)[number]["id"]);
                    }
                  }}
                  className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl border border-border/30 bg-background/40 p-4 text-left transition hover:border-amber-500/40 hover:bg-background/70"
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
        </CardContent>
      </Card>
    </div>
  );
}
