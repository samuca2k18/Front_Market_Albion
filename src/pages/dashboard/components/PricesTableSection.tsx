import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, MousePointer2, Search } from "lucide-react";

import type { MyItemPrice } from "@/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getQualityColor, getQualityLabel } from "@/constants/qualities";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";
import { buildItemImageUrl, splitItemName, type TierFilter } from "../utils/itemFilters";
import { TierFilter as TierFilterComponent } from "./TierFilter";
import { ItemAvatar } from "./ItemAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveUpdate } from "../hooks/useLivePrices";

function getFreshnessInfo(dateStr?: string) {
  if (!dateStr || dateStr.startsWith("0001")) return { color: "#666", label: "—", level: "unknown" };
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 1) return { color: "#22c55e", label: `${Math.round(hours * 60)}min`, level: "fresh" };
  if (hours < 6) return { color: "#eab308", label: `${Math.round(hours)}h`, level: "stale" };
  return { color: "#ef4444", label: `${Math.round(hours)}h`, level: "old" };
}

interface PricesTableSectionProps {
  myPrices: MyItemPrice[];
  myPricesQueryIsLoading: boolean;
  myPricesQueryIsError: boolean;
  locale: string;
  selectedTier: TierFilter;
  onTierChange: (tier: TierFilter) => void;
  onSelectHistoryItem: (itemName: string) => void;
  onReorderItem?: (draggedItemName: string, targetItemName: string) => void;
  liveUpdates?: Record<string, LiveUpdate>;
  nowTs: number;
}

