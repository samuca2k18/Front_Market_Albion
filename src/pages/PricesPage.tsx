/**
 * PricesPage Refatorada - Versão shadcn UI
 * Agora apenas orquestra os componentes com um layout limpo e responsivo.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchMyItemsPrices } from '../api/albion';
import { useRegion } from '../context/RegionContext';
import { PricesFiltersPanel } from '../components/prices/PricesFiltersPanel';
import { PricesTable } from '../components/prices/PricesTable';
import { EmptyState } from '../components/prices/EmptyState';
import { usePricesFilter } from '../hooks/usePricesFilter';
import { Tag, AlertCircle, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';

export const PricesPage = () => {
  const { t, i18n } = useTranslation();
  const { region } = useRegion();
  const [error, setError] = useState<string | null>(null);

  // Fetch dados
  const {
    data: rawItems = [],
    isLoading,
    isError,
    refetch
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
    } else {
      setError(null);
    }
  }, [isError, t]);

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/70 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="app-container py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-destructive/10 p-5 rounded-xl mb-5 border border-destructive/20">
          <AlertCircle className="w-12 h-12 text-destructive/70" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t('prices.errorLoading')}</h2>
        <p className="text-muted-foreground mb-6 text-sm max-w-sm">{error}</p>
        <Button variant="destructive" onClick={() => refetch()} className="font-medium px-6">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <SEO title={t("navigation.prices")} />
      <div className="app-container py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 animate-fade-in">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/15">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {t('prices.title')}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground pl-1">
              {t('prices.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/40 p-2 rounded-lg">
            <div className="px-3 text-center">
              <div className="text-[10px] font-medium text-muted-foreground/70">Total Monitorado</div>
              <div className="text-lg font-bold text-foreground">{rawItems.length}</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {rawItems.length === 0 ? (
          <EmptyState
            title={t('dashboard.noItemsToMonitor')}
            description={t('dashboard.startAdding')}
          />
        ) : (
          <div className="space-y-6 animate-fade-up">
            {/* Filtros */}
            <PricesFiltersPanel filter={filter} />

            {/* Resultado Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-muted-foreground/60">
                  {filter.resultCount === 0
                    ? t('prices.noResults')
                    : t('common.showing', {
                      defaultValue: `Mostrando ${filter.resultCount} resultado${filter.resultCount !== 1 ? 's' : ''}`,
                    })
                  }
                </p>
              </div>

              {filter.resultCount === 0 ? (
                <EmptyState
                  title={t('prices.noResults')}
                  description={filter.hasActiveFilters ? t('prices.noResultsDesc') || "Tente ajustar seus filtros para encontrar o que procura." : 'Nenhum item encontrado.'}
                />
              ) : (
                <PricesTable
                  items={filter.filteredItems}
                  locale={i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US'}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
