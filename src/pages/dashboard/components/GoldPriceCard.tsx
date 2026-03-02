import { useQuery } from "@tanstack/react-query";
import { fetchGoldPrices } from "@/api/albion";
import { TrendingUp, TrendingDown, Coins, RefreshCw } from "lucide-react";
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

    const { current, variation } = data;
    const isUp = variation > 0;
    const isDown = variation < 0;

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

                <div className="gold-card-footer">
                    <div className={`gold-variation ${isUp ? "up" : isDown ? "down" : "neutral"}`}>
                        {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : null}
                        <span>
                            {variation !== 0 ? Math.abs(variation).toLocaleString("pt-BR") : "Sem alteração"}
                        </span>
                    </div>
                    <span className="gold-updated">
                        Último: {new Date(current.timestamp).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
}
