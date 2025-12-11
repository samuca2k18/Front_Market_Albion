import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../api/productService";
import { searchProducts } from "../../api/productService";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchAutocomplete.css";

interface SearchAutocompleteProps {
  onSelectProduct?: (product: Product) => void;
}

export function SearchAutocomplete({ onSelectProduct }: SearchAutocompleteProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-search", debouncedQuery, i18n.language],
    queryFn: () => searchProducts(debouncedQuery, i18n.language as "pt-BR" | "en-US"),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });

  const results = Array.isArray(data) ? data : [];

  // Helper para obter o nome no idioma atual
  const getLabel = (product: Product): string => {
    const isPortuguese = i18n.language === "pt-BR";
    
    if (isPortuguese) {
      return product.name_pt || product.name_en || product.unique_name;
    } else {
      return product.name_en || product.name_pt || product.unique_name;
    }
  };

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Abre dropdown quando tiver resultado
  useEffect(() => {
    if (results.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [results.length]);

  const handleSelect = (product: Product) => {
    const label = getLabel(product);

    // Mostra no input o nome amigável
    setQuery(label);
    setIsOpen(false);

    // Passa o produto normalizado para o pai
    onSelectProduct?.(product);
  };

  const handleClear = (e?: ReactMouseEvent) => {
    e?.stopPropagation();
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
  
    if (e.key === "Enter") {
      e.preventDefault();
  
      if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder={t("search.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {query && (
          <button className="clear-btn" onClick={handleClear} type="button">
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-dropdown">
          {isLoading && (
            <div className="search-loading">{t("search.loading")}</div>
          )}

          {isError && (
            <div className="search-error">{t("search.error")}</div>
          )}

          {!isLoading &&
            !isError &&
            results.length === 0 &&
            debouncedQuery.length >= 2 && (
              <div className="search-empty">{t("search.noResults")}</div>
            )}

          {!isLoading &&
            !isError &&
            results.map((product: Product) => {
              const label = getLabel(product);
              if (!product.unique_name) return null;

              const imgUrl = `https://render.albiononline.com/v1/item/${encodeURIComponent(
                product.unique_name,
              )}.png`;

              return (
                <button
                  key={product.unique_name}
                  type="button"
                  className="search-result-card"
                  onClick={() => handleSelect(product)}
                >
                  <img
                    src={imgUrl}
                    alt={label}
                    className="search-item-image"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://render.albiononline.com/v1/item/T1_BAG.png";
                    }}
                  />
                
                  <div className="search-item-content">
                    <span className="search-item-label">{label}</span>
                    <span className="search-item-internal">{product.unique_name}</span>
                  </div>
                </button>  
              );
            })}
        </div>
      )}
    </div>
  );
}