export function PricesTableSection({
  myPrices,
  myPricesQueryIsLoading,
  myPricesQueryIsError,
  locale,
  selectedTier,
  onTierChange,
  onSelectHistoryItem,
  onReorderItem,
  liveUpdates,
  nowTs,
}: PricesTableSectionProps) {
  const { t } = useTranslation();
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, itemName: string) => {
    setDraggedItem(itemName);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from disappearing
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetItemName: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetItemName && onReorderItem) {
      onReorderItem(draggedItem, targetItemName);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  return (
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm overflow-hidden mb-6">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {t("dashboard.realtimePrices")}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {t("dashboard.realtimePricesDesc")}
            </CardDescription>
          </div>
          <div className="bg-primary/10 p-2 rounded-lg">
            <Search className="w-5 h-5 text-primary opacity-70" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <TierFilterComponent selectedTier={selectedTier} onChange={onTierChange} />

        {myPricesQueryIsLoading ? (
          <>
            {/* Desktop Skeleton */}
            <div className="hidden md:block rounded-xl border border-border/40 bg-background/20 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.item")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.city")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.price")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">{t("prices.table.quality")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">{t("prices.table.enchantment")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Frescor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-5 w-16 rounded-md" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex justify-center">
                        <Skeleton className="h-4 w-6" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <Skeleton className="h-3 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {/* Mobile Skeleton */}
            <div className="md:hidden grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col p-4 rounded-xl border border-border/20 bg-background/20 gap-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Skeleton className="h-8 w-full rounded-md" />
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : myPricesQueryIsError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="text-xs font-medium">{t("dashboard.errorLoadingPrices")}</p>
          </div>
        ) : myPrices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border/40 bg-background/20 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {t("dashboard.noItemsToMonitor")}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-border/40 bg-background/20 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.item")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.city")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">{t("prices.table.price")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">{t("prices.table.quality")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">{t("prices.table.enchantment")}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock size={11} className="text-primary/70" />
                      Frescor
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myPrices.map((item) => {
                  const { base, enchant } = splitItemName(item.item_name);
                  const displayName = item.display_name ?? getItemDisplayNameWithEnchantment(base);
                  const enchantDisplay = enchant ? `@${enchant}` : "—";
                  const freshness = getFreshnessInfo(item.updated_at);

                  const dragKey = item.item_name;
                  const liveUpdate =
                    liveUpdates?.[`${item.item_name}-${item.city}`] ??
                    liveUpdates?.[`${splitItemName(item.item_name).base}-${item.city}`];
                  const hasRecentFlash = liveUpdate && (nowTs - liveUpdate.timestamp < 3000);
                  const displayPrice = liveUpdate ? liveUpdate.new_price : typeof item.price === "number" ? item.price : "—";
                  
                  const baseRowClasses = `cursor-move transition-all border-border/20 group`;
                  let highlightClasses = "hover:bg-muted/30";
                  if (hasRecentFlash) {
                    highlightClasses = liveUpdate.variation_pct >= 0 
                      ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/50 relative z-10" 
                      : "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-500/50 relative z-10";
                  }

                  return (
                    <TableRow
                      key={`${dragKey}-${item.city}-${item.quality}-${item.enchantment}`}
                      className={`${baseRowClasses} ${highlightClasses} ${draggedItem === dragKey ? 'opacity-50 border-primary border-dashed' : ''}`}
                      onClick={() => onSelectHistoryItem(item.item_name)}
                      draggable={hasRecentFlash ? false : true} // disable dragging during a flash
                      onDragStart={(e) => handleDragStart(e, dragKey)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dragKey)}
                      onDragEnd={handleDragEnd}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <ItemAvatar
                            src={buildItemImageUrl(item)}
                            alt={item.item_name}
                            imageClassName="group-hover:scale-110"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">
                              {displayName}
                            </span>
                            <span className="text-[10px] font-mono font-medium text-muted-foreground/60 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.item_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge variant="outline" className="bg-background/40 border-border/40 font-bold uppercase tracking-tighter text-[10px] py-0.5">
                          {item.city || "—"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className={`font-black text-sm tracking-tighter transition-colors ${
                            hasRecentFlash && liveUpdate.variation_pct >= 0 ? "text-emerald-400" :
                            hasRecentFlash && liveUpdate.variation_pct < 0 ? "text-red-400" :
                            "text-foreground group-hover:text-primary"
                          }`}>
                            {typeof displayPrice === "number" ? displayPrice.toLocaleString(locale) : "—"}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest -mt-0.5">Silver</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <Badge
                          variant="secondary"
                          className="font-black text-[9px] uppercase tracking-widest px-2 shadow-sm"
                          style={{
                            backgroundColor: `${getQualityColor(item.quality)}15`,
                            color: getQualityColor(item.quality),
                            border: `1px solid ${getQualityColor(item.quality)}30`
                          }}
                        >
                          {getQualityLabel(item.quality)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-center">
                        <span className="font-mono text-xs font-bold text-muted-foreground/80">
                          {enchantDisplay}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2" title={item.updated_at || "Sem data"}>
                          <div
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{
                              backgroundColor: freshness.color,
                              boxShadow: freshness.level === "fresh" ? `0 0 10px ${freshness.color}60` : 'none'
                            }}
                          />
                          <span className="text-xs font-bold tracking-tighter opacity-80">{freshness.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid gap-3">
              {myPrices.map((item) => {
                const { base, enchant } = splitItemName(item.item_name);
                const displayName = item.display_name ?? getItemDisplayNameWithEnchantment(base);
                const enchantDisplay = enchant ? `@${enchant}` : "—";
                const freshness = getFreshnessInfo(item.updated_at);

                const dragKey = item.item_name;
                const liveUpdate =
                  liveUpdates?.[`${item.item_name}-${item.city}`] ??
                  liveUpdates?.[`${splitItemName(item.item_name).base}-${item.city}`];
                const hasRecentFlash = liveUpdate && (nowTs - liveUpdate.timestamp < 3000);
                const displayPrice = liveUpdate ? liveUpdate.new_price : typeof item.price === "number" ? item.price : "—";
                
                const baseMobileClasses = "flex flex-col p-4 rounded-xl border transition-all cursor-move group space-y-3";
                let mobileHighlightClasses = "border-border/40 bg-background/40 hover:bg-muted/30";
                if (hasRecentFlash) {
                  mobileHighlightClasses = liveUpdate.variation_pct >= 0 
                    ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/50" 
                    : "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] border-red-500/50";
                }

                return (
                  <div
                    key={`${dragKey}-${item.city}-${item.quality}-${item.enchantment}`}
                    className={`${baseMobileClasses} ${mobileHighlightClasses} ${draggedItem === dragKey ? 'opacity-50 border-primary border-dashed' : ''}`}
                    onClick={() => onSelectHistoryItem(dragKey)}
                    draggable={hasRecentFlash ? false : true}
                    onDragStart={(e) => handleDragStart(e, dragKey)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dragKey)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col shrink-0">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{item.city || "—"}</span>
                        <div className="flex items-center gap-2" title={item.updated_at || "Sem data"}>
                          <div
                            className="w-2 h-2 rounded-full shadow-sm"
                            style={{
                              backgroundColor: freshness.color,
                              boxShadow: freshness.level === "fresh" ? `0 0 10px ${freshness.color}60` : 'none'
                            }}
                          />
                          <span className="text-[10px] font-bold tracking-tighter opacity-80">{freshness.label}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-black text-lg tracking-tighter transition-colors ${
                            hasRecentFlash && liveUpdate.variation_pct >= 0 ? "text-emerald-400" :
                            hasRecentFlash && liveUpdate.variation_pct < 0 ? "text-red-400" :
                            "text-foreground group-hover:text-primary"
                          }`}>
                          {typeof displayPrice === "number" ? displayPrice.toLocaleString(locale) : "—"}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest -mt-1">Silver</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-background/60 p-2.5 rounded-lg border border-border/20">
                      <ItemAvatar
                        src={buildItemImageUrl(item)}
                        alt={item.item_name}
                        imageClassName="group-hover:scale-105"
                        sizeClassName="h-12 w-12"
                        fallbackIconClassName="w-6 h-6"
                      />
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-sm tracking-tight leading-tight line-clamp-2">
                          {displayName}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="font-black text-[9px] uppercase tracking-widest px-1.5 py-0 shadow-sm"
                            style={{
                              backgroundColor: `${getQualityColor(item.quality)}15`,
                              color: getQualityColor(item.quality),
                              border: `1px solid ${getQualityColor(item.quality)}30`
                            }}
                          >
                            {getQualityLabel(item.quality)}
                          </Badge>
                          <span className="font-mono text-[10px] font-bold text-muted-foreground/80 bg-muted/50 px-1.5 rounded">
                            {enchantDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-muted/20 border border-border/20 rounded-xl flex items-center justify-center gap-2">
              <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                {t("dashboard.clickToViewHistory")}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
