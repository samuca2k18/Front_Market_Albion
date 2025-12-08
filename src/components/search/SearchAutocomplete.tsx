import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../../api/productService";
import { searchProducts } from "../../api/productService";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchAutocompleteProps {
  onSelectProduct?: (product: Product | any) => void;
}

export function SearchAutocomplete({ onSelectProduct }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-search", debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2, // só busca com 2+ caracteres
    staleTime: 60_000,
  });

  const results = Array.isArray(data) ? data : [];

  // helper pra extrair o "nome interno" independente do formato
  const getInternalName = (product: any): string | undefined =>
    product.unique_name ?? product.UniqueName;

  // helper pra extrair nome bonitinho (PT > EN > internal)
  const getLabel = (product: any): string => {
    const internal = getInternalName(product) ?? "";
    return (
      product.name_pt ??
      product["PT-BR"] ??
      product.name_en ??
      product["EN-US"] ??
      internal
    );
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

  const handleSelect = (product: any) => {
    const internal = getInternalName(product);
    const label = getLabel(product);

    // Mostra no input o nome amigável
    setQuery(label);
    setIsOpen(false);

    // devolve o objeto bruto pro pai (Dashboard)
    onSelectProduct?.(
      {
        ...product,
        // garante que quem usar receba esses campos normalizados também
        unique_name: internal,
        name_pt: product.name_pt ?? product["PT-BR"],
        name_en: product.name_en ?? product["EN-US"],
      } as Product,
    );
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
        // seleciona o primeiro resultado da lista
        handleSelect(results[0] as any);
      }
    }
  };
  

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Buscar item..."
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
          {isLoading && <div className="search-loading">Carregando...</div>}

          {isError && (
            <div className="search-error">Erro ao carregar resultados.</div>
          )}

          {!isLoading &&
            !isError &&
            results.length === 0 &&
            debouncedQuery.length >= 2 && (
              <div className="search-empty">Nenhum item encontrado.</div>
            )}

          {!isLoading &&
            !isError &&
            results.map((product: any) => {
              const internal = getInternalName(product);
              const label = getLabel(product);
              if (!internal) return null;

              const imgUrl = `https://render.albiononline.com/v1/item/${encodeURIComponent(
                internal,
              )}.png`;

              return (
                <button
                  key={internal}
                  className="search-item"
                  type="button"
                  onClick={() => handleSelect(product)}
                >
                  <img
                    src={imgUrl}
                    alt={label}
                    className="search-item-image"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://render.albiononline.com/v1/item/T1_BAG.png";
                    }}
                  />
              
                  <div className="search-item-content">
                    <span className="search-item-label">{label}</span>
                    <span className="search-item-internal">{internal}</span>
                  </div>
                </button>
              );
              
            })}
        </div>
      )}
    </div>
  );
}
