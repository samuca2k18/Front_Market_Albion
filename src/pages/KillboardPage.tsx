// src/pages/KillboardPage.tsx
import { useQuery } from "@tanstack/react-query";
import { Sword, Skull, AlertCircle, Clock, Shield, Users, Loader2 } from "lucide-react";
import { fetchKillboard } from "@/api/albion";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

    return (
        <div className="bg-background min-h-screen">
            <div className="app-container py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Skull className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
                                Killboard
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-medium flex items-center gap-2 pl-1">
                            <Clock className="w-4 h-4 opacity-50" />
                            Últimas mortes em tempo real — atualiza a cada 30s
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-2 rounded-2xl shadow-xl">
                        <div className="px-4 text-center border-r border-border/40">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Kills</div>
                            <div className="text-xl font-black tracking-tighter text-foreground">{data?.length || 0}</div>
                        </div>
                        <div className="px-4 text-center">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</div>
                            <div className="flex items-center justify-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-tight text-emerald-400">Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Carregando kills...</p>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 text-center">
                        <AlertCircle className="w-16 h-16 text-destructive/40 mb-4" />
                        <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Erro ao buscar dados</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">Houve um problema ao conectar com o servidor da Albion. Tente novamente em alguns instantes.</p>
                        <Button variant="destructive" onClick={() => refetch()} className="font-bold uppercase tracking-widest shadow-lg shadow-destructive/20">
                            Tentar Novamente
                        </Button>
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl border-2 border-dashed border-border/40 bg-card/20 text-center">
                        <Sword className="w-16 h-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-black tracking-tight uppercase">Nenhum kill encontrado</h3>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {data.map((ev) => (
                            <Card key={ev.event_id} className="group overflow-hidden bg-card/40 border-border/60 hover:border-primary/40 hover:bg-card/60 transition-all duration-300 shadow-xl backdrop-blur-sm">
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

                                        {/* VS Info */}
                                        <div className="flex flex-row lg:flex-col items-center justify-center gap-4 p-4 lg:px-8 border-b lg:border-b-0 border-border/20 bg-background/20 lg:bg-transparent min-w-[140px]">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-background border border-border/60 shadow-inner">
                                                <Sword className="w-5 h-5 text-primary opacity-60" />
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-lg font-black tracking-tighter text-amber-400">
                                                    {ev.total_fame.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Fame</div>
                                            </div>
                                            <Badge variant="ghost" className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest pl-0">
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
