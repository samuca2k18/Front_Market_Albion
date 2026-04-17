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
        <Card className="bg-card/60 border-border/40 overflow-hidden backdrop-blur-sm group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-400">
                            <Coins className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Ouro
                            </CardTitle>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold">
                                    {current.price.toLocaleString("pt-BR")}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground">silver</span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-lg hover:bg-muted ${isFetching ? "animate-spin" : ""}`}
                        onClick={() => refetch()}
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-background/50 border border-border/25 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] font-medium text-muted-foreground/70 mb-0.5">Max</span>
                        <span className="text-xs font-semibold text-foreground">{maxPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="bg-background/50 border border-border/25 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] font-medium text-muted-foreground/70 mb-0.5">Min</span>
                        <span className="text-xs font-semibold text-foreground">{minPrice.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="bg-background/50 border border-border/25 rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] font-medium text-muted-foreground/70 mb-0.5">Periodo</span>
                        <span className="text-[10px] font-semibold text-foreground">{firstDate}-{lastDate}</span>
                    </div>
                </div>

                {/* Sparkline chart */}
                <div className="h-16 w-full mb-3 opacity-90 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height={64} minWidth={0}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4a843" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="timestamp" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const date = new Date(payload[0].payload.timestamp);
                                        return (
                                            <div className="bg-popover border border-border/50 p-2 rounded-lg backdrop-blur-md shadow-lg">
                                                <div className="text-[10px] font-medium text-muted-foreground mb-1">
                                                    {date.toLocaleDateString("pt-BR")} {date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-sm font-semibold text-amber-300">
                                                    {Number(payload[0].value).toLocaleString("pt-BR")} <span className="text-[10px] text-muted-foreground">silver</span>
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
                                stroke="#d4a843"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#goldGradient)"
                                animationDuration={800}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center">
                    <Badge variant="outline" className={`bg-transparent border-none p-0 flex items-center gap-1 ${isUp ? "text-emerald-400/90" : isDown ? "text-red-400/90" : "text-muted-foreground"}`}>
                        {isUp ? <TrendingUp size={11} strokeWidth={2.5} /> : isDown ? <TrendingDown size={11} strokeWidth={2.5} /> : null}
                        <span className="text-xs font-semibold">
                            {variation !== 0 ? `${variation > 0 ? "+" : ""}${variation.toLocaleString("pt-BR")}` : "0"}
                        </span>
                    </Badge>
                    <span className="text-[10px] font-medium text-muted-foreground/60">
                        {new Date(current.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
