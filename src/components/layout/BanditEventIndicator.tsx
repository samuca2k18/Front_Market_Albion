import { useQuery } from "@tanstack/react-query";
import { fetchBanditEvent } from "@/api/albion";
import "./BanditEventIndicator.css";

export function BanditEventIndicator() {
    const { data } = useQuery({
        queryKey: ["bandit-event"],
        queryFn: fetchBanditEvent,
        refetchInterval: 1000 * 30, // 30s
        staleTime: 1000 * 15,
    });

    if (!data) return null;

    const { status, minutes_remaining } = data;

    const label =
        status === "active"
            ? `🔴 Bandit Ativo! (${minutes_remaining}min)`
            : status === "soon"
                ? `⚡ Bandit em ${minutes_remaining}min`
                : `Bandit: ${minutes_remaining}min`;

    return (
        <div className={`bandit-indicator ${status}`} title="Status do Bandit Event">
            <span className="bandit-dot" />
            <span>{label}</span>
        </div>
    );
}
