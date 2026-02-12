import { useEffect, useMemo, useState } from "react";

import { listPriceAlerts, createPriceAlert } from "@/api/alerts";
import type { PriceAlert } from "@/api/types";
import { Card } from "@/components/common/Card";

const STORAGE_KEY = "albion_market_pinned_alerts";

function loadPinned(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as number[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function savePinned(set: Set<number>) {
  const arr = Array.from(set);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function formatRule(alert: PriceAlert): string {
  if (alert.target_price != null) {
    return `Alvo fixo: ≤ ${alert.target_price.toLocaleString("pt-BR")} silver`;
  }

  if (alert.expected_price != null && alert.percent_below != null) {
    return `Abaixo de ${alert.percent_below.toFixed(0)}% de ${alert.expected_price.toLocaleString(
      "pt-BR",
    )}`;
  }

  if (alert.use_ai_expected && alert.percent_below != null) {
    return `IA/histórico: ${alert.percent_below.toFixed(0)}% abaixo do esperado`;
  }

  return "Regra personalizada";
}

function formatLastTriggered(alert: PriceAlert): string {
  if (!alert.last_triggered_at) return "Ainda não disparou";
  try {
    return new Date(alert.last_triggered_at).toLocaleString("pt-BR");
  } catch {
    return alert.last_triggered_at;
  }
}

export function PriceAlertsSection() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<number>>(() => loadPinned());
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlerts() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listPriceAlerts();
        if (!cancelled) {
          setAlerts(data);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Erro ao carregar alertas.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    function handleAddAlert(event: Event) {
      const detail = (event as CustomEvent<{
        itemName: string;
        displayName?: string;
        targetPrice: number;
      }>).detail;
      if (!detail) return;

      void (async () => {
        try {
          setIsCreating(true);
          const created = await createPriceAlert({
            item_id: detail.itemName,
            display_name: detail.displayName,
            target_price: detail.targetPrice,
          });
          if (!cancelled) {
            setAlerts((prev) => [created, ...prev]);
          }
        } catch (e: any) {
          if (!cancelled) {
            setError(
              e?.message ||
                "Não foi possível criar o alerta de preço. Tente novamente.",
            );
          }
        } finally {
          if (!cancelled) {
            setIsCreating(false);
          }
        }
      })();
    }

    window.addEventListener("dashboard:add-alert", handleAddAlert as EventListener);

    void fetchAlerts();
    const interval = window.setInterval(fetchAlerts, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener(
        "dashboard:add-alert",
        handleAddAlert as EventListener,
      );
    };
  }, []);

  const orderedAlerts = useMemo(() => {
    if (alerts.length === 0) return [];
    return [...alerts].sort((a, b) => {
      const aPinned = pinned.has(a.id) ? 1 : 0;
      const bPinned = pinned.has(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned; // pinned primeiro

      const aTime = a.last_triggered_at ? Date.parse(a.last_triggered_at) : 0;
      const bTime = b.last_triggered_at ? Date.parse(b.last_triggered_at) : 0;
      return bTime - aTime;
    });
  }, [alerts, pinned]);

  const handleTogglePinned = (id: number) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      savePinned(next);
      return next;
    });
  };

  return (
    <Card
      title="Alertas de preço"
      description={
        isCreating
          ? "Criando alerta..."
          : "Itens monitorados e regras de disparo configuradas."
      }
    >
      {isLoading && alerts.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Carregando seus alertas...
        </p>
      ) : error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : alerts.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground text-center">
          Você ainda não configurou nenhum alerta de preço.
          <br />
          Use o backend para criar alertas para itens específicos e eles aparecerão aqui.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {orderedAlerts.map((alert) => {
            const label = alert.display_name || alert.item_id;
            const city = alert.city || "Qualquer cidade";
            const rule = formatRule(alert);
            const last = formatLastTriggered(alert);
            const isPinned = pinned.has(alert.id);

            return (
              <li
                key={alert.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-2 text-sm"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate max-w-[220px]">
                      {label}
                    </span>
                    <span className="text-[11px] rounded-full border border-border/70 px-2 py-0.5 text-muted-foreground">
                      {city}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {rule}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Último disparo: {last}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTogglePinned(alert.id)}
                  className={`text-[11px] rounded-full border px-3 py-1 mt-0.5 transition-colors flex-shrink-0 ${
                    isPinned
                      ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-200"
                      : "border-border/60 bg-background/40 text-muted-foreground hover:bg-background/80"
                  }`}
                  title={
                    isPinned
                      ? "Remover prioridade deste alerta"
                      : "Priorizar este alerta"
                  }
                >
                  {isPinned ? "Prioritário" : "Priorizar"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

