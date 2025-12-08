import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Card } from "../components/common/Card";
import "../components/common/common.css";

import { createItem, listItems, deleteItem } from "../api/items";
import {
  fetchMyItemsPrices,
  fetchAlbionHistory,
  type AlbionHistoryResponse,
  searchItems,
} from "../api/albion";

import type { ItemPayload, Item, MyItemPrice } from "../api/types";
import type { ApiErrorShape } from "../api/client";
import { getQualityLabel, getQualityColor } from "../constants/qualities";
import { ALBION_TIERS } from "../constants/albion";
import { SearchAutocomplete } from "../components/search/SearchAutocomplete";
import { getItemDisplayNameWithEnchantment } from "../utils/itemNameMapper";
import type { Product } from "@/api/productService";

// Recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type TierFilter = "all" | "no-tier" | number;

function splitItemName(itemName: string): { base: string; enchant?: number } {
  const [base, enchantStr] = itemName.split("@");
  const enchant = enchantStr ? Number(enchantStr) : undefined;
  return { base, enchant };
}

function getTierFromItemName(itemName: string): number | null {
  if (!itemName) return null;
  const match = itemName.match(/^T(\d+)_/);
  if (!match) return null;
  const tier = parseInt(match[1], 10);
  if (Number.isNaN(tier)) return null;
  if (tier < 1 || tier > 8) return null;
  return tier;
}

