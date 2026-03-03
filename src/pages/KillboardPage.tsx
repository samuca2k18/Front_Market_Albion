import { useQuery } from "@tanstack/react-query";
import { Sword, Skull, AlertCircle } from "lucide-react";
import { fetchKillboard } from "@/api/albion";
import "./KillboardPage.css";

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
        <div className="killboard-page">
            <div className="page-header">
                <h1 className="page-title">
                    <Skull size={28} />
                    Killboard
                </h1>
                <p className="page-subtitle">Últimas mortes em tempo real — atualiza a cada 30s</p>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Carregando kills...</p>
                </div>
            ) : isError ? (
                <div className="error-state">
                    <AlertCircle size={48} />
                    <h3>Erro ao buscar kills</h3>
                    <button onClick={() => refetch()} style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, background: "rgba(59,130,246,0.2)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer" }}>
                        Tentar Novamente
                    </button>
                </div>
            ) : !data || data.length === 0 ? (
                <div className="empty-state">
                    <Sword size={48} />
                    <h3>Nenhum kill encontrado</h3>
                </div>
            ) : (
                <div className="kills-grid">
                    {data.map((ev) => (
                        <div key={ev.event_id} className="kill-card">
                            {/* Killer */}
                            <div className="kill-player killer">
                                <span className="player-name">{ev.killer.name}</span>
                                {ev.killer.guild && (
                                    <span className="player-guild">
                                        [{ev.killer.alliance || ev.killer.guild}] {ev.killer.guild}
                                    </span>
                                )}
                                <span className="player-ip">IP: {ev.killer.ip}</span>
                                {ev.killer.weapon && (
                                    <span className="player-weapon">
                                        <img
                                            src={`${RENDER_URL}/${ev.killer.weapon}.png?size=32`}
                                            alt={ev.killer.weapon}
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    </span>
                                )}
                            </div>

                            {/* VS */}
                            <div className="kill-vs">
                                <div className="vs-icon">
                                    <Sword size={14} />
                                </div>
                                <span className="vs-fame">
                                    {ev.total_fame.toLocaleString()} fame
                                </span>
                                <span className="vs-time">{getTimeAgo(ev.timestamp)}</span>
                            </div>

                            {/* Victim */}
                            <div className="kill-player victim">
                                <span className="player-name">{ev.victim.name}</span>
                                {ev.victim.guild && (
                                    <span className="player-guild">
                                        [{ev.victim.alliance || ev.victim.guild}] {ev.victim.guild}
                                    </span>
                                )}
                                <span className="player-ip">IP: {ev.victim.ip}</span>
                                {ev.victim.weapon && (
                                    <span className="player-weapon">
                                        <img
                                            src={`${RENDER_URL}/${ev.victim.weapon}.png?size=32`}
                                            alt={ev.victim.weapon}
                                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                                        />
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
