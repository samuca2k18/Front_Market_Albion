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
import "./GoldPriceCard.css";

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
            <div className="gold-card-skeleton">
                <div className="skeleton-icon" />
                <div className="skeleton-content">
                    <div className="skeleton-line short" />
                    <div className="skeleton-line" />
                </div>
            </div>
        );
    }

    if (isError || !data?.current) {
        return null;
    }

    const { current, variation, all } = data;
    const isUp = variation > 0;
    const isDown = variation < 0;

    // Inverter o array para o gráfico (API retorna do mais recente pro mais antigo)
    const chartData = [...all].reverse();

    return (
        <div className="gold-price-card">
            <div className="gold-card-glow" />
            <div className="gold-card-inner">
                <div className="gold-card-header">
                    <div className="gold-icon-wrapper">
                        <Coins className="gold-icon" size={20} />
                    </div>
                    <div className="gold-info">
                        <span className="gold-label">Ouro</span>
                        <div className="gold-value-wrapper">
                            <span className="gold-price">
                                {current.price.toLocaleString("pt-BR")}
                            </span>
                            <span className="gold-currency">Silver</span>
                        </div>
                    </div>
                    <button
                        className={`gold-refresh-btn ${isFetching ? "spinning" : ""}`}
                        onClick={() => refetch()}
                        title="Atualizar preço"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>

                {/* Gráfico Sparkline */}
                <div className="gold-sparkline-wrapper">
                    <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ffb800" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="timestamp" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <RechartsTooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="gold-tooltip">
                                                <span>{Number(payload[0].value).toLocaleString("pt-BR")} silver</span>
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
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#goldGradient)"
                                animationDuration={1500}
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="gold-card-footer">
                    <div className={`gold-variation ${isUp ? "up" : isDown ? "down" : "neutral"}`}>
                        {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : null}
                        <span>
                            {variation !== 0 ? `${variation > 0 ? "+" : ""}${variation.toLocaleString("pt-BR")}` : "Sem alteração"}
                        </span>
                    </div>
                    <span className="gold-updated">
                        {new Date(current.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
