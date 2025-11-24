import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import '../components/common/common.css';
import { fetchAlbionPrice, fetchMyItemsPrices } from '../api/albion';
import type { PriceFilters } from '../api/types';
import { ALBION_CITIES, ALBION_ENCHANTMENTS, ALBION_QUALITIES } from '../constants/albion';
import { getQualityLabel, getQualityColor } from '../constants/qualities';
import { getItemImageUrl } from '../utils/itemImage';

interface FiltersForm extends PriceFilters {
  minPrice?: number;
}

export function PricesPage() {
  const [minPrice, setMinPrice] = useState(0);
  const [searchCombinations, setSearchCombinations] = useState<Array<{ item_name: string; quality: number }>>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FiltersForm>({
    defaultValues: {
      item_name: '',
      cities: [],
      quality: 0,     // 0 = Todas
      enchantment: -1, // -1 = Todos
      minPrice: 0,
    },
  });

  // BUSCA EM PARALELO
  const priceQueries = useQueries({
    queries: searchCombinations.map(({ item_name, quality }) => ({
      queryKey: ['price', item_name, quality, watch('cities')],
      queryFn: () => fetchAlbionPrice({
        item_name,
        cities: watch('cities').length ? watch('cities') : undefined,
        quality,
      }),
      enabled: searchCombinations.length > 0,
    })),
  });

  const myPricesQuery = useQuery({
    queryKey: ['my-items-prices'],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  const onSubmit = (data: FiltersForm) => {
    if (!data.item_name?.trim()) return;

    const baseItem = data.item_name.trim().toUpperCase().replace(/@\d+$/, '');

    // Encantamentos
    const enchantmentsToSearch = data.enchantment === -1 ? [0, 1, 2, 3, 4] : [data.enchantment || 0];

    // QUALIDADES — AGORA RESPEITA O FILTRO EXATO!
    const selectedQuality = data.quality;
    const qualitiesToSearch = selectedQuality === 0 
      ? [1, 2, 3, 4, 5]  // "Todas" → busca todas
      : [selectedQuality]; // Qualquer outra → só essa!

    const combinations = enchantmentsToSearch.flatMap(ench => {
      const suffix = ench === 0 ? '' : `@${ench}`;
      return qualitiesToSearch.map(q => ({
        item_name: `${baseItem}${suffix}`,
        quality: q,
      }));
    });

    setSearchCombinations(combinations);
    setMinPrice(data.minPrice ?? 0);
  };

  const handleReset = () => {
    reset();
    setMinPrice(0);
    setSearchCombinations([]);
  };

  // RESULTADOS
  const manualRows = useMemo(() => {
    const rows: any[] = [];
    priceQueries.forEach(query => {
      if (query.data?.all_data) {
        query.data.all_data.forEach((e: any) => {
          if (e.sell_price_min >= minPrice && e.sell_price_min > 0) {
            rows.push({
              ...e,
              item_id: query.data.item || e.item_id,
            });
          }
        });
      }
    });
    return rows.sort((a, b) => a.sell_price_min - b.sell_price_min);
  }, [priceQueries, minPrice]);

  const isSearching = priceQueries.some(q => q.isFetching);
  const myItems = Array.isArray(myPricesQuery.data) ? myPricesQuery.data : [];
  const myItemsFiltered = useMemo(() => {
    return myItems.filter(item => item.price >= minPrice).sort((a, b) => a.price - b.price);
  }, [myItems, minPrice]);

  const watchedCities = watch('cities');

  return (
    <div className="prices-page">

      <Card title="Busca Avançada de Preços" description="Filtre exatamente pela qualidade que quiser">
        <form className="filters-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <label>
              Item
              <input
                type="text"
                placeholder="T8_BAG, T6_CAPE..."
                {...register('item_name', { required: 'Digite o item' })}
              />
              {errors.item_name && <span className="form-error">{errors.item_name.message}</span>}
            </label>

            <label>
              Qualidade
              <select {...register('quality', { valueAsNumber: true })}>
                {ALBION_QUALITIES.map(q => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </label>

            <label>
              Encantamento
              <select {...register('enchantment', { valueAsNumber: true })}>
                {ALBION_ENCHANTMENTS.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </label>

            <label>
              Preço mínimo
              <input type="number" min={0} {...register('minPrice', { valueAsNumber: true })} />
            </label>
          </div>

          <fieldset className="city-selector">
            <legend>Cidades</legend>
            <div className="city-grid">
              {ALBION_CITIES.map(city => (
                <label key={city} className={watchedCities?.includes(city) ? 'city-option active' : 'city-option'}>
                  <input type="checkbox" value={city} {...register('cities')} />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="filters-actions">
            <button type="submit" className="primary-button" disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" className="ghost-button" onClick={handleReset}>
              Limpar
            </button>
          </div>
        </form>
      </Card>

      {isSearching && <p className="muted">Buscando preços...</p>}

      {manualRows.length > 0 && (
        <Card title={`Encontrados ${manualRows.length} preços`}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cidade</th>
                  <th>Qualidade</th>
                  <th>Preço</th>
                  <th>Atualização</th>
                </tr>
              </thead>
              <tbody>
                {manualRows.map((e, i) => (
                  <tr key={i}>
                    <td className="item-with-image">
                      <img
                        src={getItemImageUrl(e.item_id)}
                        alt={e.item_id}
                        className="item-icon"
                        loading="lazy"
                        onError={(img) => img.currentTarget.src = 'https://render.albiononline.com/v1/item/T1_BAG.png'}
                      />
                      <strong>{e.item_id}</strong>
                    </td>
                    <td><span className="pill">{e.city}</span></td>
                    <td style={{
                      color: getQualityColor(e.quality),
                      fontWeight: 700,
                      textShadow: e.quality === 5 ? '0 0 10px #FF9800' : 'none'
                    }}>
                      {getQualityLabel(e.quality)}
                    </td>
                    <td>{e.sell_price_min.toLocaleString('pt-BR')} silver</td>
                    <td>{e.sell_price_min_date ? new Date(e.sell_price_min_date).toLocaleTimeString('pt-BR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MEUS ITENS */}
      <Card title="Meus itens monitorados">
        {myPricesQuery.isLoading && <p className="muted">Carregando...</p>}
        {myPricesQuery.isError && <p className="form-error">Erro ao carregar.</p>}

        {myItemsFiltered.length > 0 ? (
          <div className="table-wrapper">
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
                {myItemsFiltered.map((item: any) => (
                  <tr key={item.item_name}>
                    <td className="item-with-image">
                      <img src={getItemImageUrl(item.item_name)} alt={item.item_name} className="item-icon" loading="lazy" />
                      <strong>{item.item_name}</strong>
                    </td>
                    <td><span className="pill">{item.city || '—'}</span></td>
                    <td>{Number(item.price).toLocaleString('pt-BR')} silver</td>
                    <td style={{ color: getQualityColor(item.quality), fontWeight: 700 }}>
                      {getQualityLabel(item.quality)}
                    </td>
                    <td>{item.enchantment > 0 ? `@${item.enchantment}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : myPricesQuery.isSuccess && myItems.length === 0 ? (
          <div className="empty-state">Nenhum item monitorado.</div>
        ) : myPricesQuery.isSuccess ? (
          <p className="muted">Nenhum item acima do preço mínimo.</p>
        ) : null}
      </Card>
    </div>
  );
}