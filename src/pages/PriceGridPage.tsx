import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Grid3X3, Search, Loader2, Share2 } from "lucide-react";

import { fetchPriceGrid, searchItems } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import { useDebounce } from "@/hooks/useDebounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { getItemImageUrl } from "@/utils/items";

function AgeDot({ hours }: { hours: number | null | undefined }) {
  const color =
    hours == null
      ? "bg-muted-foreground/40"
      : hours < 1
        ? "bg-emerald-400"
        : hours < 6
          ? "bg-amber-400"
          : "bg-red-400";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} title={hours == null ? "?" : `${hours}h`} />;
}

export function PriceGridPage() {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();
  const [params, setParams] = useSearchParams();
  const initialItems = (params.get("items") || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const [selected, setSelected] = useState<string[]>(initialItems.slice(0, 20));
  const [searchTerm, setSearchTerm] = useState("");
  const debounced = useDebounce(searchTerm, 300);
  const locale = i18n.language.startsWith("pt") ? "pt-BR" : "en-US";
  const missing = t("crafting.noData");

  useEffect(() => {
    const next = selected.join(",");
    if ((params.get("items") || "") !== next) {
      setParams(next ? { items: next } : {}, { replace: true });
    }
  }, [selected, params, setParams]);

  const searchQuery = useQuery({
    queryKey: ["price-grid-search", debounced, i18n.language],
    queryFn: () =>
      searchItems(debounced, i18n.language.startsWith("en") ? "en-US" : "pt-BR"),
    enabled: debounced.trim().length >= 2,
  });

  const gridQuery = useQuery({
    queryKey: ["price-grid", region, selected.join(",")],
    queryFn: () => fetchPriceGrid({ items: selected, region }),
    enabled: selected.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const cities = gridQuery.data?.cities ?? [];

  const addItem = (unique: string) => {
    const u = unique.toUpperCase();
    setSelected((prev) => (prev.includes(u) || prev.length >= 20 ? prev : [...prev, u]));
    setSearchTerm("");
  };

  const removeItem = (unique: string) => {
    setSelected((prev) => prev.filter((x) => x !== unique));
  };

  const shareHint = useMemo(() => {
    if (!selected.length) return "";
    return `${window.location.origin}/price-grid?items=${selected.join(",")}`;
  }, [selected]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <SEO title={t("priceGrid.title")} />
      <div className="app-container space-y-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight lg:text-4xl">
              <Grid3X3 className="h-8 w-8 text-primary" />
              {t("priceGrid.title")}
            </h1>
            <p className="text-muted-foreground">{t("priceGrid.subtitle")}</p>
          </div>
          {shareHint && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigator.clipboard?.writeText(shareHint)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {t("priceGrid.copyLink")}
            </Button>
          )}
        </div>

        <Card className="rounded-3xl border-border/40 bg-card/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">
              <Search className="h-4 w-4 text-primary" />
              {t("priceGrid.addItems")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("priceGrid.searchPlaceholder")}
              className="max-w-lg"
            />
            {debounced.length >= 2 && (
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {(searchQuery.data ?? []).slice(0, 12).map((item) => (
                  <button
                    key={item.unique_name}
                    onClick={() => addItem(item.unique_name)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/30 bg-background/50 px-3 py-1.5 text-xs font-bold hover:border-primary/40"
                  >
                    <img src={getItemImageUrl(item.unique_name)} alt="" className="h-5 w-5" />
                    {i18n.language.startsWith("en") ? item.name_en : item.name_pt}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => (
                <Badge
                  key={id}
                  variant="outline"
                  className="cursor-pointer gap-2 rounded-xl px-3 py-1"
                  onClick={() => removeItem(id)}
                >
                  <img src={getItemImageUrl(id)} alt="" className="h-4 w-4" />
                  {id}
                  <span className="text-muted-foreground">×</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {selected.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border/30 p-16 text-center text-muted-foreground">
            {t("priceGrid.empty")}
          </div>
        ) : gridQuery.isLoading ? (
          <div className="flex justify-center py-20 opacity-60">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : gridQuery.isError ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center">
            <p className="mb-4 font-bold text-destructive">{t("priceGrid.error")}</p>
            <Button variant="destructive" onClick={() => gridQuery.refetch()}>
              {t("opportunities.retry")}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-border/40 bg-card/30 shadow-xl">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="sticky left-0 z-10 bg-card/95 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest backdrop-blur">
                    {t("priceGrid.item")}
                  </th>
                  {cities.map((city) => (
                    <th
                      key={city}
                      className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest"
                    >
                      {city}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridQuery.data!.items.map((row) => (
                  <tr key={row.item_id} className="border-b border-border/20 hover:bg-background/40">
                    <td className="sticky left-0 z-10 bg-card/95 px-4 py-3 backdrop-blur">
                      <div className="flex min-w-[180px] items-center gap-2">
                        <img src={getItemImageUrl(row.item_id)} alt="" className="h-8 w-8" />
                        <div>
                          <p className="font-bold">
                            {i18n.language.startsWith("en") ? row.name_en : row.name_pt}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">{row.item_id}</p>
                        </div>
                      </div>
                    </td>
                    {row.cities.map((cell) => {
                      const isCheapest =
                        cell.sell_min != null &&
                        row.cheapest_sell != null &&
                        cell.sell_min === row.cheapest_sell;
                      const isBestBuy =
                        cell.buy_max != null &&
                        row.best_buy != null &&
                        cell.buy_max === row.best_buy;
                      return (
                        <td key={cell.city} className="px-3 py-3 text-center align-middle">
                          <div
                            className={`inline-flex min-w-[88px] flex-col items-center gap-1 rounded-xl border px-2 py-2 ${
                              isCheapest
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : isBestBuy
                                  ? "border-sky-500/40 bg-sky-500/10"
                                  : "border-border/20 bg-background/30"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <AgeDot hours={cell.age_hours} />
                              <span className="text-[9px] uppercase text-muted-foreground">sell</span>
                            </div>
                            <span className="font-black">
                              {cell.sell_min != null
                                ? cell.sell_min.toLocaleString(locale)
                                : missing}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              buy{" "}
                              {cell.buy_max != null
                                ? cell.buy_max.toLocaleString(locale)
                                : missing}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
