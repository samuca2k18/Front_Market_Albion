import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import '../components/common/common.css';

import { fetchAlbionPrices, fetchMyItemsPrices } from '../api/albion';
import type {
  PriceFilters,
  AlbionMarketEntry,
  MyItemPrice,
  AlbionPricesResponse,
} from '../api/types';

import {
  ALBION_CITIES,
  ALBION_ENCHANTMENTS,
  ALBION_QUALITIES,
} from '../constants/albion';

import { getQualityLabel, getQualityColor } from '../constants/qualities';
import { getItemImageUrl } from '../utils/itemImage';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';

interface FiltersForm extends PriceFilters {
  minPrice?: number;
}

type SearchParams = {
  items: string[];
  qualities: number[];
  cities: string[];
  minPrice: number;
};

export function PricesPage() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [minPrice, setMinPrice] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FiltersForm>({
    defaultValues: {
      item_name: '',
      cities: [],
      quality: 0, // 0 = Todas
      enchantment: -1, // -1 = Todos
      minPrice: 0,
    },
  });

  const watchedCities = watch('cities') ?? [];

  // 🔍 Busca de preços avançada (única query, usando /albion/prices)
  const pricesQuery = useQuery<AlbionPricesResponse | null>({
    queryKey: ['prices', searchParams],
    queryFn: () => {
      if (!searchParams || searchParams.items.length === 0) {
        return Promise.resolve(null);
      }
      return fetchAlbionPrices(
        searchParams.items,
        searchParams.cities.length ? searchParams.cities : undefined,
        searchParams.qualities.length ? searchParams.qualities : undefined,
      );
    },
    enabled: !!searchParams && searchParams.items.length > 0,
  });

  // 💾 Meus itens monitorados (/albion/my-items-prices)
  const myPricesQuery = useQuery<MyItemPrice[]>({
    queryKey: ['my-items-prices'],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  const onSubmit = (data: FiltersForm) => {
    if (!data.item_name?.trim()) return;

    const baseItem = data.item_name.trim().toUpperCase().replace(/@\d+$/, '');

    // Encantamentos → se "Todos", busca 0..4
    const enchantmentsToSearch =
      data.enchantment === -1 ? [0, 1, 2, 3, 4] : [data.enchantment || 0];

    // Qualidades → 0 = "Todas", senão só a selecionada
    const selectedQuality = data.quality ?? 0;
    const qualitiesToSearch =
      selectedQuality === 0 ? [1, 2, 3, 4, 5] : [selectedQuality];

    // Monta lista de UniqueNames: T8_BAG, T8_BAG@1, T8_BAG@2...
    const uniqueItemsSet = new Set<string>();
    enchantmentsToSearch.forEach((ench) => {
      const suffix = ench === 0 ? '' : `@${ench}`;
      uniqueItemsSet.add(`${baseItem}${suffix}`);
    });
    const uniqueItems = Array.from(uniqueItemsSet);

    const minPriceValue = data.minPrice ?? 0;

    setSearchParams({
      items: uniqueItems,
      qualities: qualitiesToSearch,
      cities: data.cities ?? [],
      minPrice: minPriceValue,
    });
    setMinPrice(minPriceValue);
  };

  const handleReset = () => {
    reset();
    setSearchParams(null);
    setMinPrice(0);
  };

  // 🔢 Linhas da tabela principal (busca manual)
  const manualRows = useMemo(() => {
    if (!pricesQuery.data || !pricesQuery.data.all_data) return [];

    return pricesQuery.data.all_data
      .filter(
        (entry: AlbionMarketEntry) =>
          entry.sell_price_min > 0 && entry.sell_price_min >= minPrice,
      )
      .map((entry: AlbionMarketEntry) => ({
        ...entry,
        item_id: entry.item_id ?? '',
      }))
      .sort((a, b) => a.sell_price_min - b.sell_price_min);
  }, [pricesQuery.data, minPrice]);

  const isSearching = pricesQuery.isFetching || pricesQuery.isLoading;

  // 🔁 Meus itens monitorados com filtro de preço mínimo
  const myItems = Array.isArray(myPricesQuery.data) ? myPricesQuery.data : [];
  const myItemsFiltered = useMemo(() => {
    // mantém apenas o mais barato de cada item_name
    const cheapestByItem = new Map<string, MyItemPrice>();

    for (const item of myItems) {
      if (!item || Number(item.price) < minPrice) continue;

      const existing = cheapestByItem.get(item.item_name);
      if (!existing || Number(item.price) < Number(existing.price)) {
        cheapestByItem.set(item.item_name, item);
      }
    }

    return Array.from(cheapestByItem.values()).sort(
      (a, b) => Number(a.price) - Number(b.price),
    );
  }, [myItems, minPrice]);

  // Quando clica em um item da tabela de resultados manuais,
  // refaz a busca focando apenas naquele UniqueName.
  const handleDrilldownToSingleItem = (itemId: string) => {
    if (!searchParams) return;
    setSearchParams({
      ...searchParams,
      items: [itemId],
    });
  };

  return (
    <div className="prices-page">
      <Card
        title="Busca Avançada de Preços"
        description="Filtre exatamente pela qualidade, encantamento, cidades e preço mínimo."
      >
        <form className="filters-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <label>
              Item
              <SearchAutocomplete
                onSelectProduct={(product) => {
                  const unique = product.unique_name.toUpperCase();
                  // pega o @N do unique_name (ex: T8_BAG@3 -> 3)
                  const match = unique.match(/@(\d)$/);
                  const enchantment = match ? Number(match[1]) : 0;

                  // item_name fica com o nome completo (T4_BAG@3 ou T4_BAG)
                  setValue('item_name', unique, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });

                  // trava o select de encantamento no valor do item clicado
                  setValue('enchantment', enchantment, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });

                  // dispara o submit já com esses valores
                  handleSubmit(onSubmit)();
                }}
              />
              <input
                type="hidden"
                {...register('item_name', { required: 'Selecione um item' })}
              />
              {errors.item_name && (
                <span className="form-error">{errors.item_name.message}</span>
              )}
            </label>

            <label>
              Qualidade
              <select {...register('quality', { valueAsNumber: true })}>
                {ALBION_QUALITIES.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Encantamento
              <select {...register('enchantment', { valueAsNumber: true })}>
                {ALBION_ENCHANTMENTS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Preço mínimo
              <input
                type="number"
                min={0}
                {...register('minPrice', { valueAsNumber: true })}
              />
            </label>
          </div>

          <fieldset className="city-selector">
            <legend>Cidades</legend>
            <div className="city-grid">
              {ALBION_CITIES.map((city) => (
                <label
                  key={city}
                  className={
                    watchedCities.includes(city)
                      ? 'city-option active'
                      : 'city-option'
                  }
                >
                  <input type="checkbox" value={city} {...register('cities')} />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="filters-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isSearching}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={handleReset}
            >
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
                  <tr key={`${e.item_id}-${e.city}-${e.quality}-${i}`}>
                    <td
                      className="item-with-image"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDrilldownToSingleItem(e.item_id)}
                      title="Ver apenas este item"
                    >
                      <img
                        src={getItemImageUrl(e.item_id)}
                        alt={e.item_id}
                        className="item-icon"
                        loading="lazy"
                        onError={(img) => {
                          img.currentTarget.src =
                            'https://render.albiononline.com/v1/item/T1_BAG.png';
                        }}
                      />
                      <strong>{e.item_id}</strong>
                    </td>

                    <td>
                      <span className="pill">{e.city}</span>
                    </td>

                    <td
                      style={{
                        color: getQualityColor(e.quality ?? 1),
                        fontWeight: 700,
                        textShadow:
                          e.quality === 5 ? '0 0 10px #FF9800' : 'none',
                      }}
                    >
                      {getQualityLabel(e.quality ?? 1)}
                    </td>

                    <td>
                      {e.sell_price_min.toLocaleString('pt-BR')} silver
                    </td>

                    <td>
                      {e.sell_price_min_date
                        ? new Date(e.sell_price_min_date).toLocaleString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MEUS ITENS MONITORADOS */}
      <Card title="Meus itens monitorados">
        {myPricesQuery.isLoading && (
          <p className="muted">Carregando itens monitorados...</p>
        )}
        {myPricesQuery.isError && (
          <p className="form-error">Erro ao carregar seus itens.</p>
        )}

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
                {myItemsFiltered.map((item) => (
                  <tr
                    key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                  >
                    <td className="item-with-image">
                      <img
                        src={getItemImageUrl(item.item_name)}
                        alt={item.item_name}
                        className="item-icon"
                        loading="lazy"
                        onError={(img) => {
                          img.currentTarget.src =
                            'https://render.albiononline.com/v1/item/T1_BAG.png';
                        }}
                      />
                      <strong>{item.item_name}</strong>
                    </td>

                    <td>
                      <span className="pill">{item.city || '—'}</span>
                    </td>

                    <td>
                      {Number(item.price).toLocaleString('pt-BR')} silver
                    </td>

                    <td
                      style={{
                        color: getQualityColor(item.quality),
                        fontWeight: 700,
                      }}
                    >
                      {getQualityLabel(item.quality)}
                    </td>

                    <td>
                      {item.enchantment > 0 ? `@${item.enchantment}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : myPricesQuery.isSuccess && myItems.length === 0 ? (
          <div className="empty-state">Nenhum item monitorado.</div>
        ) : myPricesQuery.isSuccess ? (
          <p className="muted">
            Nenhum item acima do preço mínimo definido ({minPrice} silver).
          </p>
        ) : null}
      </Card>
    </div>
  );
}
