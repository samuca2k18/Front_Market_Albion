import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BarChart3, Coins, Layers3, X, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchAlbionPrices } from "@/api/albion";
import { getOpenAlbionUniqueName, type OpenAlbionItem } from "@/api/catalog";
import { useRegion } from "@/context/RegionContext";
import { getItemDisplayNameWithEnchantment, getItemImageUrl } from "@/utils/items";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface ItemComparisonDrawerProps {
  items: OpenAlbionItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (item: OpenAlbionItem) => void;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];

function shortLabel(raw: string): string {
  if (raw.length <= 18) return raw;
  return `${raw.slice(0, 16)}...`;
}

export function ItemComparisonDrawer({
  items,
  isOpen,
  onClose,
  onRemoveItem,
}: ItemComparisonDrawerProps) {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();

  const numberLocale = i18n.language.startsWith("pt") ? "pt-BR" : "en-US";

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const compared = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        uniqueName: getOpenAlbionUniqueName(item),
      })),
    [items],
  );

  const uniqueNames = compared
    .map((item) => item.uniqueName)
    .filter((name): name is string => Boolean(name));

  const priceQuery = useQuery({
    queryKey: ["item-comparison-prices", region, uniqueNames.join(",")],
    queryFn: () => fetchAlbionPrices(uniqueNames, undefined, undefined, region),
    enabled: isOpen && uniqueNames.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const bestByItem = useMemo(() => {
    const map = new Map<string, { price: number; city: string }>();
    const rows = priceQuery.data?.all_data ?? [];

    for (const row of rows) {
      if (!row.item_id || row.sell_price_min <= 0) continue;
      const current = map.get(row.item_id);
      if (!current || row.sell_price_min < current.price) {
        map.set(row.item_id, { price: row.sell_price_min, city: row.city });
      }
    }

    return map;
  }, [priceQuery.data]);

  const chartData = compared.map((item) => {
    const best = item.uniqueName ? bestByItem.get(item.uniqueName) : undefined;
    return {
      name: shortLabel(getItemDisplayNameWithEnchantment(item.name)),
      fullName: getItemDisplayNameWithEnchantment(item.name),
      price: best?.price ?? 0,
      city: best?.city ?? "-",
    };
  });

  const chartMinWidth = Math.max(360, chartData.length * 140);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 z-50 h-full w-full border-l border-border/40 glass-header shadow-2xl transition-transform duration-300 ease-in-out sm:w-[520px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/20 bg-muted/5 p-4">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              {t("comparison.title", { count: items.length, max: 3 })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center opacity-50">
                <Layers3 className="mb-4 h-12 w-12" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  {t("comparison.emptyTitle")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("comparison.emptyDescription")}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {compared.map((item, index) => {
                    const best = item.uniqueName ? bestByItem.get(item.uniqueName) : undefined;
                    return (
                      <Card
                        key={item.id}
                        className="premium-card p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-1.5 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="rounded-xl bg-black/40 p-1.5">
                            <img
                              src={getItemImageUrl(item.name)}
                              alt=""
                              className="h-8 w-8 object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              {getItemDisplayNameWithEnchantment(item.name)}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Zap className="h-3 w-3 text-amber-500" />
                                {t("comparison.ipValue", { value: item.item_power })}
                              </span>
                              <span>T{item.tier}</span>
                              <span className="inline-flex items-center gap-1">
                                <Coins className="h-3 w-3 text-emerald-500" />
                                {best
                                  ? t("comparison.bestPriceInline", {
                                      price: best.price.toLocaleString(numberLocale),
                                      city: best.city,
                                    })
                                  : t("comparison.noPrice")}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400/50 hover:bg-red-400/10 hover:text-red-400"
                            onClick={() => onRemoveItem(item)}
                            title={t("comparison.remove")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <Card className="rounded-3xl border-border/40 bg-card/40 p-4">
                  <h3 className="mb-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("comparison.bestPriceChartTitle")}
                  </h3>

                  <div className="w-full overflow-x-auto pb-2">
                    <div style={{ minWidth: `${chartMinWidth}px`, height: 280 }}>
                      <BarChart
                        width={chartMinWidth}
                        height={280}
                        data={chartData}
                        margin={{ top: 10, right: 16, left: 0, bottom: 24 }}
                      >
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={50}
                          tick={{
                            fill: "rgba(255,255,255,0.55)",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        />
                        <YAxis
                          tick={{
                            fill: "rgba(255,255,255,0.55)",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          tickFormatter={(v) => Number(v).toLocaleString(numberLocale)}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [
                            `${Number(value).toLocaleString(numberLocale)} Ag`,
                            t("comparison.priceLabel"),
                          ]}
                          labelFormatter={(label) => {
                            const row = chartData.find((entry) => entry.name === label);
                            return row?.fullName ?? label;
                          }}
                          contentStyle={{
                            background: "rgba(5,8,20,0.9)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                          }}
                        />
                        <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                          {chartData.map((row, index) => (
                            <Cell
                              key={`${row.name}-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </div>
                  </div>
                </Card>

                {priceQuery.isLoading && (
                  <p className="text-center text-[11px] text-muted-foreground">
                    {t("comparison.loadingPrices")}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border/20 p-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              {t("comparison.hide")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}