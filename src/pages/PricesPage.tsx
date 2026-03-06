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
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">{t('common.loading')}</p>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="app-container py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-destructive/10 p-6 rounded-3xl mb-6 border border-destructive/20 shadow-xl">
          <AlertCircle className="w-16 h-16 text-destructive/60" />
        </div>
        <h2 className="text-2xl font-black tracking-tight uppercase mb-2">{t('prices.errorLoading')}</h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-sm">{error}</p>
        <Button variant="destructive" onClick={() => refetch()} className="font-bold uppercase tracking-widest px-8">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="app-container py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                <Tag className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                {t('prices.title')}
              </h1>
            </div>
            <p className="text-muted-foreground font-medium pl-1">
              {t('prices.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-2 rounded-2xl shadow-xl">
            <div className="px-4 text-center">
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Monitorado</div>
              <div className="text-xl font-black tracking-tighter text-foreground">{rawItems.length}</div>
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
          <div className="space-y-8 animate-fade-up">
            {/* Filtros */}
            <PricesFiltersPanel filter={filter} />

            {/* Resultado Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
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