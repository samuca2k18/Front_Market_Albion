import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
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

  // Helper para obter o nome no idioma atual
  const getLabel = (product: Product): string => {
    const isPortuguese = i18n.language === "pt-BR";

    if (isPortuguese) {
      return product.name_pt || product.name_en || product.unique_name;
    } else {
      return product.name_en || product.name_pt || product.unique_name;
    }
  };

  // Sufixo de encantamento baseado no código interno (@1..@4 -> ".1"..".4")
  const getEnchantSuffix = (uniqueName?: string): string => {
    if (!uniqueName) return "";
    const match = uniqueName.match(/@([1-4])/);
    return match ? `.${match[1]}` : "";
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

  // Reseta o índice ao mudar os resultados ou fechar
  useEffect(() => {
    setActiveIndex(-1);
    if (results.length > 0 && query.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [results, query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex !== -1 && dropdownRef.current) {
      const activeElement = dropdownRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [activeIndex]);

  const handleSelect = (product: Product) => {
    const label = getLabel(product);
    const suffix = getEnchantSuffix(product.unique_name);

    // Mostra no input o nome amigável
    setQuery(label + suffix);
    setIsOpen(false);
    setActiveIndex(-1);

    // Passa o produto normalizado para o pai
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
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <div className="search-input-inner">
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              title={t("common.clear")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="search-dropdown" ref={dropdownRef}>
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
            results.map((product: Product, index) => {
              const label = getLabel(product);
              const suffix = getEnchantSuffix(product.unique_name);
              if (!product.unique_name) return null;

              const imgUrl = `https://render.albiononline.com/v1/item/${encodeURIComponent(
                product.unique_name,
              )}.png`;

              return (
                <button
                  key={product.unique_name}
                  type="button"
                  className={`search-result-card ${index === activeIndex ? "active" : ""}`}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setActiveIndex(index)}
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
                    <span className="search-item-label">{label}{suffix}</span>
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
