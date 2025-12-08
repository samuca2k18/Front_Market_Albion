import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getItemImageUrl } from '../utils/itemImage';
import { getItemDisplayNameWithEnchantment } from '../utils/itemNameMapper';
import { getQualityLabel } from '../constants/qualities';
import { fetchMyItemsPrices } from '../api/albion';
import type { MyItemPrice } from '../api/types';
import { Loader } from '../components/common/LoadingScreen';
import './PricesPage.css';

type SortBy = 'price' | 'city' | 'name';

function getEnchantmentFromItemName(itemName: string): number {
  const parts = itemName.split('@');
  if (parts.length > 1) {
    const enchant = parseInt(parts[1], 10);
    return isNaN(enchant) ? 0 : enchant;
  }
  return 0;
}

function getBaseItemName(itemName: string): string {
  return itemName.split('@')[0];
}

export const PricesPage = () => {
  const { t, i18n } = useTranslation();
  const [rawItems, setRawItems] = useState<MyItemPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [selectedQualities, setSelectedQualities] = useState<Set<number>>(new Set());
  const [selectedEnchantments, setSelectedEnchantments] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyItemsPrices();
        
        const enrichedData = (data ?? []).map(item => ({
          ...item,
          enchantment: getEnchantmentFromItemName(item.item_name)
        }));
        
        setRawItems(enrichedData);
      } catch (err: any) {
        setError(err?.message || t('prices.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  const uniqueItems = useMemo(() => {
    const names = new Set<string>();
    const list: string[] = [];

    for (const item of rawItems) {
      const baseName = getBaseItemName(item.item_name);
      if (!names.has(baseName)) {
        names.add(baseName);
        list.push(baseName);
      }
    }

    return list.sort((a, b) =>
      getItemDisplayNameWithEnchantment(a)
        .localeCompare(getItemDisplayNameWithEnchantment(b), i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'),
    );
  }, [rawItems, i18n.language]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const item of rawItems) {
      if (item.city) set.add(item.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'));
  }, [rawItems, i18n.language]);

  const qualities = useMemo(() => {
    const set = new Set<number>();
    for (const item of rawItems) {
      set.add(item.quality);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [rawItems]);

  const enchantments = useMemo(() => {
    const set = new Set<number>();
    for (const item of rawItems) {
      const enchant = getEnchantmentFromItemName(item.item_name);
      set.add(enchant);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [rawItems]);

  const filteredItems = useMemo(() => {
    let result = [...rawItems];

    if (selectedItem) {
      result = result.filter((item) => getBaseItemName(item.item_name) === selectedItem);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        getItemDisplayNameWithEnchantment(item.item_name)
          .toLowerCase()
          .includes(query),
      );
    }

    if (selectedCities.size > 0) {
      result = result.filter((item) => item.city && selectedCities.has(item.city));
    }

    if (selectedQualities.size > 0) {
      result = result.filter((item) => selectedQualities.has(item.quality));
    }

    if (selectedEnchantments.size > 0) {
      result = result.filter((item) => {
        const enchant = getEnchantmentFromItemName(item.item_name);
        return selectedEnchantments.has(enchant);
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'price') {
        const pa = a.price ?? 0;
        const pb = b.price ?? 0;
        return pa - pb;
      }
      
      if (sortBy === 'city') {
        return (a.city || '').localeCompare(b.city || '', i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US');
      }

      return getItemDisplayNameWithEnchantment(a.item_name)
        .localeCompare(getItemDisplayNameWithEnchantment(b.item_name), i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US');
    });

    return result;
  }, [rawItems, selectedItem, selectedCities, selectedQualities, selectedEnchantments, sortBy, searchQuery, i18n.language]);

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

  const handleQualityToggle = (quality: number) => {
    setSelectedQualities((prev) => {
      const next = new Set(prev);
      if (next.has(quality)) {
        next.delete(quality);
      } else {
        next.add(quality);
      }
      return next;
    });
  };

  const handleEnchantmentToggle = (enchantment: number) => {
    setSelectedEnchantments((prev) => {
      const next = new Set(prev);
      if (next.has(enchantment)) {
        next.delete(enchantment);
      } else {
        next.add(enchantment);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSelectedItem('');
    setSelectedCities(new Set());
    setSelectedQualities(new Set());
    setSelectedEnchantments(new Set());
    setSearchQuery('');
    setSortBy('price');
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="error-container">
        <h2>{t('prices.errorLoading')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="prices-page">
      <div className="prices-header">
        <h1>{t('prices.title')}</h1>
        <p className="subtitle">
          {t('prices.subtitle')}
        </p>
      </div>

      <div className="prices-filters">
        <div className="filters-row">
          <label className="filter-group">
            <span>{t('prices.selectItem')}</span>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">{t('prices.allItems')}</option>
              {uniqueItems.map((itemName) => (
                <option key={itemName} value={itemName}>
                  {getItemDisplayNameWithEnchantment(itemName)}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-group">
            <span>{t('prices.searchItem')}</span>
            <input
              type="search"
              placeholder={t('prices.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          <label className="filter-group">
            <span>{t('prices.sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="price">{t('prices.priceAsc')}</option>
              <option value="city">{t('prices.city')}</option>
              <option value="name">{t('prices.itemName')}</option>
            </select>
          </label>

          <button
            className="btn btn-secondary"
            onClick={handleClearFilters}
            style={{ marginTop: 'auto' }}
          >
            {t('prices.clearFilters')}
          </button>
        </div>

        <div className="cities-filter">
          <h3>{t('prices.filterByCity')}</h3>
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

        <div className="qualities-filter">
          <h3>{t('prices.filterByQuality')}</h3>
          <div className="qualities-grid">
            {qualities.map((quality) => (
              <label key={quality} className="quality-checkbox">
                <input
                  type="checkbox"
                  checked={selectedQualities.has(quality)}
                  onChange={() => handleQualityToggle(quality)}
                />
                <span>{getQualityLabel(quality)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="enchantments-filter">
          <h3>{t('prices.filterByEnchantment')}</h3>
          <div className="enchantments-grid">
            {enchantments.length > 0 ? (
              enchantments.map((enchantment) => (
                <label key={enchantment} className="enchantment-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedEnchantments.has(enchantment)}
                    onChange={() => handleEnchantmentToggle(enchantment)}
                  />
                  <span>{enchantment === 0 ? t('prices.noEnchantment') : `@${enchantment}`}</span>
                </label>
              ))
            ) : (
              <p className="no-data">{t('prices.noEnchantment')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="prices-content">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>{t('prices.noResults')}</p>
          </div>
        ) : (
          <div className="prices-table">
            <table>
              <thead>
                <tr>
                  <th>{t('prices.table.item')}</th>
                  <th>{t('prices.table.city')}</th>
                  <th>{t('prices.table.price')}</th>
                  <th>{t('prices.table.quality')}</th>
                  <th>{t('prices.table.enchantment')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const enchant = getEnchantmentFromItemName(item.item_name);
                  return (
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
                        <strong>{item.price.toLocaleString(i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US')}</strong>
                        <span className="muted"> {t('dashboard.silver')}</span>
                      </td>
                      <td>{getQualityLabel(item.quality)}</td>
                      <td>{enchant > 0 ? `@${enchant}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};