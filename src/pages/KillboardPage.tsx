// src/pages/KillboardPage.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sword, Skull, AlertCircle, Clock, Shield, Users, Loader2, Search, Filter, X } from "lucide-react";
import { fetchKillboard } from "@/api/albion";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";

const RENDER_URL = "https://render.albiononline.com/v1/item";

function getTimeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
}

export function KillboardPage() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["killboard"],
        queryFn: () => fetchKillboard(30),
        refetchInterval: 1000 * 30,
    });

    // Filters
    const [searchPlayer, setSearchPlayer] = useState("");
    const [minFame, setMinFame] = useState(0);
    const [weaponFilter, setWeaponFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((ev) => {
            // Fame filter
            if (minFame > 0 && ev.total_fame < minFame) return false;
            // Player search
            if (searchPlayer) {
                const q = searchPlayer.toLowerCase();
                const killerMatch = ev.killer.name.toLowerCase().includes(q) ||
                    ev.killer.guild.toLowerCase().includes(q) ||
                    ev.killer.alliance.toLowerCase().includes(q);
                const victimMatch = ev.victim.name.toLowerCase().includes(q) ||
                    ev.victim.guild.toLowerCase().includes(q) ||
                    ev.victim.alliance.toLowerCase().includes(q);
                if (!killerMatch && !victimMatch) return false;
            }
            // Weapon filter
            if (weaponFilter) {
                const w = weaponFilter.toLowerCase();
                const killerWeapon = (ev.killer.weapon || "").toLowerCase();
                const victimWeapon = (ev.victim.weapon || "").toLowerCase();
                if (!killerWeapon.includes(w) && !victimWeapon.includes(w)) return false;
            }
            return true;
        });
    }, [data, searchPlayer, minFame, weaponFilter]);

    const hasFilters = searchPlayer.length > 0 || minFame > 0 || weaponFilter.length > 0;

    return (
        <div className="bg-background min-h-screen">
            <SEO title="Killboard" />
            <div className="app-container py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/15">
                                <Skull className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Killboard
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 pl-1">
                            <Clock className="w-3.5 h-3.5 opacity-50" />
                            Ultimas mortes em tempo real - atualiza a cada 30s
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Filter toggle */}
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-lg text-xs font-medium h-9 gap-1.5 ${
                                showFilters ? "shadow-sm" : "border-border/40"
                            }`}
                        >
                            <Filter size={12} />
                            Filtros
                            {hasFilters && (
                                <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center">
                                    !
                                </span>
                            )}
                        </Button>

                        <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/40 p-2 rounded-lg">
                            <div className="px-3 text-center border-r border-border/40">
                                <div className="text-[10px] font-medium text-muted-foreground/70">Total</div>
                                <div className="text-lg font-bold text-foreground">{filteredData.length}</div>
                            </div>
                            <div className="px-3 text-center">
                                <div className="text-[10px] font-medium text-muted-foreground/70">Status</div>
                                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-medium text-emerald-400">Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <Card className="bg-card/60 border-border/40 backdrop-blur-sm rounded-lg mb-6 animate-fade-up">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[180px]">
                                    <label className="text-[11px] font-medium text-muted-foreground/70 mb-1 block">
                                        Buscar jogador / Guild
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                        <Input
                                            value={searchPlayer}
                                            onChange={(e) => setSearchPlayer(e.target.value)}
                                            placeholder="Nome, guild ou alianca..."
                                            className="h-9 pl-9 bg-background/50 border-border/40"
                                        />
                                    </div>
                                </div>
                                <div className="w-[160px]">
                                    <label className="text-[11px] font-medium text-muted-foreground/70 mb-1 block">
                                        Fame minima
                                    </label>
                                    <Input
                                        type="number"
                                        value={minFame || ""}
                                        onChange={(e) => setMinFame(Number(e.target.value) || 0)}
                                        placeholder="Ex: 100000"
                                        className="h-9 bg-background/50 border-border/40 font-medium"
                                    />
                                </div>
                                <div className="w-[160px]">
                                    <label className="text-[11px] font-medium text-muted-foreground/70 mb-1 block">
                                        Arma usada
                                    </label>
                                    <Input
                                        value={weaponFilter}
                                        onChange={(e) => setWeaponFilter(e.target.value)}
                                        placeholder="Ex: T8_MAIN_AXE"
                                        className="h-9 bg-background/50 border-border/40 font-medium"
                                    />
                                </div>
                                {hasFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => { setSearchPlayer(""); setMinFame(0); setWeaponFilter(""); }}
                                        className="h-9 text-xs font-medium text-muted-foreground hover:text-destructive gap-1"
                                    >
                                        <X size={12} />
                                        Limpar
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 animate-spin text-primary/70 mb-3" />
                        <p className="text-sm font-medium text-muted-foreground">Carregando kills...</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Erro ao buscar dados</h3>
                        <p className="text-sm text-muted-foreground mb-5 max-w-sm">Houve um problema ao conectar com o servidor da Albion.</p>
                        <Button variant="destructive" onClick={() => refetch()} className="font-medium">
                            Tentar Novamente
                        </Button>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 rounded-lg border border-dashed border-border/40 bg-card/30 text-center">
                        <Sword className="w-12 h-12 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-semibold">
                            {hasFilters ? "Nenhum kill para esses filtros" : "Nenhum kill encontrado"}
                        </h3>
                        {hasFilters && (
                            <Button
                                variant="ghost"
                                className="mt-3 text-muted-foreground"
                                onClick={() => { setSearchPlayer(""); setMinFame(0); setWeaponFilter(""); }}
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {filteredData.map((ev, idx) => (
                            <Card
                                key={ev.event_id}
                                className="group overflow-hidden bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 shadow-xl backdrop-blur-sm animate-fade-up"
                                style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row items-center">
                                        {/* Killer */}
                                        <div className="flex-1 w-full p-6 bg-gradient-to-r from-primary/10 to-transparent border-b lg:border-b-0 lg:border-r border-border/20">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="h-14 w-14 bg-black/40 rounded-2xl border border-primary/20 p-2 group-hover:scale-105 transition-transform">
                                                        {ev.killer.weapon ? (
                                                            <img
                                                                src={`${RENDER_URL}/${ev.killer.weapon}.png?size=48`}
                                                                alt={ev.killer.weapon}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                            />
                                                        ) : <Users className="w-full h-full opacity-20" />}
                                                    </div>
                                                    <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white border-0 text-[10px] font-black px-1.5 h-4 shadow-lg uppercase">Killer</Badge>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xl font-black tracking-tighter truncate leading-none mb-1 text-primary">
                                                        {ev.killer.name}
                                                    </span>
                                                    {ev.killer.guild && (
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                                            {ev.killer.alliance && `[${ev.killer.alliance}] `}{ev.killer.guild}
                                                        </span>
                                                    )}
                                                    <Badge variant="outline" className="mt-2 w-fit text-[9px] font-bold uppercase tracking-widest bg-background/50 border-border/40">
                                                        IP: {ev.killer.ip}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* VS Info — Enhanced */}
                                        <div className="flex flex-row lg:flex-col items-center justify-center gap-4 p-4 lg:px-8 border-b lg:border-b-0 border-border/20 bg-background/20 lg:bg-transparent min-w-[160px]">
                                            <div className="relative flex items-center justify-center h-12 w-12 rounded-full bg-background border-2 border-border/60 shadow-inner group-hover:border-primary/40 transition-all">
                                                <Sword className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                                {/* Participants badge */}
                                                {ev.participants > 1 && (
                                                    <Badge className="absolute -bottom-1 -right-1 bg-amber-500 text-white border-0 text-[8px] font-black h-4 w-4 p-0 flex items-center justify-center rounded-full shadow-lg">
                                                        {ev.participants}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-lg font-black tracking-tighter text-amber-400">
                                                    {ev.total_fame.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fame</div>
                                            </div>
                                            {/* Death Fame */}
                                            {ev.victim.death_fame && ev.victim.death_fame > 0 && (
                                                <div className="flex flex-col items-center">
                                                    <div className="text-xs font-black tracking-tighter text-red-400/80">
                                                        -{ev.victim.death_fame.toLocaleString()}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-red-400/40 uppercase tracking-widest">Death</div>
                                                </div>
                                            )}
                                            <Badge variant="outline" className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest pl-0 border-0">
                                                {getTimeAgo(ev.timestamp)}
                                            </Badge>
                                        </div>

                                        {/* Victim */}
                                        <div className="flex-1 w-full p-6 text-right">
                                            <div className="flex items-center justify-end gap-4 text-right">
                                                <div className="flex flex-col min-w-0 items-end">
                                                    <span className="text-xl font-black tracking-tighter truncate leading-none mb-1 text-destructive/80">
                                                        {ev.victim.name}
                                                    </span>
                                                    {ev.victim.guild && (
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                                            {ev.victim.alliance && `[${ev.victim.alliance}] `}{ev.victim.guild}
                                                        </span>
                                                    )}
                                                    <Badge variant="outline" className="mt-2 w-fit text-[9px] font-bold uppercase tracking-widest bg-background/50 border-border/40">
                                                        IP: {ev.victim.ip}
                                                    </Badge>
                                                </div>
                                                <div className="relative">
                                                    <div className="h-14 w-14 bg-black/40 rounded-2xl border border-destructive/20 p-2 group-hover:scale-105 transition-transform">
                                                        {ev.victim.weapon ? (
                                                            <img
                                                                src={`${RENDER_URL}/${ev.victim.weapon}.png?size=48`}
                                                                alt={ev.victim.weapon}
                                                                className="w-full h-full object-contain"
                                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                            />
                                                        ) : <Shield className="w-full h-full opacity-20" />}
                                                    </div>
                                                    <Badge className="absolute -top-2 -left-2 bg-destructive text-white border-0 text-[10px] font-black px-1.5 h-4 shadow-lg uppercase">Victim</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
