// src/pages/guild/GuildSearchBar.tsx
import { useState, useCallback, useRef } from "react";
import { Search, Loader2, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRegion } from "@/context/RegionContext";
import type { GuildSearchResult } from "@/api/types";

interface GuildSearchBarProps {
  onSelect: (guild: GuildSearchResult) => void;
  isLoading?: boolean;
}

export function GuildSearchBar({ onSelect, isLoading }: GuildSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuildSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { region } = useRegion();

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (timerRef.current) clearTimeout(timerRef.current);

      if (value.length < 2) {
        setResults([]);
        return;
      }

      setSearching(true);
      const t = setTimeout(async () => {
        try {
          // Import dynamically to avoid circular dep issues at build
          const { searchGuilds } = await import("@/api/albion");
          const data = await searchGuilds(value, 15, region);
          setResults(data);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 400);
      timerRef.current = t;
    },
    [region],
  );

  const handleSelect = (guild: GuildSearchResult) => {
    setQuery(guild.name);
    setResults([]);
    onSelect(guild);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="relative">
        {searching || isLoading ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        )}
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar guilda por nome…"
          className="pl-11 pr-10 h-12 text-base bg-card/60 border-border/40 focus:border-primary/50 
            rounded-2xl backdrop-blur-md shadow-xl font-medium"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border/40 
          rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-up">
          {results.map((guild) => (
            <button
              key={guild.id}
              onClick={() => handleSelect(guild)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 
                transition-colors text-left border-b border-border/20 last:border-b-0"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">{guild.name}</p>
                {guild.alliance_name && (
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    [{guild.alliance_name}]
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className="text-[9px] font-black uppercase tracking-widest border-border/40 text-muted-foreground flex-shrink-0"
              >
                Guilda
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
