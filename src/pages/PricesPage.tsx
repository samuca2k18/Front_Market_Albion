import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import '../components/common/common.css';
import { fetchAlbionPrice } from '../api/albion';
import type { PriceFilters } from '../api/types';
import { ALBION_CITIES, ALBION_ENCHANTMENTS, ALBION_QUALITIES } from '../constants/albion';

interface FiltersForm extends PriceFilters {
  minPrice?: number;
}

export function PricesPage() {
  const [minPrice, setMinPrice] = useState(0);
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
      enchantment: 0,
      minPrice: 0,
    },
  });

  const priceMutation = useMutation({
    mutationFn: fetchAlbionPrice,
  });

  const onSubmit = (data: FiltersForm) => {
    if (!data.item_name?.trim()) return;
    const payload: PriceFilters = {
      item_name: data.item_name,
      cities: data.cities,
      quality: data.quality,
      enchantment: data.enchantment,
    };
    setMinPrice(data.minPrice ?? 0);
    priceMutation.mutate(payload);
  };

  const handleReset = () => {
    reset();
    setMinPrice(0);
    priceMutation.reset();
  };

  const filteredRows = useMemo(() => {
    if (!priceMutation.data) return [];
    return priceMutation.data.all_data.filter((entry) => entry.sell_price_min >= minPrice);
  }, [priceMutation.data, minPrice]);

  const watchedCities = watch('cities');

  return (
    <div className="prices-page">
      <Card
        title="Consulta avançada de preços"
        description="Defina filtros profissionais para encontrar oportunidades no mercado."
        actions={
          priceMutation.data && (
            <button className="ghost-button" onClick={handleReset}>
              Limpar
            </button>
          )
        }
      >
        <form className="filters-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <label>
              Item
              <input
                type="text"
                placeholder="EX: T6_CAPE@2"
                {...register('item_name', { required: 'Informe o item' })}
              />
              {errors.item_name && <span className="form-error">{errors.item_name.message}</span>}
            </label>

            <label>
              Qualidade
              <select {...register('quality')}>
                <option value="">Todas</option>
                {ALBION_QUALITIES.map((quality) => (
                  <option key={quality.value} value={quality.value}>
                    {quality.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Encantamento
              <select {...register('enchantment', { valueAsNumber: true })}>
                {ALBION_ENCHANTMENTS.map((enc) => (
                  <option key={enc.value} value={enc.value}>
                    {enc.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Preço mínimo (silver)
              <input type="number" min={0} {...register('minPrice', { valueAsNumber: true })} />
            </label>
          </div>

          <fieldset className="city-selector">
            <legend>Cidades monitoradas</legend>
            <div className="city-grid">
              {ALBION_CITIES.map((city) => (
                <label key={city} className={watchedCities?.includes(city) ? 'city-option active' : 'city-option'}>
                  <input type="checkbox" value={city} {...register('cities')} />
                  <span>{city}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="filters-actions">
            <button type="submit" className="primary-button" disabled={priceMutation.isPending}>
              {priceMutation.isPending ? 'Consultando...' : 'Buscar preços'}
            </button>
            <button type="button" className="ghost-button" onClick={handleReset}>
              Resetar filtros
            </button>
          </div>
        </form>
      </Card>

      {priceMutation.isPending && <p className="muted">Consultando Albion Data API...</p>}

      {priceMutation.data && (
        <Card
          title={`Resultado: ${priceMutation.data.item}`}
          description={`Melhor cidade: ${priceMutation.data.cheapest_city} (${priceMutation.data.cheapest_price.toLocaleString(
            'pt-BR',
          )} silver)`}
        >
          <div className="pill">Cidades verificadas: {priceMutation.data.cities_checked.join(', ')}</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cidade</th>
                  <th>Qualidade</th>
                  <th>Preço mínimo</th>
                  <th>Atualização</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((entry) => (
                  <tr key={`${entry.city}-${entry.sell_price_min}`}>
                    <td>{entry.city}</td>
                    <td>{entry.quality ?? '—'}</td>
                    <td>{entry.sell_price_min.toLocaleString('pt-BR')} silver</td>
                    <td>
                      {entry.sell_price_min_date
                        ? new Date(entry.sell_price_min_date).toLocaleString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

