// src/pages/dashboard/components/PriceAlertsSection.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pin, PinOff, Bell, BellOff, Loader2, AlertCircle } from "lucide-react";

import { listPriceAlerts, createPriceAlert } from "@/api/alerts";
import type { PriceAlert } from "@/api/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface DashboardAddAlertEventDetail {
  itemName: string;
  displayName?: string;
  city?: string | null;
  quality?: number | null;
  cooldownMinutes?: number;
  ruleType?: "target" | "manual_percent" | "ai_percent";
  targetPrice?: number;
  expectedPrice?: number;
  percentBelow?: number;
  useAiExpected?: boolean;
}

export function PriceAlertsSection() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<number>>(() => loadPinned());
  const [isCreating, setIsCreating] = useState(false);
  const { t } = useTranslation();

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
      const detail = (event as CustomEvent<DashboardAddAlertEventDetail>).detail;
      if (!detail?.itemName) return;

      void (async () => {
        try {
          setIsCreating(true);
          const basePayload = {
            item_id: detail.itemName,
            display_name: detail.displayName,
            city: detail.city ?? null,
            quality: detail.quality ?? null,
            cooldown_minutes: detail.cooldownMinutes ?? 60,
          };

          const ruleType = detail.ruleType ?? "target";
          const created = await createPriceAlert(
            ruleType === "manual_percent"
              ? {
                  ...basePayload,
                  expected_price: detail.expectedPrice ?? null,
                  percent_below: detail.percentBelow ?? 20,
                  use_ai_expected: false,
                }
              : ruleType === "ai_percent"
                ? {
                    ...basePayload,
                    target_price: null,
                    expected_price: null,
                    percent_below: detail.percentBelow ?? 20,
                    use_ai_expected: true,
                  }
                : {
                    ...basePayload,
                    target_price: detail.targetPrice ?? null,
                    use_ai_expected: false,
                  },
          );

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
      if (aPinned !== bPinned) return bPinned - aPinned;

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
    <Card className="bg-card/40 border-border/60 shadow-xl backdrop-blur-sm flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {t("dashboard.alertsTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {isCreating
                ? (t("dashboard.alertsCreating") as string)
                : (t("dashboard.alertsDescription") as string)}
            </CardDescription>
          </div>
          <Bell className={`w-5 h-5 transition-all ${isCreating ? "text-primary animate-pulse" : "text-primary opacity-50"}`} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {isLoading && alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-50">
            <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{t("dashboard.alertsLoading")}</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive mt-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl border border-dashed border-border/40 bg-background/20 text-center">
            <BellOff className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {t("dashboard.alertsEmptyLine1")}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest leading-relaxed">
              {t("dashboard.alertsEmptyLine2")}
            </p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
            {orderedAlerts.map((alert) => {
              const label = alert.display_name || alert.item_id;
              const city = alert.city || (t("dashboard.alertsAnyCity") as string);
              const rule = formatRule(alert);
              const last = formatLastTriggered(alert);
              const isPinned = pinned.has(alert.id);

              return (
                <div
                  key={alert.id}
                  className={`group flex items-start justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${isPinned
                    ? "border-primary/40 bg-primary/5 shadow-inner"
                    : "border-border/40 bg-background/40 hover:bg-background/80"
                    }`}
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tracking-tight truncate max-w-[180px]">
                        {label}
                      </span>
                      <Badge variant="outline" className="text-[9px] h-4 font-bold uppercase tracking-tighter bg-background/50 border-border/60">
                        {city}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium text-primary/80">
                        {rule}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                        {t("dashboard.alertsLastFire", { value: last })}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePinned(alert.id)}
                    className={`h-8 w-8 rounded-full transition-all ${isPinned
                      ? "text-primary bg-primary/10 hover:bg-primary/20"
                      : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                      }`}
                    title={isPinned ? (t("dashboard.alertsUnpinTooltip") as string) : (t("dashboard.alertsPinTooltip") as string)}
                  >
                    {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
