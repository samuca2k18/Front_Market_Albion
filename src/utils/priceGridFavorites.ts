export interface PriceGridFavorite {
  id: string;
  name: string;
  items: string[];
  createdAt: number;
}

const STORAGE_KEY = 'albion_price_grid_favorites_v1';

function safeParse(raw: string | null): PriceGridFavorite[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((row) => row && typeof row === 'object')
      .map((row) => ({
        id: String(row.id || crypto.randomUUID()),
        name: String(row.name || 'Favorito').slice(0, 60),
        items: Array.isArray(row.items)
          ? row.items.map((x: unknown) => String(x).toUpperCase()).filter(Boolean).slice(0, 20)
          : [],
        createdAt: Number(row.createdAt) || Date.now(),
      }))
      .filter((row) => row.items.length > 0);
  } catch {
    return [];
  }
}

export function loadPriceGridFavorites(): PriceGridFavorite[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function savePriceGridFavorites(list: PriceGridFavorite[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)));
}

export function addPriceGridFavorite(name: string, items: string[]): PriceGridFavorite[] {
  const next: PriceGridFavorite = {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 60) || 'Favorito',
    items: [...new Set(items.map((x) => x.toUpperCase()).filter(Boolean))].slice(0, 20),
    createdAt: Date.now(),
  };
  if (!next.items.length) return loadPriceGridFavorites();
  const list = [next, ...loadPriceGridFavorites()].slice(0, 40);
  savePriceGridFavorites(list);
  return list;
}

export function deletePriceGridFavorite(id: string): PriceGridFavorite[] {
  const list = loadPriceGridFavorites().filter((row) => row.id !== id);
  savePriceGridFavorites(list);
  return list;
}
