// src/pages/PricesPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { getItemImageUrl } from '../utils/itemImage';
import { getItemDisplayNameWithEnchantment } from '../utils/itemNameMapper';
import { fetchMyItemsPrices } from '../api/albion';
import type { MyItemPrice } from '../api/types';
import { Loader } from '../components/common/LoadingScreen';
import './PricesPage.css';

type SortBy = 'price' | 'city' | 'name';

export const PricesPage = () => {
  const [rawItems, setRawItems] = useState<MyItemPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Carrega preços dos itens do usuário (mesmo endpoint do Dashboard)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyItemsPrices();
        setRawItems(data ?? []);
      } catch (err: any) {
        setError(err?.message || 'Erro ao carregar preços');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Lista de itens únicos para o select
  const uniqueItems = useMemo(() => {
    const names = new Set<string>();
    const list: string[] = [];

    for (const item of rawItems) {
      if (!names.has(item.item_name)) {
        names.add(item.item_name);
        list.push(item.item_name);
      }
    }

    // ordena alfabeticamente pelo nome “bonito”
    return list.sort((a, b) =>
      getItemDisplayNameWithEnchantment(a)
        .localeCompare(getItemDisplayNameWithEnchantment(b), 'pt-BR'),
    );
  }, [rawItems]);

  // Lista de cidades únicas para os checkboxes
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.city) set.add(item.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [rawItems]);

  // Aplica filtros e ordenação
  const filteredItems = useMemo(() => {
    let result = [...rawItems];

    // filtro por item selecionado
    if (selectedItem) {
      result = result.filter((item) => item.item_name === selectedItem);
    }

    // filtro por texto (nome “bonito”)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        getItemDisplayNameWithEnchantment(item.item_name)
          .toLowerCase()
          .includes(query),
      );
    }

    // filtro por cidades selecionadas
    if (selectedCities.size > 0) {
      result = result.filter((item) => item.city && selectedCities.has(item.city));
    }

    // ordenação
    result.sort((a, b) => {
      if (sortBy === 'price') {
        const pa = a.price ?? 0;
        const pb = b.price ?? 0;
        return pa - pb;
      }
      
      if (sortBy === 'city') {
        return (a.city || '').localeCompare(b.city || '', 'pt-BR');
      }
      // sortBy === 'name'
      return getItemDisplayNameWithEnchantment(a.item_name)
        .localeCompare(getItemDisplayNameWithEnchantment(b.item_name), 'pt-BR');
    });

    return result;
  }, [rawItems, selectedItem, selectedCities, sortBy, searchQuery]);

  const handleCityToggle = (city: string) => {
    setSelectedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
      } else {
        next.add(city);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedItem('');
    setSelectedCities(new Set());
    setSearchQuery('');
    setSortBy('price');
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="error-container">
        <h2>Erro ao carregar preços</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="prices-page">
      <div className="prices-header">
        <h1>Preços dos meus itens</h1>
        <p className="subtitle">
          Visualize, filtre e ordene os preços atuais dos itens que você está monitorando.
        </p>
      </div>

      <div className="prices-filters">
        <div className="filters-row">
          <label className="filter-group">
            <span>Selecione um item</span>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">-- Todos os itens --</option>
              {uniqueItems.map((itemName) => (
                <option key={itemName} value={itemName}>
                  {getItemDisplayNameWithEnchantment(itemName)}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-group">
            <span>Buscar item</span>
            <input
              type="search"
              placeholder="Digite o nome do item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          <label className="filter-group">
            <span>Ordenar por</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="price">Preço (menor primeiro)</option>
              <option value="city">Cidade</option>
              <option value="name">Nome do item</option>
            </select>
          </label>

          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
            style={{ marginTop: 'auto' }}
          >
            Limpar filtros
          </button>
        </div>

        <div className="cities-filter">
          <h3>Filtrar por cidade</h3>
          <div className="cities-grid">
            {cities.map((city) => (
              <label key={city} className="city-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCities.has(city)}
                  onChange={() => handleCityToggle(city)}
                />
                <span>{city}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="prices-content">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum item encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="prices-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cidade</th>
                  <th>Preço</th>
                  <th>Qualidade</th>
                  <th>Encant.</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={`${item.item_name}-${item.city}-${idx}`} className="clickable">
                    <td className="item-with-image">
                      <img
                        src={getItemImageUrl(item.item_name)}
                        alt={item.item_name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://render.albiononline.com/v1/item/T1_BAG.png';
                        }}
                      />
                      <strong>
                        {getItemDisplayNameWithEnchantment(item.item_name)}
                      </strong>
                    </td>
                    <td>
                      <span className="pill">{item.city || '—'}</span>
                    </td>
                    <td>
                      <strong>{item.price.toLocaleString('pt-BR')}</strong>
                      <span className="muted"> silver</span>
                    </td>
                    <td>{item.quality}</td>
                    <td>{item.enchantment > 0 ? `@${item.enchantment}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
