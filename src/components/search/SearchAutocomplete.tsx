import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, AlertCircle, PackageSearch } from "lucide-react";
import type { Product } from "../../api/productService";
import { searchProducts } from "../../api/productService";
import { useDebounce } from "../../hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchAutocompleteProps {
  onSelectProduct?: (product: Product) => void;
}

export function SearchAutocomplete({ onSelectProduct }: SearchAutocompleteProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 400);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-search", debouncedQuery, i18n.language],
    queryFn: () => searchProducts(debouncedQuery, i18n.language as "pt-BR" | "en-US"),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  const results = Array.isArray(data) ? data : [];

  const getLabel = (product: Product): string => {
    const isPortuguese = i18n.language === "pt-BR";
    return isPortuguese
      ? product.name_pt || product.name_en || product.unique_name
      : product.name_en || product.name_pt || product.unique_name;
  };

  const getEnchantSuffix = (uniqueName?: string): string => {
    if (!uniqueName) return "";
    const match = uniqueName.match(/@([1-4])/);
    return match ? `.${match[1]}` : "";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
    setIsOpen(results.length > 0 && query.length >= 2);
  }, [results, query]);

  useEffect(() => {
    if (activeIndex !== -1 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleSelect = (product: Product) => {
    const label = getLabel(product);
    const suffix = getEnchantSuffix(product.unique_name);
    setQuery(label + suffix);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectProduct?.(product);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!isOpen && results.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex !== -1 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 rounded-xl bg-background/40 pl-12 pr-10 border-border/40 text-sm md:text-base focus:ring-primary/30"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-white/5 opacity-50 hover:opacity-100"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-[#050910]/95 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.15)] p-2 z-[100] max-h-[380px] overflow-y-auto animate-fade-in custom-scrollbar"
        >
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-sm text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("search.loading")}
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 p-4 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {t("search.error")}
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && debouncedQuery.length >= 2 && (
            <div className="flex flex-col items-center justify-center p-8 text-sm text-muted-foreground/60 text-center">
              <PackageSearch className="w-8 h-8 mb-2 opacity-20" />
              {t("search.noResults")}
            </div>
          )}

          {!isLoading && !isError && results.map((product: Product, index) => {
            const label = getLabel(product);
            const suffix = getEnchantSuffix(product.unique_name);
            const active = index === activeIndex;

            return (
              <button
                key={product.unique_name}
                type="button"
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-left transition-all duration-200 ${active
                  ? "bg-primary/20 border-primary/40 translate-x-1"
                  : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                  } border`}
                onClick={() => handleSelect(product)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="h-10 w-10 bg-black/60 rounded-lg flex-shrink-0 border border-white/10 p-1">
                  <img
                    src={`https://render.albiononline.com/v1/item/${encodeURIComponent(product.unique_name ?? "")}.png`}
                    alt={label}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "https://render.albiononline.com/v1/item/T1_BAG.png";
                    }}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-bold tracking-tight ${active ? "text-primary" : "text-foreground"}`}>
                    {label}{suffix}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground/50 truncate">
                    {product.unique_name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
