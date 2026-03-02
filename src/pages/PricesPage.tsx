/**
 * PricesPage Refatorada
 * Agora apenas orquestra os componentes
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchMyItemsPrices } from '../api/albion';
import { useRegion } from '../context/RegionContext';
import { Loader } from '../components/common/LoadingScreen';
import { PricesFiltersPanel } from '../components/prices/PricesFiltersPanel';
import { PricesTable } from '../components/prices/PricesTable';
import { EmptyState } from '../components/prices/EmptyState';
import { usePricesFilter } from '../hooks/usePricesFilter';
import '../components/prices/PricesPage.css';

export const PricesPage = () => {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();
  const [error, setError] = useState<string | null>(null);

  // Fetch dados
  const {
    data: rawItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-items-prices', region],
    queryFn: () => fetchMyItemsPrices(region),
    retry: 1,
  });

  // Usar hook de filtros
  const filter = usePricesFilter({
    items: rawItems,
    locale: i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US',
  });

  // Gerenciar erro
  useEffect(() => {
    if (isError) {
      setError(t('prices.errorLoading'));
    }
  }, [isError, t]);

  // Tela de carregamento
  if (isLoading) {
    return <Loader label={t('common.loading')} />;
  }

  // Tela de erro
  if (error) {
    return (
      <div className="error-container">
        <h2>{t('prices.errorLoading')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Tela vazia
  if (rawItems.length === 0) {
    return (
      <div className="prices-page">
        <div className="prices-header">
          <h1>{t('prices.title')}</h1>
          <p className="subtitle">{t('prices.subtitle')}</p>
        </div>
        <EmptyState
          title={t('dashboard.noItemsToMonitor')}
          description={t('dashboard.startAdding')}
          icon="🎯"
        />
      </div>
    );
  }

  // Render principal
  return (
    <div className="prices-page">
      {/* Header */}
      <div className="prices-header">
        <h1>{t('prices.title')}</h1>
        <p className="subtitle">{t('prices.subtitle')}</p>
      </div>

      {/* Filtros */}
      <PricesFiltersPanel filter={filter} />

      {/* Tabela */}
      {filter.resultCount === 0 ? (
        <EmptyState
          title={t('prices.noResults')}
          description={
            filter.hasActiveFilters
              ? t('prices.noResults')
              : 'No items found'
          }
          icon="🔍"
        />
      ) : (
        <div className="prices-results-info">
          <p className="results-count">
            {t('common.showing', {
              defaultValue: `Showing ${filter.resultCount} result${filter.resultCount !== 1 ? 's' : ''
                }`,
            })}
          </p>
          <PricesTable
            items={filter.filteredItems}
            locale={i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'}
          />
        </div>
      )}
    </div>
  );
};