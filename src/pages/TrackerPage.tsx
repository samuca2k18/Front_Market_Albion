import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Sword } from "lucide-react";

import {
  fetchPlayerDeaths,
  fetchPlayerKills,
  fetchPlayerProfile,
  searchPlayers,
  type KillEvent,
} from "@/api/albion";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";

function sumFame(events: KillEvent[] | undefined): number {
  if (!events?.length) return 0;
  return events.reduce((acc, row) => acc + (row.total_fame || 0), 0);
}

export function TrackerPage() {
  const [query, setQuery] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const playersQuery = useQuery({
    queryKey: ["tracker-player-search", debouncedQuery],
    queryFn: () => searchPlayers(debouncedQuery, 20),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60,
  });

  const profileQuery = useQuery({
    queryKey: ["tracker-player-profile", selectedPlayerId],
    queryFn: () => fetchPlayerProfile(selectedPlayerId!),
    enabled: Boolean(selectedPlayerId),
    staleTime: 1000 * 30,
  });

  const killsQuery = useQuery({
    queryKey: ["tracker-player-kills", selectedPlayerId],
    queryFn: () => fetchPlayerKills(selectedPlayerId!, 20, 0),
    enabled: Boolean(selectedPlayerId),
    staleTime: 1000 * 30,
  });

  const deathsQuery = useQuery({
    queryKey: ["tracker-player-deaths", selectedPlayerId],
    queryFn: () => fetchPlayerDeaths(selectedPlayerId!, 20, 0),
    enabled: Boolean(selectedPlayerId),
    staleTime: 1000 * 30,
  });

  const selectedPlayerName = useMemo(() => {
    const selected = playersQuery.data?.find((row) => row.id === selectedPlayerId);
    return selected?.name || profileQuery.data?.Name || "Jogador";
  }, [playersQuery.data, selectedPlayerId, profileQuery.data]);

  const killsFame = sumFame(killsQuery.data);
  const deathsFame = sumFame(deathsQuery.data);

  return (
    <div className="bg-background min-h-screen">
      <SEO title="Tracker" />
      <div className="app-container py-8 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold">Player Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Busque players e acompanhe perfil, kills e deaths via API publica do Albion.
          </p>
        </div>

        <Card className="bg-card/60 border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary/70" />
              Buscar Jogador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome do player (min 2 caracteres)"
              className="bg-background/50 border-border/40"
            />
            {playersQuery.isFetching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Carregando resultados...
              </div>
            )}
            {playersQuery.data && playersQuery.data.length > 0 && (
              <div className="grid gap-2 md:grid-cols-2">
                {playersQuery.data.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selectedPlayerId === player.id
                        ? "border-primary/40 bg-primary/8"
                        : "border-border/40 bg-background/50 hover:bg-background/70"
                    }`}
                  >
                    <p className="text-sm font-semibold truncate">{player.name}</p>
                    <p className="text-[11px] text-muted-foreground/70 truncate">
                      {player.guild_name || "Sem guild"} {player.alliance_name ? `| ${player.alliance_name}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPlayerId && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="bg-card/60 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profileQuery.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary/70" />
                ) : (
                  <>
                    <p><span className="font-medium text-muted-foreground">Nome:</span> {selectedPlayerName}</p>
                    <p><span className="font-medium text-muted-foreground">Guild:</span> {profileQuery.data?.GuildName || "Sem guild"}</p>
                    <p><span className="font-medium text-muted-foreground">Alliance:</span> {profileQuery.data?.AllianceName || "Sem alliance"}</p>
                    <p><span className="font-medium text-muted-foreground">KillFame:</span> {Number(profileQuery.data?.KillFame || 0).toLocaleString("pt-BR")}</p>
                    <p><span className="font-medium text-muted-foreground">DeathFame:</span> {Number(profileQuery.data?.DeathFame || 0).toLocaleString("pt-BR")}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Kills (20)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="font-mono text-xs">
                  Fame total: {killsFame.toLocaleString("pt-BR")}
                </Badge>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(killsQuery.data || []).map((event) => (
                    <div key={event.event_id} className="rounded-lg border border-border/25 bg-background/50 p-2">
                      <p className="text-xs font-semibold">{event.victim.name}</p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {event.total_fame.toLocaleString("pt-BR")} fame
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Deaths (20)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="font-mono text-xs">
                  Fame total: {deathsFame.toLocaleString("pt-BR")}
                </Badge>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(deathsQuery.data || []).map((event) => (
                    <div key={event.event_id} className="rounded-lg border border-border/25 bg-background/50 p-2">
                      <p className="text-xs font-semibold flex items-center gap-1">
                        <Sword className="w-3 h-3 text-destructive/60" />
                        {event.killer.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {event.total_fame.toLocaleString("pt-BR")} fame
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

