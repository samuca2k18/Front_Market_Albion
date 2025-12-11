// src/pages/dashboard/components/PricesTableSection.tsx
import { useTranslation } from "react-i18next";

import type { MyItemPrice } from "@/api/types";
import { Card } from "@/components/common/Card";
import { getQualityColor, getQualityLabel } from "@/constants/qualities";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";
import { buildItemImageUrl, splitItemName, type TierFilter } from "../utils/itemFilters";
import { TierFilter as TierFilterComponent } from "./TierFilter";

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
    <Card
      title={t("dashboard.realtimePrices")}
      description={t("dashboard.realtimePricesDesc")}
    >
      {/* Filtro de Tier */}
      <TierFilterComponent selectedTier={selectedTier} onChange={onTierChange} />

      {myPricesQueryIsLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("dashboard.fetchingPrices")}
        </p>
      ) : myPricesQueryIsError ? (
        <p className="text-sm text-destructive">
          {t("dashboard.errorLoadingPrices")}
        </p>
      ) : myPrices.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
          {t("dashboard.noItemsToMonitor")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                  {t("prices.table.item")}
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                  {t("prices.table.city")}
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                  {t("prices.table.price")}
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                  {t("prices.table.quality")}
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                  {t("prices.table.enchantment")}
                </th>
              </tr>
            </thead>
            <tbody>
              {myPrices.map((item) => {
                const { base, enchant } = splitItemName(item.item_name);
                const displayName =
                  item.display_name ??
                  getItemDisplayNameWithEnchantment(
                    base,
                    (typeof navigator !== "undefined" && navigator.language) || "pt-BR",
                  );
                const enchantDisplay = enchant ? `@${enchant}` : "—";

                return (
                <tr
                  key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                  className="cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => onSelectHistoryItem(item.item_name)}
                  title={t("dashboard.clickToViewHistory")}
                >
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center gap-3">
                      <img
                        src={buildItemImageUrl(item)}
                        alt={item.item_name}
                        className="h-9 w-9 rounded-md bg-black/40"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://render.albiononline.com/v1/item/T1_BAG.png";
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {item.item_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-xs">
                      {item.city || "—"}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    {typeof item.price === "number"
                      ? `${item.price.toLocaleString(locale)} ${t(
                          "dashboard.silver",
                        )}`
                      : "—"}
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <span
                      style={{
                        color: getQualityColor(item.quality),
                        fontWeight: 700,
                        textShadow:
                          item.quality === 5 ? "0 0 10px #FF9800" : "none",
                      }}
                    >
                      {getQualityLabel(item.quality)}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    {enchantDisplay}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
