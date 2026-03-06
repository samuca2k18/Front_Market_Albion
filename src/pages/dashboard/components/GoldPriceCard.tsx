// src/pages/dashboard/components/GoldPriceCard.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchGoldPrices } from "@/api/albion";
import { TrendingUp, TrendingDown, Coins, RefreshCw } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GoldPriceCardProps {
    region?: string;
}

export function GoldPriceCard({ region = "europe" }: GoldPriceCardProps) {
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["gold-price", region],
        queryFn: () => fetchGoldPrices(region),
        refetchInterval: 1000 * 60 * 5, // 5 minutos
    });

    if (isLoading) {
        return (
            <Card className="bg-card/40 border-border/60 animate-pulse">
                <CardHeader className="h-20" />
                <CardContent className="h-32" />
            </Card>
        );
    }

    if (isError || !data?.current) {
        return null;
    }

    const { current, variation, all } = data;
    const isUp = variation > 0;
    const isDown = variation < 0;

    const chartData = [...all].reverse();
    const prices = chartData.map(p => p.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    const firstDate = new Date(chartData[0]?.timestamp).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });
    const lastDate = new Date(chartData[chartData.length - 1]?.timestamp).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' });

    return (
        <Card className="bg-card/40 border-border/60 shadow-xl overflow-hidden backdrop-blur-sm group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <Coins className="w-5 h-5 shadow-inner" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Ouro
                            </CardTitle>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black tracking-tighter">
                                    {current.price.toLocaleString("pt-BR")}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Silver</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full hover:bg-background/80 ${isFetching ? "animate-spin" : ""}`}
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-background/40 border border-border/30 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Máx</span>
                        <span className="text-xs font-bold text-foreground">{maxPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="bg-background/40 border border-border/30 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Mín</span>
                        <span className="text-xs font-bold text-foreground">{minPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="bg-background/40 border border-border/30 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Período</span>
                        <span className="text-[10px] font-bold text-foreground">{firstDate}-{lastDate}</span>
                    </div>
                </div>

                {/* Sparkline chart */}
                <div className="h-20 w-full mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffb800" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#ffb800" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="timestamp" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const date = new Date(payload[0].payload.timestamp);
                                        return (
                                            <div className="bg-popover/90 border border-border/60 p-2 rounded-lg backdrop-blur-md shadow-2xl">
                                                <div className="text-[10px] font-bold text-muted-foreground mb-1">
                                                    {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-sm font-black text-amber-400">
                                                    {Number(payload[0].value).toLocaleString("pt-BR")} <span className="text-[10px]">silver</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#ffb800"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#goldGradient)"
                                animationDuration={1000}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center px-1">
                    <Badge variant="outline" className={`bg-transparent border-none p-0 flex items-center gap-1.5 ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-muted-foreground"}`}>
                        {isUp ? <TrendingUp size={12} strokeWidth={3} /> : isDown ? <TrendingDown size={12} strokeWidth={3} /> : null}
                        <span className="text-xs font-black">
                            {variation !== 0 ? `${variation > 0 ? "+" : ""}${variation.toLocaleString("pt-BR")}` : "0"}
                        </span>
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                        {new Date(current.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
