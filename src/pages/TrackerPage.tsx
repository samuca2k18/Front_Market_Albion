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
      <div className="app-container py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Player Tracker</h1>
          <p className="text-muted-foreground">
            Busque players e acompanhe perfil, kills e deaths via API pública do Albion.
          </p>
        </div>

        <Card className="bg-card/40 border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Buscar Jogador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome do player (min 2 caracteres)"
              className="bg-background/40 border-border/40"
            />
            {playersQuery.isFetching && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando resultados...
              </div>
            )}
            {playersQuery.data && playersQuery.data.length > 0 && (
              <div className="grid gap-2 md:grid-cols-2">
                {playersQuery.data.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      selectedPlayerId === player.id
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/40 bg-background/40 hover:bg-background/70"
                    }`}
                  >
                    <p className="text-sm font-black truncate">{player.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {player.guild_name || "Sem guild"} {player.alliance_name ? `| ${player.alliance_name}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedPlayerId && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="bg-card/40 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profileQuery.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <>
                    <p><strong>Nome:</strong> {selectedPlayerName}</p>
                    <p><strong>Guild:</strong> {profileQuery.data?.GuildName || "Sem guild"}</p>
                    <p><strong>Alliance:</strong> {profileQuery.data?.AllianceName || "Sem alliance"}</p>
                    <p><strong>KillFame:</strong> {Number(profileQuery.data?.KillFame || 0).toLocaleString("pt-BR")}</p>
                    <p><strong>DeathFame:</strong> {Number(profileQuery.data?.DeathFame || 0).toLocaleString("pt-BR")}</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Kills (20)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="font-mono">
                  Fame total: {killsFame.toLocaleString("pt-BR")}
                </Badge>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(killsQuery.data || []).map((event) => (
                    <div key={event.event_id} className="rounded-lg border border-border/30 bg-background/40 p-2">
                      <p className="text-xs font-bold">{event.victim.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {event.total_fame.toLocaleString("pt-BR")} fame
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Deaths (20)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="outline" className="font-mono">
                  Fame total: {deathsFame.toLocaleString("pt-BR")}
                </Badge>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(deathsQuery.data || []).map((event) => (
                    <div key={event.event_id} className="rounded-lg border border-border/30 bg-background/40 p-2">
                      <p className="text-xs font-bold flex items-center gap-1">
                        <Sword className="w-3 h-3 text-destructive/70" />
                        {event.killer.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
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

