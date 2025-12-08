// src/pages/PricesPage.tsx
import { useEffect, useState } from 'react';
import { getItemImageUrl } from '../utils/itemImage';
import { getItemDisplayNameWithEnchantment } from '../utils/itemNameMapper';
import { albionAPI } from '../api/albion';
import { Loader } from '../components/common/LoadingScreen';
import './PricesPage.css';


export const PricesPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'price' | 'city' | 'time'>('price');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itemsData = await albionAPI.getUniqueItems();
        const citiesData = await albionAPI.getCities();

        setItems(itemsData);
        setCities(citiesData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = items;

    if (selectedItem) {
      result = result.filter((item) => item.item_id === selectedItem);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        getItemDisplayNameWithEnchantment(item.item_id)
          .toLowerCase()
          .includes(query),
      );
    }

    setFilteredItems(result);
  }, [selectedItem, items, searchQuery]);

  const handleCityToggle = (city: string) => {
    const newCities = new Set(selectedCities);
    if (newCities.has(city)) {
      newCities.delete(city);
    } else {
      newCities.add(city);
    }
    setSelectedCities(newCities);
  };

  const handleClearFilters = () => {
    setSelectedItem('');
    setSelectedCities(new Set());
    setSearchQuery('');
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
        <h1>Preços do Mercado</h1>
        <p className="subtitle">
          Acompanhe os preços de itens em tempo real
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
              {items.map((item) => (
                <option key={item.item_id} value={item.item_id}>
                  {getItemDisplayNameWithEnchantment(item.item_id)}
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
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="price">Preço (menor)</option>
              <option value="city">Cidade</option>
              <option value="time">Mais recente</option>
            </select>
          </label>

          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
            style={{ marginTop: 'auto' }}
          >
            Limpar Filtros
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
            <p>Nenhum item encontrado</p>
          </div>
        ) : (
          <div className="prices-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cidade</th>
                  <th>Preço</th>
                  <th>Quantidade</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="clickable">
                    <td className="item-with-image">
                      <img
                        src={getItemImageUrl(item.item_id)}
                        alt={item.item_id}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://render.albiononline.com/v1/item/T1_BAG.png';
                        }}
                      />
                      <strong>
                        {getItemDisplayNameWithEnchantment(item.item_id)}
                      </strong>
                    </td>
                    <td>
                      <span className="pill">{item.city}</span>
                    </td>
                    <td>
                      <strong>{item.price.toLocaleString('pt-BR')}</strong>
                      <span className="muted"> silver</span>
                    </td>
                    <td>{item.quantity}</td>
                    <td className="muted text-sm">
                      {new Date(item.updated_at).toLocaleString('pt-BR')}
                    </td>
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
