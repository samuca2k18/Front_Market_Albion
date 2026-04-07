import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Coins, Layers3, X, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchAlbionPrices } from "@/api/albion";
import { getOpenAlbionUniqueName, type OpenAlbionItem } from "@/api/openalbion";
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

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

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
  const { region } = useRegion();

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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[520px] bg-background border-l border-border/40 shadow-2xl transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/20 bg-muted/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Comparacao ({items.length}/3)
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full opacity-50">
                <Layers3 className="w-12 h-12 mb-4" />
                <p className="font-bold text-sm uppercase tracking-widest">Nenhum item selecionado</p>
                <p className="text-xs text-muted-foreground mt-2">Use o botao "+" para adicionar itens.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {compared.map((item, index) => {
                    const best = item.uniqueName ? bestByItem.get(item.uniqueName) : undefined;
                    return (
                      <Card
                        key={item.id}
                        className="p-3 rounded-2xl border border-border/40 bg-card/40"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1.5 h-10 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <div className="bg-black/40 p-1.5 rounded-xl">
                            <img
                              src={getItemImageUrl(item.name)}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate">
                              {getItemDisplayNameWithEnchantment(item.name)}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground font-mono">
                              <span className="inline-flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-500" />
                                {item.item_power} IP
                              </span>
                              <span>T{item.tier}</span>
                              <span className="inline-flex items-center gap-1">
                                <Coins className="w-3 h-3 text-emerald-500" />
                                {best ? `${best.price.toLocaleString("pt-BR")} (${best.city})` : "sem preco"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => onRemoveItem(item)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-card/40 border-border/40 rounded-3xl p-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 text-center">
                    Melhor Preco por Item
                  </h3>
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 8, left: -8, bottom: 24 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={50}
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700 }}
                          tickFormatter={(v) => Number(v).toLocaleString("pt-BR")}
                        />
                        <RechartsTooltip
                          formatter={(value: number) => [`${Number(value).toLocaleString("pt-BR")} Ag`, "Preco"]}
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
                            <Cell key={`${row.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {priceQuery.isLoading && (
                  <p className="text-[11px] text-muted-foreground text-center">Carregando precos atuais...</p>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t border-border/20">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Ocultar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
