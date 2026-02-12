// src/pages/dashboard/components/ItemsListSection.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Item } from "@/api/types";
import { Card } from "@/components/common/Card";
import {
  getItemDisplayNameWithEnchantment,
  getItemDisplayNameWithEnchantmentAsync,
} from "@/utils/itemNameMapper";
import { splitItemName, buildItemImageUrlFromName } from "../utils/itemFilters";

interface ItemsListSectionProps {
  trackedItems: Item[];
  selectedItems: Set<number>;
  locale: string;
  isDeleting: boolean;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onDeleteSingle: (id: number) => void;
}

export function ItemsListSection({
  trackedItems,
  selectedItems,
  locale,
  isDeleting,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
  onDeleteSingle,
}: ItemsListSectionProps) {
  const { t, i18n } = useTranslation();
  const [displayNames, setDisplayNames] = useState<Record<number, string>>({});

  // Resolve nomes respeitando o idioma atual e cacheando no estado
  useEffect(() => {
    let cancelled = false;

    async function resolveNames() {
      if (trackedItems.length === 0) {
        setDisplayNames({});
        return;
      }

      const entries = await Promise.all(
        trackedItems.map(async (item) => {
          const baseName = item.item_name;
          try {
            if (item.display_name) {
              return [item.id, item.display_name] as const;
            }

            const name = await getItemDisplayNameWithEnchantmentAsync(
              baseName,
              i18n.language as "pt-BR" | "en-US",
            );
            return [item.id, name] as const;
          } catch {
            // Fallback rápido para não quebrar UI
            const { base, enchant } = splitItemName(baseName);
            const fallback = getItemDisplayNameWithEnchantment(base);
            const finalName = enchant ? `${fallback} @${enchant}` : fallback;
            return [item.id, finalName] as const;
          }
        }),
      );

      if (!cancelled) {
        setDisplayNames(Object.fromEntries(entries));
      }
    }

    void resolveNames();
    return () => {
      cancelled = true;
    };
  }, [trackedItems, i18n.language]);

  return (
    <Card
      title={t("dashboard.registeredItems")}
      description={t("dashboard.registeredItemsDesc")}
    >
      {trackedItems.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
          {t("dashboard.noItemsYet")}
          <br />
          {t("dashboard.addFirstItemHint")}
        </div>
      ) : (
        <>
          {/* Controles de seleção */}
          <div className="mt-3 mb-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                checked={
                  trackedItems.length > 0 &&
                  selectedItems.size === trackedItems.length
                }
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-border cursor-pointer accent-primary"
              />
              <label
                htmlFor="select-all"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {selectedItems.size === trackedItems.length
                  ? t("dashboard.deselectAll")
                  : t("dashboard.selectAll")}
              </label>
            </div>

            {selectedItems.size > 0 && (
              <button
                type="button"
                onClick={onDeleteSelected}
                disabled={isDeleting}
                className="text-xs rounded-full border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting
                  ? t("dashboard.removing")
                  : t("dashboard.removeSelected", {
                      count: selectedItems.size,
                    })}
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {trackedItems.map((item) => {
              const { base } = splitItemName(item.item_name);
              const displayName =
                displayNames[item.id] ??
                item.display_name ??
                getItemDisplayNameWithEnchantment(base);
              const isSelected = selectedItems.has(item.id);

              return (
                <li
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors ${
                    isSelected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/70 bg-card/80"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="h-4 w-4 rounded border-border cursor-pointer accent-primary flex-shrink-0"
                    />

                    <img
                      src={buildItemImageUrlFromName(item.item_name)}
                      alt={item.item_name}
                      className="h-9 w-9 rounded-md bg-black/40 flex-shrink-0"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://render.albiononline.com/v1/item/T1_BAG.png";
                      }}
                    />

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">
                        {displayName}
                      </span>

                      <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {item.item_name}
                      </span>

                      {item.created_at && (
                        <span className="text-[11px] text-muted-foreground mt-0.5">
                          {t("dashboard.addedAt")}{" "}
                          {new Date(item.created_at).toLocaleDateString(locale)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const raw = window.prompt(
                          t("dashboard.setAlertPrompt") ||
                            "Informe o preço alvo (silver) para receber alerta:",
                        );
                        if (!raw) return;
                        const value = Number(
                          String(raw).replace(/\./g, "").replace(",", "."),
                        );
                        if (!Number.isFinite(value) || value <= 0) {
                          window.alert(
                            t("dashboard.invalidAlertPrice") ||
                              "Valor inválido. Informe um número maior que zero.",
                          );
                          return;
                        }
                        const event = new CustomEvent("dashboard:add-alert", {
                          detail: {
                            itemName: item.item_name,
                            displayName,
                            targetPrice: value,
                          },
                        });
                        window.dispatchEvent(event);
                      }}
                      className="text-[11px] rounded-full border border-primary/40 px-3 py-1 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("dashboard.addPriceAlert") || "Criar alerta de preço"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteSingle(item.id)}
                      disabled={isDeleting}
                      className="text-xs rounded-full border border-destructive/30 px-3 py-1 text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t("dashboard.removeItemButtonTooltip")}
                    >
                      {t("dashboard.removeItem")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
