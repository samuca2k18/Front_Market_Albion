import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { searchItems } from "@/api/albion";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Command, ArrowRight, Tag, Loader2, X } from "lucide-react";
import type { AlbionSearchItem } from "@/api/types";
import { getItemImageUrl } from "@/utils/items";

const GLOBAL_SEARCH_EVENT = "app:open-global-search";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const debouncedQuery = useDebounce(query, 300);
  const hasQuery = debouncedQuery.trim().length >= 2;

  const searchQuery = useQuery<AlbionSearchItem[]>({
    queryKey: ["global-search-items", debouncedQuery, i18n.language],
    queryFn: () => searchItems(debouncedQuery, i18n.language as "pt-BR" | "en-US"),
    enabled: open && hasQuery,
    staleTime: 1000 * 60,
  });

  const visibleResults = hasQuery ? (searchQuery.data ?? []).slice(0, 8) : [];
  const loading = searchQuery.isFetching;

  const resetSearch = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    resetSearch();
  }, [resetSearch]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            resetSearch();
          }
          return !prev;
        });
      }

      if (e.key === "Escape") {
        closeSearch();
      }
    }

    function openFromTrigger() {
      setOpen(true);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(GLOBAL_SEARCH_EVENT, openFromTrigger);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(GLOBAL_SEARCH_EVENT, openFromTrigger);
    };
  }, [closeSearch, resetSearch]);

  useEffect(() => {
    if (!open) return;

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [open]);

  const handleSelect = useCallback(
    (uniqueName: string) => {
      closeSearch();
      navigate(`/prices?search=${encodeURIComponent(uniqueName)}`);
    },
    [closeSearch, navigate],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!visibleResults.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, visibleResults.length - 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Enter" && visibleResults[selectedIndex]) {
      handleSelect(visibleResults[selectedIndex].unique_name);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={closeSearch}
      />

      <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-[0_28px_80px_rgba(2,6,18,0.75)] backdrop-blur-2xl animate-fade-up">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                <Command className="h-3.5 w-3.5" />
              </div>
              <div className="leading-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
                  Albion Command Search
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  Pressione Ctrl+K para abrir rapido
                </p>
              </div>
            </div>
            <kbd className="rounded-lg border border-border/50 bg-background/65 px-2 py-1 text-[10px] font-semibold text-muted-foreground">
              Ctrl+K
            </kbd>
          </div>

          <div className="flex items-center gap-3 border-b border-border/35 px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar itens, armas, armaduras..."
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/45"
            />
            {loading && (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            )}
            <button
              onClick={closeSearch}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-background/50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:bg-background"
            >
              <X className="h-3 w-3" />
              ESC
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
            {visibleResults.length === 0 && hasQuery && !loading && (
              <div className="py-12 text-center">
                <Tag className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm font-medium text-muted-foreground/60">
                  Nenhum item encontrado
                </p>
              </div>
            )}

            {visibleResults.length === 0 && !hasQuery && (
              <div className="py-12 text-center">
                <Command className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm font-medium text-muted-foreground/60">
                  Digite para buscar itens do Albion Online
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                  Use as setas para navegar - Enter para abrir
                </p>
              </div>
            )}

            {visibleResults.map((item, index) => {
              const displayName =
                i18n.language.startsWith("pt")
                  ? item.name_pt || item.name_en
                  : item.name_en || item.name_pt;

              return (
                <button
                  key={item.unique_name}
                  onClick={() => handleSelect(item.unique_name)}
                  className={`group flex w-full items-center gap-4 border-l-2 px-5 py-3 text-left transition-all ${
                    index === selectedIndex
                      ? "border-primary bg-primary/10 shadow-[inset_0_1px_0_rgba(74,222,128,0.2)]"
                      : "border-transparent hover:bg-background/60"
                  }`}
                >
                  <div className="shrink-0 rounded-xl border border-border/20 bg-black/40 p-1.5 transition-transform group-hover:scale-110">
                    <img
                      src={getItemImageUrl(item.unique_name)}
                      alt={item.unique_name}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://render.albiononline.com/v1/item/T1_BAG.png";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {displayName}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground/50">
                      {item.unique_name}
                    </p>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all ${
                      index === selectedIndex
                        ? "translate-x-0 text-primary opacity-100"
                        : "-translate-x-2 text-muted-foreground/20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border/20 px-5 py-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/35">
              Albion Market Search
            </span>
            <kbd className="rounded border border-border/40 bg-background/60 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </div>
    </>
  );
}

export function GlobalSearchTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new Event(GLOBAL_SEARCH_EVENT));
  };

  return (
    <button
      onClick={handleClick}
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-border/40 bg-background/40 px-3 py-1.5 transition-all hover:border-primary/30 hover:bg-background/60 sm:w-auto sm:justify-start"
    >
      <Search className="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-primary" />
      <span className="text-[11px] font-medium text-muted-foreground/50">
        Buscar...
      </span>
      <kbd className="hidden rounded border border-border/40 bg-background/60 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground/45 lg:inline">
        Ctrl+K
      </kbd>
    </button>
  );
}
