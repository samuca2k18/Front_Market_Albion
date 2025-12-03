import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEvent as ReactMouseEvent,
  } from "react";
  import { useQuery } from "@tanstack/react-query";
  import { type Product, searchProducts } from "@/api/productService";
  import { useDebounce } from "@/hooks/useDebounce";
  
  interface SearchAutocompleteProps {
    onSelectProduct?: (product: Product) => void;
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
      // Define o campo de busca para o nome mais amigável disponível
      setQuery(product.name_pt || product.name_en || product.unique_name);
      setIsOpen(false);
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
      }
    };
  
    return (
      <div className="search-wrapper" ref={wrapperRef}>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Buscar produto..."
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
  
            {!isLoading && !isError && results.length === 0 && debouncedQuery.length >= 2 && (
              <div className="search-empty">Nenhum produto encontrado.</div>
            )}
  
            {!isLoading &&
              !isError &&
              results.map((product) => (
                <button
                  key={product.unique_name}
                  className="search-item"
                  type="button"
                  onClick={() => handleSelect(product)}
                >
                  <img src={`https://render.albiononline.com/v1/item/${product.unique_name}.png`} alt={product.name_pt || product.name_en || product.unique_name} />
                  <span>{product.name_pt || product.name_en || product.unique_name}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    );
  }
  