// src/pages/dashboard/components/PricesTableSection.tsx
import { useTranslation } from "react-i18next";
import { Clock, MousePointer2, ThermometerSnowflake, Search } from "lucide-react";

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
}

export function PricesTableSection({
  myPrices,
  myPricesQueryIsLoading,
  myPricesQueryIsError,
  locale,
  selectedTier,
  onTierChange,
  onSelectHistoryItem,
}: PricesTableSectionProps) {
  const { t } = useTranslation();

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
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{t("dashboard.fetchingPrices")}</p>
          </div>
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
          <div className="rounded-xl border border-border/40 bg-background/20 overflow-hidden">
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

                  return (
                    <TableRow
                      key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                      className="cursor-pointer hover:bg-muted/30 transition-all border-border/20 group"
                      onClick={() => onSelectHistoryItem(item.item_name)}
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={buildItemImageUrl(item)}
                            alt={item.item_name}
                            className="h-10 w-10 rounded-lg bg-black/40 border border-border/20 group-hover:scale-110 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = "https://render.albiononline.com/v1/item/T1_BAG.png";
                            }}
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
                          <span className="font-black text-sm tracking-tighter text-foreground group-hover:text-primary transition-colors">
                            {typeof item.price === "number" ? item.price.toLocaleString(locale) : "—"}
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
            <div className="p-3 bg-muted/20 border-t border-border/20 flex items-center justify-center gap-2">
              <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                {t("dashboard.clickToViewHistory")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
