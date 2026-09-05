// src/pages/GuildHubPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Sword,
  Loader2,
  AlertCircle,
  Crown,
  Swords,
  ChevronRight,
} from "lucide-react";

import { fetchGuildSummary, fetchGuildEconomy } from "@/api/albion";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/context/RegionContext";
import { GuildSearchBar } from "./guild/GuildSearchBar";
import { GuildEconomyStats } from "./guild/GuildEconomyStats";
import { MemberBreakdown } from "./guild/MemberBreakdown";
import type { GuildSearchResult } from "@/api/types";

function formatFame(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString("pt-BR");
}

export function GuildHubPage() {
  const { region } = useRegion();
  const [selectedGuild, setSelectedGuild] = useState<GuildSearchResult | null>(null);
  const memberLimit = 15;

  const summaryQuery = useQuery({
    queryKey: ["guild-summary", selectedGuild?.id, region],
    queryFn: () => fetchGuildSummary(selectedGuild!.id, region),
    enabled: !!selectedGuild,
    staleTime: 1000 * 60 * 5,
  });

  const economyQuery = useQuery({
    queryKey: ["guild-economy", selectedGuild?.id, region, memberLimit],
    queryFn: () => fetchGuildEconomy(selectedGuild!.id, memberLimit, region),
    enabled: !!selectedGuild,
    staleTime: 1000 * 60 * 3,
  });

  const guild = summaryQuery.data?.guild;
  const guildStats = summaryQuery.data?.stats;
  const topKillers = summaryQuery.data?.top_killers ?? [];
  const economy = economyQuery.data;

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="Guild Economy Hub"
        description="Painel financeiro de guilda — analise o valor destruído e perdido nos combates PvP recentes."
      />

      <div className="app-container py-12 space-y-8">
        {/* ── Header ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Users className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                Guild Economy Hub
              </h1>
              <p className="text-muted-foreground font-medium mt-1 flex items-center gap-2">
                <Swords className="w-4 h-4 opacity-50" />
                Analise o impacto financeiro dos combates PvP da sua guilda
              </p>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="flex items-start gap-4">
          <GuildSearchBar
            onSelect={(g) => setSelectedGuild(g)}
            isLoading={summaryQuery.isFetching || economyQuery.isFetching}
          />
          {selectedGuild && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGuild(null)}
              className="h-12 text-muted-foreground hover:text-destructive border border-border/40 rounded-2xl"
            >
              Limpar
            </Button>
          )}
        </div>

        {/* ── Empty State ── */}
        {!selectedGuild && (
          <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border-2 border-dashed border-border/20 bg-card/10 text-center">
            <div className="bg-primary/10 p-6 rounded-3xl mb-6">
              <Users className="w-16 h-16 text-primary/40" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">
              Busque uma guilda para começar
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Digite o nome de uma guilda para visualizar o balanço financeiro dos combates PvP recentes.
              <br />
              <span className="text-xs opacity-60 mt-1 block">
                Requer pelo menos alguns embates recentes com drops para precificar.
              </span>
            </p>
          </div>
        )}

        {/* ── Loading ── */}
        {selectedGuild && (summaryQuery.isLoading || economyQuery.isLoading) && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest animate-pulse">
                Carregando dados da guilda…
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Buscando kills, deaths e precificando equipamentos
              </p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {selectedGuild && (summaryQuery.isError || economyQuery.isError) && (
          <div className="flex flex-col items-center justify-center py-16 px-6 rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 text-center">
            <AlertCircle className="w-14 h-14 text-destructive/40 mb-4" />
            <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Erro ao carregar</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm">
              Não foi possível obter dados desta guilda. Verifique se o nome está correto.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                summaryQuery.refetch();
                economyQuery.refetch();
              }}
              className="font-bold uppercase tracking-widest"
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* ── Guild Data ── */}
        {guild && !summaryQuery.isLoading && (
          <div className="space-y-6 animate-fade-up">
            {/* Guild Header Card */}
            <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tighter text-foreground">
                          {guild.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {guild.alliance_name && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-widest">
                              [{guild.alliance_name}]
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-border/40">
                            <Users className="w-2.5 h-2.5 mr-1" />
                            {guild.member_count} membros
                          </Badge>
                          {guild.founder && (
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-border/40">
                              Fundador: {guild.founder}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fame stats */}
                    <div className="flex gap-4">
                      <div className="text-center px-4 border-r border-border/20">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Kill Fame
                        </div>
                        <div className="text-xl font-black text-primary">
                          {formatFame(guildStats?.total_kill_fame ?? 0)}
                        </div>
                      </div>
                      <div className="text-center px-4 border-r border-border/20">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          Death Fame
                        </div>
                        <div className="text-xl font-black text-destructive/80">
                          {formatFame(guildStats?.total_death_fame ?? 0)}
                        </div>
                      </div>
                      <div className="text-center px-4">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          K/D Ratio
                        </div>
                        <div className="text-xl font-black text-amber-400">
                          {guildStats?.fame_ratio?.toFixed(2) ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Economy Stats */}
            {economy && !economyQuery.isLoading && (
              <>
                <GuildEconomyStats guild={guild} totals={economy.totals} />
                <MemberBreakdown members={economy.members} />
              </>
            )}

            {economyQuery.isLoading && (
              <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-black uppercase tracking-widest animate-pulse">
                  Precificando equipamentos…
                </span>
              </div>
            )}

            {/* Top Killers */}
            {topKillers.length > 0 && (
              <Card className="bg-card/40 border-border/40 backdrop-blur-md shadow-xl">
                <CardContent className="p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Sword className="w-3.5 h-3.5" /> Top Killers — Kill Fame
                  </h3>
                  <div className="space-y-2">
                    {topKillers.slice(0, 5).map((member, i) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/20"
                      >
                        <span className="text-xs font-black text-muted-foreground/40 w-4">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-bold">{member.name}</span>
                        <span className="text-emerald-400 font-black text-sm tabular-nums">
                          {formatFame(member.kill_fame)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
