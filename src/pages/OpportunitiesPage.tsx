import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchArbitrageOpportunities } from "@/api/albion";
import { useRegion } from "@/context/RegionContext";
import {
    TrendingUp,
    ArrowRight,
    MapPin,
    Clock,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { getItemDisplayNameWithEnchantment } from "@/utils/itemNameMapper";
import "./OpportunitiesPage.css";

export function OpportunitiesPage() {
    const { t, i18n } = useTranslation();
    const { region } = useRegion();
    const [tax, setTax] = useState(0.08); // 8% por padrão
    const [minProfit, setMinProfit] = useState(0);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["arbitrage-opportunities", region, tax],
        queryFn: () => fetchArbitrageOpportunities(region, tax),
        refetchInterval: 1000 * 60 * 5, // 5 min
    });

    const locale = i18n.language.startsWith("pt") ? "pt-BR" : "en-US";

    const filteredData = data?.filter(opt => opt.profit >= minProfit) || [];

    const getTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    return (
        <div className="opportunities-page">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <TrendingUp className="title-icon" />
                        {t("opportunities.title", "Oportunidades de Arbitragem")}
                    </h1>
                    <p className="page-subtitle">
                        {t("opportunities.subtitle", "As melhores rotas de comércio entre cidades para lucrar prata.")}
                    </p>
                </div>

                <div className="header-actions">
                    <div className="tax-selector">
                        <span className="action-label">Imposto:</span>
                        <button
                            className={`tax-btn ${tax === 0.08 ? 'active' : ''}`}
                            onClick={() => setTax(0.08)}
                        >
                            8% (Normal)
                        </button>
                        <button
                            className={`tax-btn ${tax === 0.04 ? 'active' : ''}`}
                            onClick={() => setTax(0.04)}
                        >
                            4% (Premium)
                        </button>
                    </div>
                </div>
            </div>

            <div className="opportunities-container">
                {/* Filtros */}
                <aside className="filters-sidebar">
                    <div className="filter-group">
                        <label className="filter-label">
                            <Filter size={14} />
                            Lucro Mínimo (Silver)
                        </label>
                        <input
                            type="number"
                            className="filter-input"
                            value={minProfit}
                            onChange={(e) => setMinProfit(Number(e.target.value))}
                            placeholder="Ex: 50000"
                        />
                    </div>

                    <div className="filter-info">
                        <div className="info-icon">
                            <AlertCircle size={16} />
                        </div>
                        <p>
                            Os preços são baseados em dados de usuários. Verifique no jogo antes de realizar grandes transportes.
                        </p>
                    </div>
                </aside>

                {/* Lista/Tabela */}
                <main className="opportunities-main">
                    {isLoading ? (
                        <div className="loading-state">
                            <div className="spinner" />
                            <p>Calculando melhores rotas...</p>
                        </div>
                    ) : isError ? (
                        <div className="error-state">
                            <AlertCircle size={48} />
                            <h3>Erro ao buscar oportunidades</h3>
                            <p>Não foi possível conectar ao servidor de dados.</p>
                            <button onClick={() => refetch()} className="retry-btn">Tentar Novamente</button>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="empty-state">
                            <Search size={48} />
                            <h3>Nenhuma oportunidade encontrada</h3>
                            <p>Tente diminuir o lucro mínimo ou adicione mais itens ao seu rastreador.</p>
                        </div>
                    ) : (
                        <div className="opportunities-grid">
                            {filteredData.map((opt, idx) => (
                                <div key={`${opt.item_id}-${idx}`} className="opportunity-card glass-panel">
                                    <div className="opt-header">
                                        <div className="item-info">
                                            <span className="item-name">
                                                {getItemDisplayNameWithEnchantment(opt.item_id)}
                                            </span>
                                            <span className="item-id">{opt.item_id}</span>
                                        </div>
                                        <div className="roi-badge">
                                            ROI {opt.roi}%
                                        </div>
                                    </div>

                                    <div className="opt-route">
                                        <div className="route-step buy">
                                            <div className="step-label">COMPRAR</div>
                                            <div className="city-info">
                                                <MapPin size={12} />
                                                {opt.buy_from}
                                            </div>
                                            <div className="price-info">
                                                {opt.buy_price.toLocaleString(locale)} <span className="silver">silver</span>
                                            </div>
                                            <div className="time-info">
                                                <Clock size={10} /> {getTimeAgo(opt.buy_date)} atrás
                                            </div>
                                        </div>

                                        <div className="route-arrow">
                                            <ArrowRight size={24} />
                                        </div>

                                        <div className="route-step sell">
                                            <div className="step-label">VENDER</div>
                                            <div className="city-info">
                                                <MapPin size={12} />
                                                {opt.sell_at}
                                            </div>
                                            <div className="price-info">
                                                {opt.sell_price.toLocaleString(locale)} <span className="silver">silver</span>
                                            </div>
                                            <div className="time-info">
                                                <Clock size={10} /> {getTimeAgo(opt.sell_date)} atrás
                                            </div>
                                        </div>
                                    </div>

                                    <div className="opt-footer">
                                        <div className="profit-total">
                                            <span className="label">Lucro Estimado</span>
                                            <span className="value">+{opt.profit.toLocaleString(locale)} silver</span>
                                        </div>
                                        <div className="check-status">
                                            <CheckCircle2 size={14} className="icon" />
                                            Líquido
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
