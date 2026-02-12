import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { listNotifications, markNotificationRead } from "@/api/alerts";
import type { UserNotification } from "@/api/types";
import { useAuth } from "@/hooks/useAuth";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR");
  } catch {
    return dateStr;
  }
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // não mostra nada se não estiver logado
  if (!user) return null;

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await listNotifications();
        if (!cancelled) {
          setNotifications(data);
        }
      } catch {
        // silencioso por enquanto
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    // pequeno polling para manter atualizado
    const interval = window.setInterval(fetchData, 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkOne = async (notif: UserNotification) => {
    if (notif.is_read) return;
    try {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, is_read: true } : n,
        ),
      );
    } catch {
      // silencioso
    }
  };

  const handleMarkAll = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silencioso
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 hover:bg-card/90 transition-colors"
        title="Notificações de preço"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs rounded-2xl border border-border/70 bg-background/95 shadow-xl backdrop-blur-md z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[11px] text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-4 text-xs text-muted-foreground">
                Nenhuma notificação ainda.
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {notifications.slice(0, 10).map((notif) => (
                  <li
                    key={notif.id}
                    className={`px-3 py-3 text-xs ${
                      notif.is_read ? "bg-background/60" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-foreground">
                          {notif.body}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(notif)}
                          className="text-[10px] text-primary hover:underline flex-shrink-0"
                        >
                          Lido
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDate(notif.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

