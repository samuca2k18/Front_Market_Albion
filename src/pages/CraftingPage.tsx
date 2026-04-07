import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Factory,
  Flame,
  Hammer,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";

import { fetchAlbionPrices } from "@/api/albion";
import {
  fetchConsumableCraftings,
  fetchConsumables,
  getOpenAlbionUniqueName,
} from "@/api/openalbion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegion } from "@/context/RegionContext";
import { getItemDisplayNameWithEnchantment, getItemImageUrl } from "@/utils/items";

const CITIES = [
  "Bridgewatch",
  "Caerleon",
  "Fort Sterling",
  "Lymhurst",
  "Martlock",
  "Thetford",
  "Brecilien",
];

function getUnitPriceByCity(
  entries: { item_id?: string; city: string; sell_price_min: number }[],
  itemId: string,
  city: string,
): number {
  const candidates = entries.filter(
    (entry) => entry.item_id === itemId && entry.city === city && entry.sell_price_min > 0,
  );
  if (candidates.length === 0) return 0;
  return candidates.reduce((acc, row) => (row.sell_price_min < acc ? row.sell_price_min : acc), candidates[0].sell_price_min);
}

export function CraftingPage() {
  const { region } = useRegion();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConsumableId, setSelectedConsumableId] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState("Caerleon");
  const [focusReturnPct, setFocusReturnPct] = useState(0);
  const [journalBonusPct, setJournalBonusPct] = useState(0);
  const [marketTaxPct, setMarketTaxPct] = useState(6.5);
  const [craftingFee, setCraftingFee] = useState(0);

  const consumablesQuery = useQuery({
    queryKey: ["crafting-consumables"],
    queryFn: () => fetchConsumables(),
    staleTime: 1000 * 60 * 60,
  });

  const consumables = consumablesQuery.data?.data ?? [];
  const filteredConsumables = (() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return consumables.slice(0, 18);

    return consumables
      .filter((item) => {
        const base = item.name.toLowerCase();
        const unique = getOpenAlbionUniqueName(item).toLowerCase();
        return base.includes(query) || unique.includes(query);
      })
      .slice(0, 18);
  })();

  const selectedConsumable = consumables.find((item) => item.id === selectedConsumableId);
  const selectedUniqueName = selectedConsumable
    ? getOpenAlbionUniqueName(selectedConsumable)
    : "";

  const recipeQuery = useQuery({
    queryKey: ["crafting-recipe", selectedConsumableId],
    queryFn: () => fetchConsumableCraftings(selectedConsumableId!),
    enabled: Boolean(selectedConsumableId),
    staleTime: 1000 * 60 * 60,
  });

  const recipe = recipeQuery.data?.data?.[0];
  const materialIds = recipe?.materials.map((mat) => mat.resource) ?? [];

  const itemNamesToPrice = Array.from(
    new Set([selectedUniqueName, ...materialIds].filter((value): value is string => Boolean(value))),
  );

  const pricesQuery = useQuery({
    queryKey: ["crafting-prices", region, selectedCity, itemNamesToPrice.join(",")],
    queryFn: () => fetchAlbionPrices(itemNamesToPrice, [selectedCity], undefined, region),
    enabled: itemNamesToPrice.length > 0,
    staleTime: 1000 * 60 * 3,
  });

  const calculation = recipe && selectedUniqueName && pricesQuery.data
    ? (() => {
        const entries = pricesQuery.data.all_data;
        const materialRows = recipe.materials.map((material) => {
          const unitPrice = getUnitPriceByCity(entries, material.resource, selectedCity);
          const totalCost = unitPrice * material.amount;
          return {
            ...material,
            unitPrice,
            totalCost,
          };
        });

        const rawMaterialCost = materialRows.reduce((sum, row) => sum + row.totalCost, 0);
        const focusMultiplier = Math.max(0, 1 - focusReturnPct / 100);
        const effectiveMaterialCost = rawMaterialCost * focusMultiplier;

        const saleUnitPrice = getUnitPriceByCity(entries, selectedUniqueName, selectedCity);
        const effectiveYield = recipe.yield_amount * (1 + journalBonusPct / 100);
        const grossRevenue = saleUnitPrice * effectiveYield;
        const netRevenue = grossRevenue * (1 - marketTaxPct / 100);

        const profit = netRevenue - effectiveMaterialCost - craftingFee;
        const roi = effectiveMaterialCost > 0 ? (profit / effectiveMaterialCost) * 100 : 0;

        return {
          materialRows,
          rawMaterialCost,
          effectiveMaterialCost,
          saleUnitPrice,
          effectiveYield,
          grossRevenue,
          netRevenue,
          profit,
          roi,
        };
      })()
    : null;

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
          <Hammer className="w-8 h-8 text-primary" />
          Crafting Calculator
        </h1>
        <p className="text-muted-foreground font-medium">
          Receita, custo de materiais e lucro por cidade com foco e diarios.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/40 backdrop-blur-md border-border/40 rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/10 border-b border-border/20 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Buscar Consumivel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Ex: potion, stew, T6_POTION"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="bg-background/60 border-border/40 font-mono text-sm"
              />

              <div className="space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar pr-2">
                {consumablesQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full rounded-2xl" />
                    ))
                  : filteredConsumables.map((item) => {
                      const uniqueName = getOpenAlbionUniqueName(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedConsumableId(item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            selectedConsumableId === item.id
                              ? "bg-primary/10 border-primary/40 shadow-sm"
                              : "bg-background/40 border-border/20 hover:bg-background/80"
                          }`}
                        >
                          <div className="bg-black/30 p-1.5 rounded-xl">
                            <img
                              src={getItemImageUrl(uniqueName || item.name)}
                              alt=""
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-black truncate">
                              {getItemDisplayNameWithEnchantment(item.name)}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">
                              {uniqueName || item.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!selectedConsumableId ? (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/40 rounded-3xl bg-card/20 text-center">
              <Factory className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2">Nenhum item selecionado</h3>
              <p className="text-muted-foreground">
                Escolha um consumivel para calcular custo e retorno por cidade.
              </p>
            </div>
          ) : recipeQuery.isLoading || pricesQuery.isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-border/20 bg-card/10">
              <Zap className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
                Processando receita e mercado...
              </p>
            </div>
          ) : !recipe ? (
            <div className="p-12 text-center rounded-3xl border-2 border-amber-500/20 bg-amber-500/5">
              <p className="font-bold text-amber-500">
                Nenhuma receita encontrada para este item no OpenAlbion.
              </p>
            </div>
          ) : !calculation ? (
            <div className="p-12 text-center rounded-3xl border-2 border-red-500/20 bg-red-500/5">
              <p className="font-bold text-red-400">Nao foi possivel calcular os valores.</p>
            </div>
          ) : (
            <>
              <Card className="bg-card/60 backdrop-blur-xl border border-border/40 rounded-3xl shadow-2xl overflow-hidden">
                <CardContent className="p-6 grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <div className="bg-black/40 p-3 rounded-2xl border border-border/20">
                      <img
                        src={getItemImageUrl(selectedUniqueName || selectedConsumable?.name || "")}
                        alt=""
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                        Yield base: {recipe.yield_amount}x
                      </Badge>
                      <h2 className="text-2xl font-black">
                        {getItemDisplayNameWithEnchantment(selectedConsumable?.name || "")}
                      </h2>
                      <p className="text-[11px] text-muted-foreground font-mono">{selectedUniqueName || "sem unique_name"}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs font-bold text-muted-foreground space-y-1">
                      Cidade
                      <select
                        value={selectedCity}
                        onChange={(event) => setSelectedCity(event.target.value)}
                        className="w-full h-10 rounded-xl border border-border/40 bg-background/70 px-3 text-sm font-semibold"
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs font-bold text-muted-foreground space-y-1">
                      Retorno com foco (%)
                      <Input
                        type="number"
                        min={0}
                        max={90}
                        value={focusReturnPct}
                        onChange={(event) => setFocusReturnPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="text-xs font-bold text-muted-foreground space-y-1">
                      Bonus diario (%)
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={journalBonusPct}
                        onChange={(event) => setJournalBonusPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="text-xs font-bold text-muted-foreground space-y-1">
                      Taxa de venda (%)
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        value={marketTaxPct}
                        onChange={(event) => setMarketTaxPct(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>

                    <label className="text-xs font-bold text-muted-foreground space-y-1 sm:col-span-2">
                      Taxa fixa de craft (Ag)
                      <Input
                        type="number"
                        min={0}
                        value={craftingFee}
                        onChange={(event) => setCraftingFee(Number(event.target.value || 0))}
                        className="bg-background/70"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border/40 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Arvore de Materiais ({selectedCity})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calculation.materialRows.map((material) => (
                      <div
                        key={`${material.resource}-${material.id}`}
                        className="flex items-center justify-between rounded-2xl border border-border/20 bg-background/40 px-3 py-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={getItemImageUrl(material.resource)}
                            className="w-8 h-8 rounded-lg outline outline-1 outline-border/40 bg-black/40"
                            alt=""
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-black truncate">
                              {material.amount}x {getItemDisplayNameWithEnchantment(material.resource)}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {material.unitPrice > 0
                                ? `${material.unitPrice.toLocaleString("pt-BR")} Ag/un`
                                : "sem preco na cidade"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-orange-400">
                          {material.totalCost.toLocaleString("pt-BR")} Ag
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/40 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Resultado Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Custo base dos materiais</span>
                      <strong>{calculation.rawMaterialCost.toLocaleString("pt-BR")} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Custo apos foco</span>
                      <strong>{calculation.effectiveMaterialCost.toLocaleString("pt-BR")} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Preco unitario de venda</span>
                      <strong>{calculation.saleUnitPrice.toLocaleString("pt-BR")} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Yield efetivo (com diario)</span>
                      <strong>{calculation.effectiveYield.toFixed(2)}x</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Receita liquida (apos taxa)</span>
                      <strong>{calculation.netRevenue.toLocaleString("pt-BR")} Ag</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Taxa fixa de craft</span>
                      <strong>{craftingFee.toLocaleString("pt-BR")} Ag</strong>
                    </div>

                    <div className="border-t border-border/30 pt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lucro estimado</p>
                        <p className={`text-3xl font-black tracking-tight ${calculation.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {calculation.profit >= 0 ? "+" : ""}
                          {calculation.profit.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Badge
                        className={
                          calculation.roi >= 0
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }
                      >
                        ROI {calculation.roi >= 0 ? "+" : ""}
                        {calculation.roi.toFixed(2)}%
                      </Badge>
                    </div>

                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                      Regiao ativa: {region}. O calculo usa somente precos de {selectedCity}.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
