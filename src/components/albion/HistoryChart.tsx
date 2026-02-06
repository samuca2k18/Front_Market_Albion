// src/components/albion/HistoryChart.tsx
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { fetchAlbionHistory } from '../../api/albion';

type RangeOption = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1A' | '5A' | 'MAX';

// ⚠️ Seu backend (hoje) limita days <= 30
const BACKEND_MAX_DAYS = 30;

const RANGE_OPTIONS: RangeOption[] = ['1D', '5D', '1M', '6M', 'YTD', '1A', '5A', 'MAX'];
const RANGE_LABEL: Record<RangeOption, string> = {
  '1D': '1 D',
  '5D': '5 D',
  '1M': '1 M',
  '6M': '6 M',
  'YTD': 'YTD',
  '1A': '1 A',
  '5A': '5 A',
  'MAX': 'Máx',
};

function rangeToParams(range: RangeOption): { days: number; resolution: '1h' | '6h' | '24h' } {
  // Regras “bonitas” de resolução:
  // - curto: 1h
  // - médio: 6h
  // - longo: 24h
  switch (range) {
    case '1D':
      return { days: 1, resolution: '1h' };
    case '5D':
      return { days: 5, resolution: '6h' };
    case '1M':
      return { days: 30, resolution: '24h' };

    // estes exigem backend aceitar > 30 dias
    case '6M':
    case 'YTD':
    case '1A':
    case '5A':
    case 'MAX':
      return { days: BACKEND_MAX_DAYS, resolution: '24h' };
  }
}

interface HistoryChartProps {
  itemId: string;
  city: string;
}

