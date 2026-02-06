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

type RangeOption = '24h' | '7d' | '30d';

function rangeToParams(range: RangeOption): { days: number; resolution: '1h' | '6h' | '24h' } {
  switch (range) {
    case '24h':
      return { days: 1, resolution: '1h' };
    case '7d':
      return { days: 7, resolution: '6h' };
    case '30d':
      return { days: 30, resolution: '24h' };
  }
}

interface HistoryChartProps {
  itemId: string;
  city: string;
}

export function HistoryChart({ itemId, city }: HistoryChartProps) {
  const [range, setRange] = useState<RangeOption>('7d');

  const { days, resolution } = useMemo(() => rangeToParams(range), [range]);

  const historyQuery = useQuery({
    queryKey: ['history', itemId, city, days, resolution],
    queryFn: () => fetchAlbionHistory(itemId, days, [city], resolution),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    const points = historyQuery.data?.data ?? [];
    if (!points.length) return [];

    return points
      .filter((p: any) => p?.timestamp && Number.isFinite(p?.avg_price))
      .map((p: any) => {
        const date = new Date(p.timestamp);
        return {
          // use timestamp as X key (better for uniqueness)
          ts: date.getTime(),
          label:
            range === '24h'
              ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          fullDate: date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          price: Math.max(0, Math.round(p.avg_price)),
        };
      });
  }, [historyQuery.data, range]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    const change = last - first;

    // prevent division by zero
    const percent = first > 0 ? ((change / first) * 100).toFixed(1) : null;

    return { change, percent, isPositive: change >= 0, first, last };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid #e6e6e6',
          borderRadius: 12,
          padding: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 180,
        }}
      >
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{data.fullDate}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
          {Number(data.price).toLocaleString('pt-BR')} <span style={{ fontSize: 12, fontWeight: 600 }}>silver</span>
        </div>
      </div>
    );
  };

  const isLoading = historyQuery.isLoading;
  const isError = historyQuery.isError;
  const isEmpty = !isLoading && !isError && chartData.length === 0;

  return (
    <div style={{ width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#666' }}>Histórico • {city}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>{itemId}</div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#666' }}>Período</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeOption)}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #e6e6e6',
              background: '#fff',
              fontWeight: 700,
            }}
          >
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* Delta banner */}
      {priceChange && !isLoading && !isError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #e6e6e6',
            background: priceChange.isPositive ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 12, color: '#666' }}>Variação ({range})</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: priceChange.isPositive ? '#2e7d32' : '#c62828',
              }}
            >
              {priceChange.isPositive ? '+' : ''}
              {priceChange.change.toLocaleString('pt-BR')} silver
              {priceChange.percent !== null ? ` (${priceChange.isPositive ? '+' : ''}${priceChange.percent}%)` : ''}
            </div>
          </div>
          <div style={{ fontSize: 22 }}>{priceChange.isPositive ? '📈' : '📉'}</div>
        </div>
      )}

      {/* Body states */}
      {isLoading && (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#666', margin: 0 }}>Carregando histórico...</p>
        </div>
      )}

      {isError && (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#c62828', margin: 0, fontWeight: 700 }}>Erro ao carregar histórico.</p>
        </div>
      )}

      {isEmpty && (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#666', margin: 0 }}>Sem dados recentes para esse item/cidade.</p>
        </div>
      )}

      {/* Chart */}
      {!isLoading && !isError && !isEmpty && (
        <div style={{ width: '100%', height: 320, borderRadius: 14, border: '1px solid #eee', background: '#fff' }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 14, right: 18, left: 6, bottom: 10 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopOpacity={0.25} />
                  <stop offset="90%" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="label"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={48}
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
                strokeWidth={3}
                // sem cor fixa: deixa o CSS/tema cuidar, ou use uma variável CSS
                stroke="currentColor"
                fill="url(#priceFill)"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ padding: '10px 14px', fontSize: 12, color: '#666', borderTop: '1px solid #eee' }}>
            {chartData.length} pontos • Resolução: {resolution} • Último: {chartData[chartData.length - 1]?.fullDate}
          </div>
        </div>
      )}
    </div>
  );
}
