import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sword,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Shield,
  Sliders,
} from "lucide-react";

import { fetchMetaBuilds, fetchMetaMarket } from "@/api/albion";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegion } from "@/context/RegionContext";
import { BuildCard } from "./meta/BuildCard";

export function MetaMarketPage() {
  const { region } = useRegion();
  const [killLimit, setKillLimit] = useState(40);
  const [topBuilds, setTopBuilds] = useState(8);
  const [topItems, setTopItems] = useState(12);
  const [minIp, setMinIp] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const buildsQuery = useQuery({
    queryKey: ["meta-builds", region, killLimit, topBuilds, minIp],
    queryFn: () => fetchMetaBuilds(region, killLimit, topBuilds, minIp),
    refetchInterval: 1000 * 60 * 3,
    staleTime: 1000 * 60 * 2,
  });

  const marketQuery = useQuery({
    queryKey: ["meta-market", region, killLimit, topItems],
    queryFn: () => fetchMetaMarket(region, killLimit, topItems),
    refetchInterval: 1000 * 60 * 3,
    staleTime: 1000 * 60 * 2,
  });

  const builds = buildsQuery.data?.builds ?? [];
  const marketRows = marketQuery.data?.data ?? [];
  const maxCost = Math.max(...builds.map((b) => b.total_cost), 1);
  const analyzedKills = buildsQuery.data?.kill_events_analyzed ?? 0;

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Meta Builds"
        description="Analise de builds PvP em tempo real com custo de mercado e score meta x spread entre cidades."
      />

      <div className="app-container py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <Sword className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                  Meta Builds + Mercado
                </h1>
                <p className="text-muted-foreground font-medium mt-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 opacity-50" />
                  Meta de PvP cruzado com custo e spread de mercado
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-2.5 rounded-2xl shadow-xl">
              <div className="px-4 text-center border-r border-border/40">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Kills analisados
                </div>
                <div className="text-xl font-black tracking-tighter text-primary">
                  {analyzedKills || killLimit}
                </div>
              </div>
              <div className="px-4 text-center border-r border-border/40">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Builds unicos
                </div>
                <div className="text-xl font-black tracking-tighter text-foreground">
                  {builds.length}
                </div>
              </div>
              <div className="px-4 text-center border-r border-border/40">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Itens meta
                </div>
                <div className="text-xl font-black tracking-tighter text-foreground">
                  {marketRows.length}
                </div>
              </div>
              <div className="px-3 flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse mb-0.5" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  Live
                </span>
              </div>
            </div>

            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10 gap-1.5 border-border/40"
            >
              <Sliders size={13} />
              Filtros
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                buildsQuery.refetch();
                marketQuery.refetch();
              }}
              disabled={buildsQuery.isFetching || marketQuery.isFetching}
              className="rounded-xl h-10 border-border/40"
            >
              <RefreshCw
                className={`w-4 h-4 ${buildsQuery.isFetching || marketQuery.isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-xl rounded-2xl animate-fade-up">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-end gap-5">
                <div className="space-y-2 w-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Sword className="w-3 h-3" /> Kills analisados
                  </p>
                  <Input
                    type="number"
                    min={10}
                    max={51}
                    value={killLimit}
                    onChange={(e) =>
                      setKillLimit(Math.min(51, Math.max(10, Number(e.target.value) || 40)))
                    }
                    className="h-9 bg-background/40 border-border/40 focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-2 w-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Top builds
                  </p>
                  <Input
                    type="number"
                    min={3}
                    max={15}
                    value={topBuilds}
                    onChange={(e) =>
                      setTopBuilds(Math.min(15, Math.max(3, Number(e.target.value) || 8)))
                    }
                    className="h-9 bg-background/40 border-border/40 focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-2 w-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Top itens
                  </p>
                  <Input
                    type="number"
                    min={3}
                    max={30}
                    value={topItems}
                    onChange={(e) =>
                      setTopItems(Math.min(30, Math.max(3, Number(e.target.value) || 12)))
                    }
                    className="h-9 bg-background/40 border-border/40 focus:border-primary/50 font-bold"
                  />
                </div>
                <div className="space-y-2 w-48">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> IP minimo do killer
                  </p>
                  <Input
                    type="number"
                    min={0}
                    max={3000}
                    step={100}
                    value={minIp || ""}
                    placeholder="Ex: 1000"
                    onChange={(e) => setMinIp(Number(e.target.value) || 0)}
                    className="h-9 bg-background/40 border-border/40 focus:border-primary/50 font-bold"
                  />
                </div>
                <Button
                  onClick={() => {
                    buildsQuery.refetch();
                    marketQuery.refetch();
                  }}
                  disabled={buildsQuery.isFetching || marketQuery.isFetching}
                  className="h-9 gap-2 font-black uppercase tracking-wider text-xs shadow-lg shadow-primary/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${buildsQuery.isFetching || marketQuery.isFetching ? "animate-spin" : ""}`} />
                  Analisar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {buildsQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-60">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                Analisando kills recentes...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Precificando equipamentos via Albion Data Project
              </p>
            </div>
          </div>
        ) : buildsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 text-center">
            <AlertCircle className="w-16 h-16 text-destructive/40 mb-4" />
            <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Erro ao buscar builds</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Nao foi possivel conectar a API para analisar builds agora.
            </p>
            <Button
              variant="destructive"
              onClick={() => buildsQuery.refetch()}
              className="font-bold uppercase tracking-widest shadow-lg shadow-destructive/20"
            >
              Tentar novamente
            </Button>
          </div>
        ) : builds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-border/40 bg-card/20 text-center">
            <Sword className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-black tracking-tight uppercase">Nenhum build encontrado</h3>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm">
              Nao ha kills suficientes ou os dados ainda nao carregaram.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {builds.map((build, idx) => (
              <BuildCard
                key={build.signature}
                build={build}
                maxCost={maxCost}
                animationDelay={Math.min(idx * 0.08, 0.5)}
              />
            ))}
          </div>
        )}

        <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-xl rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight uppercase">Meta x Mercado (Itens)</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => marketQuery.refetch()}
                disabled={marketQuery.isFetching}
                className="rounded-xl border-border/40"
              >
                <RefreshCw className={`w-4 h-4 ${marketQuery.isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {marketQuery.isLoading ? (
              <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Carregando itens meta...
              </div>
            ) : marketQuery.isError ? (
              <div className="py-8 flex items-center justify-center text-destructive gap-2">
                <AlertCircle className="w-4 h-4" />
                Nao foi possivel carregar o score meta x mercado.
              </div>
            ) : marketRows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Sem dados no momento.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border/40">
                      <th className="py-2 pr-3">Item</th>
                      <th className="py-2 pr-3">Freq</th>
                      <th className="py-2 pr-3">Compra</th>
                      <th className="py-2 pr-3">Venda</th>
                      <th className="py-2 pr-3">Spread</th>
                      <th className="py-2">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketRows.map((row) => (
                      <tr key={`${row.item_id}-${row.buy_city}-${row.sell_city}`} className="border-b border-border/20">
                        <td className="py-2 pr-3 font-semibold">{row.item_id}</td>
                        <td className="py-2 pr-3">{row.meta_frequency}</td>
                        <td className="py-2 pr-3">
                          {row.buy_city} ({row.buy_price.toLocaleString("pt-BR")})
                        </td>
                        <td className="py-2 pr-3">
                          {row.sell_city} ({row.sell_price.toLocaleString("pt-BR")})
                        </td>
                        <td className="py-2 pr-3">
                          {row.spread.toLocaleString("pt-BR")} ({row.spread_pct}%)
                        </td>
                        <td className="py-2 font-black text-primary">{row.meta_market_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