export function HistoryChart({ itemId, city }: HistoryChartProps) {
  const [range, setRange] = useState<RangeOption>('1M');

  const { days, resolution } = useMemo(() => rangeToParams(range), [range]);

  const historyQuery = useQuery({
    queryKey: ['history', itemId, city, days, resolution],
    queryFn: () => fetchAlbionHistory(itemId, days, [city], resolution),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    const points = historyQuery.data?.data ?? [];
    if (!points.length) return [];

    const isShort = range === '1D';

    return points
      .filter((p: any) => p?.timestamp && Number.isFinite(p?.avg_price))
      .map((p: any) => {
        const date = new Date(p.timestamp);
        const price = Math.max(0, Math.round(p.avg_price));

        return {
          ts: date.getTime(),
          label: isShort
            ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          fullDate: date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          price,
        };
      });
  }, [historyQuery.data, range]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const prices = chartData.map((d) => d.price).filter((n) => Number.isFinite(n));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    const first = chartData[0]?.price ?? 0;
    const last = chartData[chartData.length - 1]?.price ?? 0;

    const change = last - first;
    const percent = first > 0 ? ((change / first) * 100).toFixed(1) : null;

    return { min, max, first, last, change, percent, isPositive: change >= 0 };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 14,
          padding: 12,
          boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
          minWidth: 210,
          color: 'hsl(var(--foreground))',
        }}
      >
        <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
          {data.fullDate}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.2 }}>
          {Number(data.price).toLocaleString('pt-BR')}{' '}
          <span style={{ fontSize: 12, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>
            silver
          </span>
        </div>
      </div>
    );
  };

  const isLoading = historyQuery.isLoading;
  const isError = historyQuery.isError;
  const isEmpty = !isLoading && !isError && chartData.length === 0;

  const longRangeSelected =
    range === '6M' || range === 'YTD' || range === '1A' || range === '5A' || range === 'MAX';

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 2 }}>
            Histórico • {city}
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'hsl(var(--foreground))' }}>
            {itemId}
          </div>
        </div>

        {/* Range buttons (estilo TradingView) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 6,
            borderRadius: 999,
            border: '1px solid hsl(var(--border))',
            background: 'hsla(220, 30%, 10%, 0.55)',
            backdropFilter: 'blur(10px)',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          {RANGE_OPTIONS.map((opt) => {
            const active = opt === range;

            // desabilita opções > 30 dias enquanto backend não liberar
            const requiresMoreDays = opt === '6M' || opt === 'YTD' || opt === '1A' || opt === '5A' || opt === 'MAX';
            const disabled = requiresMoreDays && BACKEND_MAX_DAYS < 180;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && setRange(opt)}
                disabled={disabled}
                title={
                  disabled
                    ? `Precisa liberar mais dias no backend (hoje: max ${BACKEND_MAX_DAYS}).`
                    : ''
                }
                style={{
                  border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  padding: '8px 12px',
                  borderRadius: 999,
                  fontWeight: 900,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  opacity: disabled ? 0.35 : 1,
                  background: active ? 'hsl(var(--primary))' : 'transparent',
                  color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                  transition: 'transform 120ms ease, background 120ms ease, opacity 120ms ease',
                }}
              >
                {RANGE_LABEL[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aviso quando clicar em ranges longos mas backend capado */}
      {longRangeSelected && BACKEND_MAX_DAYS <= 30 && (
        <div
          style={{
            marginBottom: 10,
            padding: '10px 12px',
            borderRadius: 12,
            border: '1px solid hsl(var(--border))',
            background: 'hsla(220, 22%, 20%, 0.45)',
            color: 'hsl(var(--muted-foreground))',
            fontSize: 12,
          }}
        >
          Esses períodos (6M/YTD/1A/5A/Máx) precisam do backend aceitar mais de 30 dias.
          No momento, estou mostrando até <strong>30 dias</strong>.
        </div>
      )}

      {/* Stats banner */}
      {stats && !isLoading && !isError && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 14,
              border: '1px solid hsl(var(--border))',
              background: 'hsla(220, 30%, 10%, 0.55)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Variação</div>
            <div
              style={{
                marginTop: 4,
                fontSize: 16,
                fontWeight: 900,
                color: stats.isPositive ? 'hsl(154 80% 52%)' : 'hsl(0 84% 60%)',
              }}
            >
              {stats.isPositive ? '+' : ''}
              {stats.change.toLocaleString('pt-BR')} silver
              {stats.percent !== null
                ? ` (${stats.isPositive ? '+' : ''}${stats.percent}%)`
                : ''}
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 14,
              border: '1px solid hsl(var(--border))',
              background: 'hsla(220, 30%, 10%, 0.55)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Mín / Máx</div>
            <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: 'hsl(var(--foreground))' }}>
              {stats.min.toLocaleString('pt-BR')} • {stats.max.toLocaleString('pt-BR')}
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: 14,
              border: '1px solid hsl(var(--border))',
              background: 'hsla(220, 30%, 10%, 0.55)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Período</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: 'hsl(var(--foreground))' }}>
                {range} • {resolution}
              </div>
            </div>
            <div style={{ fontSize: 22 }}>{stats.isPositive ? '📈' : '📉'}</div>
          </div>
        </div>
      )}

      {/* States */}
      {isLoading && (
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            border: '1px solid hsl(var(--border))',
            background: 'hsla(220, 30%, 10%, 0.55)',
            textAlign: 'center',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Carregando histórico...
        </div>
      )}

      {isError && (
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            border: '1px solid hsl(var(--border))',
            background: 'hsla(0, 84%, 60%, 0.08)',
            textAlign: 'center',
            color: 'hsl(var(--foreground))',
            fontWeight: 800,
          }}
        >
          Erro ao carregar histórico.
        </div>
      )}

      {isEmpty && (
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            border: '1px solid hsl(var(--border))',
            background: 'hsla(220, 30%, 10%, 0.55)',
            textAlign: 'center',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Sem dados recentes para esse item/cidade.
        </div>
      )}

      {/* Chart */}
      {!isLoading && !isError && !isEmpty && (
        <div
          style={{
            width: '100%',
            height: 360,
            borderRadius: 18,
            border: '1px solid hsl(var(--border))',
            background: 'linear-gradient(140deg, hsla(222, 26%, 12%, 1), hsla(220, 26%, 8%, 1))',
            boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: '100%', height: 310, padding: '14px 10px 0 10px' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis
                  dataKey="label"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tick={{ fill: 'hsla(210, 40%, 96%, 0.65)' }}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  tick={{ fill: 'hsla(210, 40%, 96%, 0.65)' }}
                  tickFormatter={(v) => {
                    const n = Number(v);
                    if (!Number.isFinite(n)) return '';
                    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
                    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
                    return `${n}`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="url(#priceStroke)"
                  strokeWidth={3}
                  fill="url(#priceFill)"
                  dot={false}
                  activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              padding: '10px 14px',
              fontSize: 12,
              color: 'hsla(210, 40%, 96%, 0.7)',
              borderTop: '1px solid hsla(220, 24%, 22%, 0.7)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span>
              {chartData.length} pontos • Resolução: <strong>{resolution}</strong>
            </span>
            <span>
              Último: <strong>{chartData[chartData.length - 1]?.fullDate}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