// Imagem a partir do objeto de preço
function buildItemImageUrl(item: MyItemPrice): string {
  const { base } = splitItemName(item.item_name);
  const enchant =
    item.enchantment && item.enchantment > 0 ? item.enchantment : undefined;
  const enchantSuffix = enchant ? `@${enchant}` : "";
  const fullName = `${base}${enchantSuffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}

// Imagem a partir do nome interno
function buildItemImageUrlFromName(itemName: string): string {
  const [baseName, enchant] = itemName.split("@");
  const enchantSuffix = enchant ? `@${enchant}` : "";
  const fullName = `${baseName}${enchantSuffix}`;

  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedTier, setSelectedTier] = useState<TierFilter>("all");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(
    null,
  );
  const [itemNamesCache, setItemNamesCache] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Locale amigável pro toLocaleString
  const locale =
    i18n.language === "pt"
      ? "pt-BR"
      : i18n.language === "en"
        ? "en-US"
        : i18n.language || "en-US";

  // Quando muda idioma, limpa cache para recarregar nomes
  useEffect(() => {
    setItemNamesCache(new Map());
  }, [i18n.language]);

  // Itens cadastrados pelo usuário
  const itemsQuery = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: listItems,
  });

  // Preços de itens do usuário
  const myPricesQuery = useQuery<MyItemPrice[]>({
    queryKey: ["my-items-prices"],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  // Histórico do item selecionado
  const historyQuery = useQuery<AlbionHistoryResponse>({
    queryKey: ["albion-history", selectedHistoryItem],
    queryFn: () => fetchAlbionHistory(selectedHistoryItem!, 7, ["Caerleon"], "6h"),
    enabled: !!selectedHistoryItem,
  });

  // === MUTATIONS ===

  // Criar item
  const createMutation = useMutation<void, ApiErrorShape, ItemPayload>({
    mutationFn: async (payload) => {
      await createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items-prices"] });
      myPricesQuery.refetch();
    },
  });

  // Remover item único (com update otimista)
  const deleteMutation = useMutation<
    void,
    ApiErrorShape,
    number,
    { previousItems: Item[]; previousPrices: MyItemPrice[] }
  >({
    mutationFn: async (id) => {
      await deleteItem(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      await queryClient.cancelQueries({ queryKey: ["my-items-prices"] });

      const previousItems = queryClient.getQueryData<Item[]>(["items"]) ?? [];
      const previousPrices =
        queryClient.getQueryData<MyItemPrice[]>(["my-items-prices"]) ?? [];

      const removedItem = previousItems.find((it) => it.id === id);
      const removedBase = removedItem
        ? splitItemName(removedItem.item_name).base
        : null;

      // tira item da lista
      queryClient.setQueryData<Item[]>(["items"], (old) =>
        (old ?? []).filter((it) => it.id !== id),
      );

      // tira preços relacionados
      if (removedBase) {
        queryClient.setQueryData<MyItemPrice[]>(["my-items-prices"], (old) =>
          (old ?? []).filter(
            (p) => splitItemName(p.item_name).base !== removedBase,
          ),
        );
      }

      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      return { previousItems, previousPrices };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      if (context?.previousPrices) {
        queryClient.setQueryData(["my-items-prices"], context.previousPrices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items-prices"] });
      myPricesQuery.refetch();
    },
  });

  // Remover vários itens
  const deleteMultipleMutation = useMutation<
    void,
    ApiErrorShape,
    number[],
    { previousItems: Item[]; previousPrices: MyItemPrice[] }
  >({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => deleteItem(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ["items"] });
      await queryClient.cancelQueries({ queryKey: ["my-items-prices"] });

      const previousItems = queryClient.getQueryData<Item[]>(["items"]) ?? [];
      const previousPrices =
        queryClient.getQueryData<MyItemPrice[]>(["my-items-prices"]) ?? [];

      const removedBases = previousItems
        .filter((it) => ids.includes(it.id))
        .map((it) => splitItemName(it.item_name).base);

      queryClient.setQueryData<Item[]>(["items"], (old) =>
        (old ?? []).filter((it) => !ids.includes(it.id)),
      );

      if (removedBases.length > 0) {
        queryClient.setQueryData<MyItemPrice[]>(["my-items-prices"], (old) =>
          (old ?? []).filter(
            (p) => !removedBases.includes(splitItemName(p.item_name).base),
          ),
        );
      }

      setSelectedItems(new Set());

      return { previousItems, previousPrices };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["items"], context.previousItems);
      }
      if (context?.previousPrices) {
        queryClient.setQueryData(["my-items-prices"], context.previousPrices);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items-prices"] });
      myPricesQuery.refetch();
    },
  });

  // === HANDLERS ===

  const handleDelete = (id: number) => {
    if (deleteMutation.isPending || deleteMultipleMutation.isPending) return;

    if (confirm(t("dashboard.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const trackedItems = itemsQuery.data ?? [];
    if (trackedItems.length === 0) return;

    if (selectedItems.size === trackedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(trackedItems.map((item) => item.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (
      selectedItems.size === 0 ||
      deleteMutation.isPending ||
      deleteMultipleMutation.isPending
    )
      return;

    const count = selectedItems.size;
    const message =
      count === 1
        ? t("dashboard.confirmDeleteOne")
        : t("dashboard.confirmDeleteMultiple", { count });

    if (confirm(message)) {
      const idsToDelete = Array.from(selectedItems);
      deleteMultipleMutation.mutate(idsToDelete);
    }
  };

  // === DERIVADOS ===

  const trackedItems = itemsQuery.data ?? [];
  const myPricesRaw = myPricesQuery.data ?? [];

  // Filtrar por preço > 0 e tier selecionado
  const filtered = useMemo(() => {
    return myPricesRaw
      .filter((p) => p && typeof p.price === "number" && p.price > 0)
      .filter((p) => {
        const tier = getTierFromItemName(p.item_name);
        if (selectedTier === "all") return true;
        if (selectedTier === "no-tier") return tier === null;
        return tier === selectedTier;
      });
  }, [myPricesRaw, selectedTier]);

  // Agrupa por item_name e pega o mais barato
  const myPrices = useMemo(() => {
    const cheapestByItem = new Map<string, MyItemPrice>();

    for (const p of filtered) {
      const existing = cheapestByItem.get(p.item_name);
      if (!existing || p.price < existing.price) {
        cheapestByItem.set(p.item_name, p);
      }
    }

    return Array.from(cheapestByItem.values()).sort((a, b) => a.price - b.price);
  }, [filtered]);

  const lowestPrice = myPrices.length > 0 ? myPrices[0].price : null;

  // Cache de nomes traduzidos
  useEffect(() => {
    const fetchNames = async () => {
      const bases = Array.from(
        new Set([
          ...myPrices.map((p) => p.item_name.split("@")[0]),
          ...trackedItems.map((t) => t.item_name.split("@")[0]),
        ]),
      );

      const missing = bases.filter((b) => !itemNamesCache.has(b));
      if (missing.length === 0) return;

      const results = await Promise.all(
        missing.map(async (base) => {
          try {
            const items = await searchItems(base);
            const item = items.find((i) => i.unique_name === base);

            if (item) {
              const name =
                i18n.language.startsWith("pt") // pt ou pt-BR
                  ? item.name_pt || item.name_en || base
                  : item.name_en || item.name_pt || base;

              return { base, name };
            }
          } catch {
            // ignora erro, usa fallback
          }
          return null;
        }),
      );

      const valid = results.filter(
        (r): r is { base: string; name: string } => r !== null,
      );

      if (valid.length > 0) {
        setItemNamesCache((prev) => {
          const next = new Map(prev);
          valid.forEach(({ base, name }) => next.set(base, name));
          return next;
        });
      }
    };

    if (myPrices.length > 0 || trackedItems.length > 0) {
      fetchNames();
    }
  }, [myPrices, trackedItems, i18n.language, itemNamesCache]);

  const getItemDisplayName = (name: string): string => {
    const { base, enchant } = splitItemName(name);
    const cached = itemNamesCache.get(base);
    const display = cached ?? getItemDisplayNameWithEnchantment(base);
    return enchant ? `${display} @${enchant}` : display;
  };

  // Dados para o gráfico
  const chartData = useMemo(() => {
    if (!historyQuery.data) return [];
    return historyQuery.data.data.map((point) => ({
      time: new Date(point.date).toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      avg_price: point.avg_price,
      city: point.city,
    }));
  }, [historyQuery.data, locale]);

  const isDeleting =
    deleteMutation.isPending || deleteMultipleMutation.isPending;

  return (
    <div className="min-h-screen bg-background relative">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top: Resumo + Adicionar item */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <Card
            title={t("dashboard.quickSummary")}
            description={t("dashboard.quickSummaryDesc")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {t("dashboard.trackedItems")}
                </span>
                <p className="mt-2 text-2xl font-semibold">
                  {trackedItems.length}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {t("dashboard.activePrices")}
                </span>
                <p className="mt-2 text-2xl font-semibold">{myPrices.length}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {t("dashboard.bestOpportunity")}
                </span>
                <p className="mt-2 text-lg font-semibold">
                  {lowestPrice !== null
                    ? `${lowestPrice.toLocaleString(locale)} ${t(
                        "dashboard.silver",
                      )}`
                    : "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            title={t("dashboard.addItem")}
            description={t("dashboard.addItemDesc")}
          >
            <div className="mt-3 space-y-3">
              <SearchAutocomplete
                onSelectProduct={(product: Product) => {
                  const internal =
                    product.unique_name ?? (product as any).UniqueName;
                  if (!internal || createMutation.isPending) return;

                  createMutation.mutate({ item_name: internal });
                }}
              />

              {createMutation.isError && (
                <p className="text-xs text-destructive mt-1">
                  {createMutation.error?.message ||
                    t("dashboard.errorAdding")}
                </p>
              )}
            </div>
          </Card>
        </section>

        {/* Bottom: lista + preços / gráfico */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Lista de itens cadastrados */}
          <Card
            title={t("dashboard.registeredItems")}
            description={t("dashboard.registeredItemsDesc")}
          >
            {itemsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : itemsQuery.isError ? (
              <p className="text-sm text-destructive">
                {t("dashboard.errorLoadingItems")}
              </p>
            ) : trackedItems.length > 0 ? (
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
                      onChange={handleSelectAll}
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
                      onClick={handleDeleteSelected}
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
                            onChange={() => handleToggleSelect(item.id)}
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
                              {getItemDisplayNameWithEnchantment(
                                item.item_name,
                              )}
                            </span>

                            <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {base}
                            </span>

                            {item.created_at && (
                              <span className="text-[11px] text-muted-foreground mt-0.5">
                                {t("dashboard.addedAt")}{" "}
                                {new Date(
                                  item.created_at,
                                ).toLocaleDateString(locale)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting}
                          className="text-xs rounded-full border border-destructive/30 px-3 py-1 text-destructive hover:bg-destructive/10 transition-colors ml-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t("dashboard.removeItemButtonTooltip")}
                        >
                          {t("dashboard.removeItem")}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
                {t("dashboard.noItemsYet")}
                <br />
                {t("dashboard.addFirstItemHint")}
              </div>
            )}
          </Card>

          {/* Preços em tempo real + gráfico */}
          <Card
            title={t("dashboard.realtimePrices")}
            description={t("dashboard.realtimePricesDesc")}
          >
            {/* Filtro de Tier */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span>{t("dashboard.tier")}</span>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={String(selectedTier)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "all") {
                      setSelectedTier("all");
                    } else if (value === "no-tier") {
                      setSelectedTier("no-tier");
                    } else {
                      setSelectedTier(Number(value) as number);
                    }
                  }}
                >
                  <option value="all">{t("dashboard.allTiers")}</option>
                  <option value="no-tier">{t("dashboard.noTier")}</option>
                  {ALBION_TIERS.map((tier) => (
                    <option key={tier} value={tier}>
                      T{tier}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {myPricesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.fetchingPrices")}
              </p>
            ) : myPricesQuery.isError ? (
              <p className="text-sm text-destructive">
                {t("dashboard.errorLoadingPrices")}
              </p>
            ) : myPrices.length > 0 ? (
              <>
                {/* Tabela de preços */}
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
                      {myPrices.map((item) => (
                        <tr
                          key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                          className="cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => setSelectedHistoryItem(item.item_name)}
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
                                  {getItemDisplayName(item.item_name)}
                                </span>
                                <span className="text-[11px] text-muted-foreground mt-0.5">
                                  {splitItemName(item.item_name).base}
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
                                  item.quality === 5
                                    ? "0 0 10px #FF9800"
                                    : "none",
                              }}
                            >
                              {getQualityLabel(item.quality)}
                            </span>
                          </td>

                          <td className="px-3 py-2 align-middle">
                            {item.enchantment > 0
                              ? `.${item.enchantment}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráfico de histórico */}
                {selectedHistoryItem && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2">
                      {t("dashboard.priceHistory")}{" "}
                      <span className="text-muted-foreground">
                        {getItemDisplayName(selectedHistoryItem)}
                      </span>
                    </h3>

                    {historyQuery.isLoading && (
                      <p className="text-sm text-muted-foreground">
                        {t("dashboard.loadingChart")}
                      </p>
                    )}

                    {historyQuery.isError && (
                      <p className="text-sm text-destructive">
                        {t("dashboard.errorLoadingHistory")}
                      </p>
                    )}

                    {!historyQuery.isLoading &&
                      !historyQuery.isError &&
                      chartData.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.insufficientData")}
                        </p>
                      )}

                    {!historyQuery.isLoading &&
                      !historyQuery.isError &&
                      chartData.length > 0 && (
                        <div style={{ width: "100%", height: 260 }}>
                          <ResponsiveContainer>
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="avg_price"
                                dot={false}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
                {t("dashboard.noItemsToMonitor")}
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
