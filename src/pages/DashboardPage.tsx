// src/pages/DashboardPage.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
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

// recharts
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

// helper: extrai o tier do nome interno (T4_BAG@2 -> 4, T1_BAG -> 1, etc.)
function getTierFromItemName(itemName: string): number | null {
  if (!itemName) return null;

  const match = itemName.match(/^T(\d+)_/);
  if (!match) return null;

  const tier = parseInt(match[1], 10);
  if (Number.isNaN(tier)) return null;

  if (tier < 1 || tier > 8) return null;
  return tier;
}

// helper: monta a URL da imagem direto da API do Albion
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


function buildItemImageUrlFromName(itemName: string): string {
  const [baseName, enchant] = itemName.split("@");
  const enchantSuffix = enchant ? `@${enchant}` : "";
  const fullName = `${baseName}${enchantSuffix}`;
  return `https://render.albiononline.com/v1/item/${encodeURIComponent(
    fullName,
  )}.png`;
}


export function DashboardPage() {
  const queryClient = useQueryClient();
  const { handleSubmit, reset } = useForm<ItemPayload>({
    defaultValues: { item_name: "" },
  });

  const [selectedTier, setSelectedTier] = useState<TierFilter>("all");
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [itemNamesCache, setItemNamesCache] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Itens salvos pelo usuário
  const itemsQuery = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: listItems,
  });

  // Preços dos itens do usuário
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

  // Criar item
  const createMutation = useMutation<void, ApiErrorShape, ItemPayload>({
    mutationFn: async (payload) => {
      await createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["my-items-prices"] });
      myPricesQuery.refetch();
      reset();
    },
  });

  // Remover item
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
      const removedBase = removedItem ? splitItemName(removedItem.item_name).base : null;

      queryClient.setQueryData<Item[]>(["items"], (old) =>
        (old ?? []).filter((it) => it.id !== id),
      );

      if (removedBase) {
        queryClient.setQueryData<MyItemPrice[]>(["my-items-prices"], (old) =>
          (old ?? []).filter((p) => splitItemName(p.item_name).base !== removedBase),
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

  const onSubmit = (payload: ItemPayload) => {
    const name = payload.item_name?.trim().toUpperCase();
    if (!name) return;
    createMutation.mutate({ item_name: name });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que quer remover este item da sua lista?")) {
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
    if (selectedItems.size === trackedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(trackedItems.map((item) => item.id)));
    }
  };

  // Remover múltiplos itens
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

  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) return;
    
    const count = selectedItems.size;
    const message = count === 1 
      ? "Tem certeza que quer remover este item da sua lista?"
      : `Tem certeza que quer remover ${count} itens da sua lista?`;
    
    if (confirm(message)) {
      const idsToDelete = Array.from(selectedItems);
      deleteMultipleMutation.mutate(idsToDelete);
    }
  };

  const trackedItems = itemsQuery.data ?? [];
  const myPricesRaw = myPricesQuery.data ?? [];

  // 1) filtra por preço válido + tier
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

  // 2) agrupa por item_name e pega o MAIS BARATO de cada item
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

  const lowestPrice = useMemo(
    () => (myPrices.length > 0 ? myPrices[0].price : null),
    [myPrices],
  );

  // Busca nomes em português para os itens (tanto da lista monitorada quanto dos preços)
  useEffect(() => {
    const fetchItemNames = async () => {
      const uniqueItemNames = Array.from(
        new Set([
          ...myPrices.map((p) => p.item_name.split("@")[0]),
          ...trackedItems.map((t) => t.item_name.split("@")[0]),
        ]),
      );

      const promises = uniqueItemNames
        .filter((baseName) => !itemNamesCache.has(baseName))
        .map(async (baseName) => {
          try {
            const results = await searchItems(baseName);
            // results: AlbionSearchItem[] (unique_name, name_pt, name_en)
            const found = results.find((r) => r.unique_name === baseName);

            if (found) {
              const label =
                found.name_pt ??
                found.name_en ??
                found.unique_name;

              if (label) {
                return { baseName, name: label };
              }
            }
            return null;

          } catch {
            // silenciosamente falha, usa fallback
          }
          return null;
        });

      const results = await Promise.all(promises);
      const newEntries = results.filter(
        (r): r is { baseName: string; name: string } => r !== null,
      );

      if (newEntries.length > 0) {
        setItemNamesCache((prev) => {
          const newMap = new Map(prev);
          newEntries.forEach(({ baseName, name }) => {
            newMap.set(baseName, name);
          });
          return newMap;
        });
      }
    };

    if (myPrices.length > 0 || trackedItems.length > 0) {
      fetchItemNames();
    }
  }, [myPrices, trackedItems]);

  // Função helper para obter nome do item (PT ou fallback), preservando encantamento
  const getItemDisplayName = (itemName: string): string => {
    const { base, enchant } = splitItemName(itemName);
    const cachedName = itemNamesCache.get(base);

    const baseLabel = cachedName ?? getItemDisplayNameWithEnchantment(base);
    return enchant ? `${baseLabel} @${enchant}` : baseLabel;
  };



  // Dados formatados para o gráfico
  const chartData = useMemo(() => {
    if (!historyQuery.data) return [];
    return historyQuery.data.data.map((point) => ({
      time: new Date(point.date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      avg_price: point.avg_price,
      city: point.city,
    }));
  }, [historyQuery.data]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top cards: resumo + adicionar item */}
        <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          <Card
            title="Resumo rápido"
            description="Seus itens monitorados em tempo real."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Itens rastreados
                </span>
                <p className="mt-2 text-2xl font-semibold">{trackedItems.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Com preço ativo
                </span>
                <p className="mt-2 text-2xl font-semibold">{myPrices.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  Melhor oportunidade
                </span>
                <p className="mt-2 text-lg font-semibold">
                  {lowestPrice !== null
                    ? `${lowestPrice.toLocaleString("pt-BR")} silver`
                    : "—"}
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Adicionar item"
            description="Busque pelo nome PT/EN ou código interno (ex: T8_BAG@3)."
          >
            <form
              className="mt-3 space-y-3"
              onSubmit={handleSubmit(onSubmit)}
            >
              <SearchAutocomplete
  onSelectProduct={(product: any) => {
    const internal = product.unique_name ?? product.UniqueName;
    if (!internal) return;
    createMutation.mutate({ item_name: internal });
    reset({ item_name: "" });
  }}
/>


              {createMutation.error && (
                <p className="text-xs text-destructive mt-1">
                  {createMutation.error.message || "Erro ao adicionar item."}
                </p>
              )}
            </form>
          </Card>
        </section>

        {/* Bottom grid: lista + preços em tempo real + gráfico */}
        <section className="grid gap-6 lg:grid-cols-2">
        <Card
  title="Itens cadastrados"
  description="Selecione os itens que deseja remover."
>
  {itemsQuery.isLoading ? (
    <p className="text-sm text-muted-foreground">Carregando...</p>
  ) : itemsQuery.isError ? (
    <p className="text-sm text-destructive">Erro ao carregar itens.</p>
  ) : trackedItems.length > 0 ? (
    <>
      {/* Controles de seleção */}
      <div className="mt-3 mb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedItems.size === trackedItems.length && trackedItems.length > 0}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-border cursor-pointer accent-primary"
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
            {selectedItems.size === trackedItems.length ? "Desselecionar todos" : "Selecionar todos"}
          </label>
        </div>
        {selectedItems.size > 0 && (
          <button
            className="text-xs rounded-full border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition-colors font-medium"
            onClick={handleDeleteSelected}
            disabled={deleteMutation.isPending || deleteMultipleMutation.isPending}
          >
            {deleteMultipleMutation.isPending ? "Removendo..." : `Remover ${selectedItems.size} ${selectedItems.size === 1 ? "item" : "itens"}`}
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
                  {/* Nome bonito (PT/EN), sem @n */}
                  <span className="font-medium truncate">
                    {getItemDisplayNameWithEnchantment(item.item_name)}
                  </span>

                  {/* Código interno base, sem @n */}
                  <span className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {base}
                  </span>

                  {item.created_at && (
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Adicionado em{" "}
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="text-xs rounded-full border border-destructive/30 px-3 py-1 text-destructive hover:bg-destructive/10 transition-colors ml-2 flex-shrink-0"
                onClick={() => handleDelete(item.id)}
                disabled={deleteMutation.isPending}
                title="Remover item"
              >
                Remover
              </button>
            </li>
          );
        })}
      </ul>
    </>
  ) : (
    <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
      Nenhum item adicionado ainda.
      <br />
      Comece adicionando um acima!
    </div>
  )}
</Card>


          <Card
            title="Preços em tempo real"
            description="Clique em um item para ver o histórico de preço."
          >
            {/* FILTRO DE TIER */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <span>Tier</span>
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
                  <option value="all">Todos</option>
                  <option value="no-tier">Sem tier</option>
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
                Buscando preços nas cidades...
              </p>
            ) : myPricesQuery.isError ? (
              <p className="text-sm text-destructive">Erro ao carregar preços.</p>
            ) : myPrices.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-xl border border-border/70">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                          Item
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                          Cidade
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                          Preço
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                          Qualidade
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                          Encant.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {myPrices.map((item) => (
                        <tr
                          key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                          className="cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => setSelectedHistoryItem(item.item_name)}
                          title="Clique para ver o histórico deste item"
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
                              ? `${item.price.toLocaleString("pt-BR")} silver`
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
                            {item.enchantment > 0 ? `.${item.enchantment}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* GRÁFICO DE HISTÓRICO */}
                {selectedHistoryItem && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-2">
                      Histórico de preço —{" "}
                      <span className="text-muted-foreground">
                        {getItemDisplayName(selectedHistoryItem)}
                      </span>
                    </h3>

                    {historyQuery.isLoading && (
                      <p className="text-sm text-muted-foreground">
                        Carregando gráfico...
                      </p>
                    )}

                    {historyQuery.isError && (
                      <p className="text-sm text-destructive">
                        Não foi possível carregar o histórico deste item.
                      </p>
                    )}

                    {!historyQuery.isLoading &&
                      !historyQuery.isError &&
                      chartData.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Sem dados suficientes de histórico para este item.
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
                Adicione itens para começar a monitorar os preços!
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
