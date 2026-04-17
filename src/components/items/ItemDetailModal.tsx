// src/components/items/ItemDetailModal.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchAlbionPrices } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import { fetchItemDetail, getOpenAlbionUniqueName, type ItemType, type OpenAlbionItem } from "@/api/openalbion";
import { useTranslation } from "react-i18next";
import {
  Zap,
  MapPin,
  X,
  TrendingDown,
  Loader2,
  Star,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ItemDetailModalProps {
  item: OpenAlbionItem;
  itemType: ItemType;
  onClose: () => void;
}

const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%23222"/><path d="M18 46l14-28 14 28H18z" fill="%23555"/></svg>`;

const CITIES = [
  "Bridgewatch",
  "Caerleon",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
];

function getTierColor(tier: string): string {
  const t = parseFloat(tier);
  if (t <= 3) return "text-gray-400 border-gray-400/30 bg-gray-500/10";
  if (t <= 4) return "text-green-400 border-green-400/30 bg-green-500/10";
  if (t <= 5) return "text-blue-400 border-blue-400/30 bg-blue-500/10";
  if (t <= 6) return "text-purple-400 border-purple-400/30 bg-purple-500/10";
  if (t <= 7) return "text-amber-400 border-amber-400/30 bg-amber-500/10";
  return "text-red-400 border-red-400/30 bg-red-500/10";
}

export function ItemDetailModal({ item, itemType, onClose }: ItemDetailModalProps) {
  const { region } = useRegion();
  const { t } = useTranslation();
  const tierColor = getTierColor(item.tier);

  const uniqueName = getOpenAlbionUniqueName(item);

  // Fetch prices from Albion Data API if we have a unique name
  const pricesQuery = useQuery({
    queryKey: ["item-prices-detail", uniqueName, region],
    queryFn: () => fetchAlbionPrices([uniqueName], undefined, undefined, region),
    enabled: !!uniqueName,
    staleTime: 1000 * 60 * 2,
  });

  const detailQuery = useQuery({
    queryKey: ["openalbion-item-detail", itemType, item.id],
    queryFn: () => fetchItemDetail(itemType, item.id),
    staleTime: 1000 * 60 * 10,
  });

  // Group prices by city
  const cityPrices = CITIES.map((city) => {
    // We read from all_data to get the raw entries
    const entry = (pricesQuery.data?.all_data || []).find(
      (p) => p.city === city && p.sell_price_min > 0,
    );
    return {
      city,
      price: entry?.sell_price_min || 0,
      updated: entry?.sell_price_min_date || null,
    };
  }).filter((cp) => cp.price > 0);

  const cheapest = cityPrices.length
    ? cityPrices.reduce((a, b) => (a.price < b.price ? a : b))
    : null;

  const statsRows = Array.isArray((detailQuery.data?.stats as { data?: unknown[] } | undefined)?.data)
    ? ((detailQuery.data?.stats as { data?: Record<string, unknown>[] }).data ?? [])
    : [];
  const firstStats = statsRows[0] ?? {};

  const topStats = Object.entries(firstStats)
    .filter(([key, value]) => {
      if (!value) return false;
      if (typeof value !== "number" && typeof value !== "string") return false;
      return !["id", "name", "identifier", "icon", "description", "description_html"].includes(key);
    })
    .slice(0, 4);

  const spellsData = Array.isArray((detailQuery.data?.spells as { data?: unknown[] } | undefined)?.data)
    ? ((detailQuery.data?.spells as { data?: Array<{ spells?: Array<{ name?: string }> }> }).data ?? [])
    : [];
  const spellNames = spellsData
    .flatMap((group) => group.spells ?? [])
    .map((spell) => spell.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 6);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-card/95 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-border/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-background/60 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="bg-black/40 p-3 rounded-2xl border border-border/30 shadow-lg">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_SVG;
                    }}
                  />
                </div>
                <Badge
                  className={`absolute -top-2 -right-2 text-[10px] font-black px-1.5 h-5 border ${tierColor}`}
                >
                  T{item.tier}
                </Badge>
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-xl font-black tracking-tight text-foreground leading-tight mb-1">
                  {item.name}
                </h2>
                {uniqueName && (
                  <p className="text-[10px] font-mono text-muted-foreground/50 truncate mb-2">
                    {uniqueName}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-muted-foreground">
                      {item.item_power} IP
                    </span>
                  </div>
                  {cheapest && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-xs font-bold text-primary">
                        {cheapest.price.toLocaleString("pt-BR")} Ag
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[50vh] custom-scrollbar">
            {/* Stats Grid */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="w-3 h-3 text-primary" />
                {t("itemDatabase.statsItems")}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-background/40 border-border/20 p-3 text-center rounded-xl">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Tier
                  </div>
                  <div className={`text-lg font-black ${tierColor.split(" ")[0]}`}>
                    T{item.tier}
                  </div>
                </Card>
                <Card className="bg-background/40 border-border/20 p-3 text-center rounded-xl">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Item Power
                  </div>
                  <div className="text-lg font-black text-amber-400">
                    {item.item_power}
                  </div>
                </Card>
                <Card className="bg-background/40 border-border/20 p-3 text-center rounded-xl">
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Cidades
                  </div>
                  <div className="text-lg font-black text-foreground">
                    {cityPrices.length}
                  </div>
                </Card>
              </div>
            </div>

            {/* OpenAlbion detail */}
            {(topStats.length > 0 || spellNames.length > 0) && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Info className="w-3 h-3 text-primary" />
                  OpenAlbion Stats
                </h3>
                {detailQuery.isLoading ? (
                  <div className="text-xs text-muted-foreground animate-pulse">Carregando stats...</div>
                ) : (
                  <div className="space-y-3">
                    {topStats.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {topStats.map(([key, value]) => (
                          <div key={key} className="rounded-lg border border-border/20 bg-background/40 px-2 py-2">
                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                              {key.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs font-bold text-foreground">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {spellNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {spellNames.map((spellName) => (
                          <Badge key={spellName} variant="outline" className="text-[10px]">
                            {spellName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* City Prices */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary" />
                {t("prices.table.city")}
              </h3>

              {!uniqueName ? (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="text-[11px] font-bold">
                    Preços não disponíveis (unique_name não encontrado)
                  </span>
                </div>
              ) : pricesQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                    Buscando preços...
                  </span>
                </div>
              ) : cityPrices.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-xl bg-muted/10 border border-border/20">
                  <TrendingDown className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs font-bold text-muted-foreground/60">
                    Sem dados de preço disponíveis
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cityPrices
                    .sort((a, b) => a.price - b.price)
                    .map((cp, i) => {
                      const isCheapest = cheapest && cp.city === cheapest.city;
                      return (
                        <div
                          key={cp.city}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                            isCheapest
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : "bg-background/30 border-border/20 hover:bg-background/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow-inner ${
                                isCheapest
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-background/60 text-muted-foreground"
                              }`}
                            >
                              #{i + 1}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-foreground">
                                {cp.city}
                              </span>
                              {isCheapest && (
                                <Badge className="ml-2 text-[8px] font-black bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-1.5 h-4">
                                  {t("common.confirm").toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-sm font-black tracking-tight ${
                                isCheapest ? "text-emerald-400" : "text-foreground"
                              }`}
                            >
                              {cp.price.toLocaleString("pt-BR")}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50 ml-1">
                              Ag
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/20 flex items-center justify-between">
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              {t("itemDatabase.title")} + Albion Data API
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest"
            >
              {t("common.close")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
