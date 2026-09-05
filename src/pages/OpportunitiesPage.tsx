import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  Truck,
  Package,
  Scale,
  Crosshair,
} from "lucide-react";

import { fetchArbitrageRouteOpportunities, fetchBmFlips } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

const CITIES = [
  "Bridgewatch",
  "Caerleon",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
];

function AgeBadge({ hours, t }: { hours: number | null | undefined; t: any }) {
  if (hours == null) {
    return (
      <Badge variant="outline" className="text-[9px] text-muted-foreground">
        {t("crafting.dataAge.unknown")}
      </Badge>
    );
  }
  const tone =
    hours < 1
      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
      : hours < 6
        ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
        : "border-red-500/40 bg-red-500/15 text-red-300";
  return (
    <Badge variant="outline" className={`gap-1 text-[9px] ${tone}`}>
      <Clock className="h-3 w-3" />
      {hours.toFixed(1)}h
    </Badge>
  );
}

export function OpportunitiesPage() {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();
  const [tab, setTab] = useState<"routes" | "bm">("routes");
  const [tax, setTax] = useState(0.08);
  const [minTripProfit, setMinTripProfit] = useState(0);
  const [origin, setOrigin] = useState("Bridgewatch");
  const [destination, setDestination] = useState("Caerleon");
  const [mountCapacity, setMountCapacity] = useState(1200);
  const [defaultWeight, setDefaultWeight] = useState(1);
  const [budgetCap, setBudgetCap] = useState(0);
  const [minBmProfit, setMinBmProfit] = useState(5000);
  const [maxAgeHours, setMaxAgeHours] = useState(12);
  const routeInvalid = origin === destination;

  const routeQuery = useQuery({
    queryKey: [
      "arbitrage-route-opportunities",
      region,
      tax,
      origin,
      destination,
      mountCapacity,
      defaultWeight,
      budgetCap,
    ],
    queryFn: () =>
      fetchArbitrageRouteOpportunities({
        region,
        origin,
        destination,
        tax,
        mountCapacity,
        defaultWeight,
        budgetCap,
      }),
    refetchInterval: 1000 * 60 * 5,
    enabled: !routeInvalid && tab === "routes",
  });

  const bmQuery = useQuery({
    queryKey: ["bm-flips", region, minBmProfit, maxAgeHours],
    queryFn: () =>
      fetchBmFlips({
        region,
        minProfit: minBmProfit,
        maxAgeHours,
        limit: 60,
        tax: 0,
      }),
    refetchInterval: 1000 * 60 * 5,
    enabled: tab === "bm",
  });

  const locale = i18n.language.startsWith("pt") ? "pt-BR" : "en-US";
  const filteredData =
    routeQuery.data?.opportunities.filter((opt) => opt.trip_profit >= minTripProfit) || [];

  const getQualityName = (q: number) => {
    const names: Record<number, string> = {
      1: t("quality.normal"),
      2: t("quality.good"),
      3: t("quality.outstanding"),
      4: t("quality.excellent"),
      5: t("quality.masterpiece"),
    };
    return names[q] || names[1];
  };

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return t("common.now") || "agora";
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("common.now") || "agora";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="bg-background min-h-screen">
      <SEO title={t("navigation.opportunities")} />
      <div className="app-container py-12">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4 shadow-lg shadow-primary/15">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="mb-1 text-4xl font-black uppercase leading-none tracking-tighter">
                  {t("opportunities.title")}
                </h1>
                <p className="max-w-md font-medium text-muted-foreground">
                  {t("opportunities.subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-border/40 bg-card/40 p-2 shadow-xl backdrop-blur-md">
            <Button
              variant={tab === "routes" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("routes")}
              className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              <Truck className="mr-1 h-3.5 w-3.5" />
              {t("opportunities.tabs.routes")}
            </Button>
            <Button
              variant={tab === "bm" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("bm")}
              className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              <Crosshair className="mr-1 h-3.5 w-3.5" />
              {t("opportunities.tabs.bm")}
            </Button>
          </div>
        </div>

        {tab === "routes" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="space-y-6 lg:col-span-1">
              <Card className="rounded-2xl border-border/40 bg-card/40 shadow-lg backdrop-blur-md">
                <CardHeader className="border-b border-border/20 pb-3">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <Filter size={14} className="text-primary" />
                    {t("common.filters") || "Filtros"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex gap-1 rounded-xl border border-border/30 bg-background/40 p-1">
                    <Button
                      variant={tax === 0.08 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTax(0.08)}
                      className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase"
                    >
                      8%
                    </Button>
                    <Button
                      variant={tax === 0.04 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTax(0.04)}
                      className="h-8 flex-1 rounded-lg text-[10px] font-black uppercase"
                    >
                      4%
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.originCity")}
                    </Label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/40 bg-background/40 px-3 text-sm font-semibold"
                    >
                      {CITIES.map((city) => (
                        <option key={`origin-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.destCity")}
                    </Label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border/40 bg-background/40 px-3 text-sm font-semibold"
                    >
                      {CITIES.map((city) => (
                        <option key={`dest-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.mountCapacity")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={mountCapacity}
                      onChange={(e) =>
                        setMountCapacity(Math.max(1, Number(e.target.value) || 1))
                      }
                      className="h-11 border-border/40 bg-background/40 font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.budgetCap")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={budgetCap}
                      onChange={(e) => setBudgetCap(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0 = sem limite"
                      className="h-11 border-border/40 bg-background/40 font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.defaultWeight")}
                    </Label>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={defaultWeight}
                      onChange={(e) =>
                        setDefaultWeight(Math.max(0.1, Number(e.target.value) || 1))
                      }
                      className="h-11 border-border/40 bg-background/40 font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {t("opportunities.minTripProfit")}
                    </Label>
                    <Input
                      type="number"
                      value={minTripProfit}
                      onChange={(e) => setMinTripProfit(Number(e.target.value) || 0)}
                      className="h-11 border-border/40 bg-background/40 font-bold"
                    />
                  </div>

                  {routeInvalid && (
                    <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
                      <p className="text-[11px] font-medium leading-relaxed text-destructive">
                        {t("opportunities.sameCityError")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>

            <main className="lg:col-span-3">
              {routeQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-50">
                  <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                  <p className="animate-pulse text-sm font-black uppercase tracking-widest">
                    {t("opportunities.calculating")}
                  </p>
                </div>
              ) : routeQuery.isError ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 px-6 py-20 text-center">
                  <AlertCircle className="mb-4 h-16 w-16 text-destructive/40" />
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight text-destructive/80">
                    {t("opportunities.errorTitle")}
                  </h3>
                  <Button variant="destructive" onClick={() => routeQuery.refetch()}>
                    {t("opportunities.retry")}
                  </Button>
                </div>
              ) : filteredData.length === 0 || routeInvalid ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/20 bg-card/20 px-6 py-32 text-center">
                  <Search className="mb-4 h-16 w-16 text-muted-foreground/20" />
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight">
                    {t("opportunities.emptyTitle")}
                  </h3>
                  <p className="max-w-xs text-muted-foreground">
                    {t("opportunities.emptyMessage")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  {filteredData.map((opt, idx) => {
                    const roi = opt.unit_roi;
                    return (
                      <Card
                        key={`${opt.item_id}-${opt.quality}-${idx}`}
                        className="group relative overflow-hidden border-border/60 bg-card/40 shadow-xl backdrop-blur-sm transition-all hover:border-primary/40"
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                              <CardTitle className="truncate text-lg font-black tracking-tight">
                                {getItemDisplayNameWithEnchantment(opt.item_id)}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-[9px] font-black">
                                  ROI {roi}%
                                </Badge>
                                <Badge className="text-[9px] font-black uppercase">
                                  {getQualityName(opt.quality)}
                                </Badge>
                              </div>
                            </div>
                            <img
                              src={`https://render.albiononline.com/v1/item/${encodeURIComponent(opt.item_id)}.png?size=48`}
                              alt=""
                              className="h-12 w-12 rounded-xl border border-border/20 bg-background/40 p-1"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center gap-2 text-sm font-bold">
                            <MapPin className="h-4 w-4 text-sky-400" />
                            {opt.buy_from}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            {opt.sell_at}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border border-border/20 bg-background/30 p-3">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {t("opportunities.tripProfit")}
                              </p>
                              <p className="text-xl font-black text-emerald-400">
                                +{opt.trip_profit.toLocaleString(locale)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-border/20 bg-background/30 p-3">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                {t("opportunities.profitPerKg")}
                              </p>
                              <p className="text-xl font-black text-sky-300">
                                {(opt.profit_per_kg ?? opt.unit_profit / Math.max(opt.item_weight, 0.01))
                                  .toFixed(0)
                                  .toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              {opt.max_units_by_capacity} un
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Scale className="h-3.5 w-3.5" />
                              {opt.total_weight} kg
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {getTimeAgo(opt.buy_date)} / {getTimeAgo(opt.sell_date)}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {t("opportunities.investment")}:{" "}
                            <strong>{opt.investment_required.toLocaleString(locale)} Ag</strong>
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="space-y-6 lg:col-span-1">
              <Card className="rounded-2xl border-border/40 bg-card/40 shadow-lg">
                <CardHeader className="border-b border-border/20 pb-3">
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {t("opportunities.bmFilters")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      {t("opportunities.minProfit")}
                    </Label>
                    <Input
                      type="number"
                      value={minBmProfit}
                      onChange={(e) => setMinBmProfit(Number(e.target.value) || 0)}
                      className="h-11 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest">
                      {t("opportunities.maxAgeHours")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={72}
                      value={maxAgeHours}
                      onChange={(e) => setMaxAgeHours(Number(e.target.value) || 12)}
                      className="h-11 font-bold"
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {t("opportunities.bmHint")}
                  </p>
                </CardContent>
              </Card>
            </aside>

            <main className="lg:col-span-3">
              {bmQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-50">
                  <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm font-black uppercase tracking-widest">
                    {t("opportunities.scanningBm")}
                  </p>
                </div>
              ) : bmQuery.isError ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center">
                  <p className="mb-4 font-bold text-destructive">{t("opportunities.errorTitle")}</p>
                  <Button variant="destructive" onClick={() => bmQuery.refetch()}>
                    {t("opportunities.retry")}
                  </Button>
                </div>
              ) : (bmQuery.data?.flips.length ?? 0) === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-border/30 p-16 text-center">
                  <p className="font-black uppercase">{t("opportunities.emptyTitle")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t("opportunities.bmEmpty")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {bmQuery.data!.flips.map((flip) => (
                    <Card
                      key={`${flip.item_id}-${flip.buy_city}`}
                      className="border-violet-500/20 bg-card/50 shadow-xl"
                    >
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://render.albiononline.com/v1/item/${encodeURIComponent(flip.item_id)}.png?size=48`}
                              alt=""
                              className="h-12 w-12 rounded-xl bg-black/40"
                            />
                            <div>
                              <p className="font-black">
                                {i18n.language.startsWith("en")
                                  ? flip.name_en
                                  : flip.name_pt}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {flip.item_id}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <AgeBadge hours={flip.bm_age_hours} t={t} />
                            <AgeBadge hours={flip.buy_age_hours} t={t} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <span className="text-sky-300">{flip.buy_city}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-violet-300">Black Market</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="rounded-xl bg-background/40 p-2">
                            <p className="text-[9px] uppercase text-muted-foreground">
                              {t("opportunities.buy")}
                            </p>
                            <p className="font-black">
                              {flip.buy_price.toLocaleString(locale)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-background/40 p-2">
                            <p className="text-[9px] uppercase text-muted-foreground">BM</p>
                            <p className="font-black">
                              {flip.bm_buy_price.toLocaleString(locale)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-emerald-500/10 p-2">
                            <p className="text-[9px] uppercase text-muted-foreground">
                              {t("opportunities.profit")}
                            </p>
                            <p className="font-black text-emerald-400">
                              +{flip.profit.toLocaleString(locale)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>ROI {flip.roi}%</span>
                          <span>
                            {flip.profit_per_kg.toLocaleString(locale)} Ag/kg · {flip.weight} kg
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
