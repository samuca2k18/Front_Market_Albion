// src/components/albion/HistoryChart.tsx
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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

interface HistoryChartProps {
  itemId: string;
  city: string;
}

export function HistoryChart({ itemId, city }: HistoryChartProps) {
  const historyQuery = useQuery({
    queryKey: ['history', itemId, city],
    queryFn: () => fetchAlbionHistory(itemId, 7, [city], '6h'),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    const points = historyQuery.data?.data ?? [];
    if (!points.length) return [];

    return points.map((p) => {
      const date = new Date(p.timestamp);
      return {
        date: date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        time: date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        fullDate: date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        price: Math.round(p.avg_price),
        timestamp: p.timestamp,
      };
    });
  }, [historyQuery.data]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    const change = last - first;
    const percent = ((change / first) * 100).toFixed(1);
    return { change, percent, isPositive: change >= 0 };
  }, [chartData]);

  if (historyQuery.isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p className="muted">Carregando histórico de preços...</p>
      </div>
    );
  }

  if (historyQuery.isError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p className="form-error">Erro ao carregar histórico.</p>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p className="muted">Sem dados de histórico recentes para esse item/cidade.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>
          {data.fullDate}
        </p>
        <p style={{ margin: 0, fontSize: '16px', color: '#0066ff' }}>
          <strong>{data.price.toLocaleString('pt-BR')} silver</strong>
        </p>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', padding: '20px 0' }}>
      {/* Header com informações de mudança de preço */}
      {priceChange && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: priceChange.isPositive ? '#e8f5e9' : '#ffebee',
            borderRadius: '8px',
            border: `1px solid ${priceChange.isPositive ? '#c8e6c9' : '#ffcdd2'}`,
          }}
        >
          <div>
            <span style={{ fontSize: '13px', color: '#666' }}>Variação (7 dias)</span>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: priceChange.isPositive ? '#2e7d32' : '#c62828',
                marginTop: '4px',
              }}
            >
              {priceChange.isPositive ? '+' : ''}
              {priceChange.change.toLocaleString('pt-BR')} silver ({priceChange.isPositive ? '+' : ''}
              {priceChange.percent}%)
            </div>
          </div>
          <div
            style={{
              fontSize: '24px',
              color: priceChange.isPositive ? '#2e7d32' : '#c62828',
            }}
          >
            {priceChange.isPositive ? '📈' : '📉'}
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#ccc' }}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#ccc' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#0066ff"
              strokeWidth={3}
              fill="url(#colorPrice)"
              dot={{ fill: '#0066ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0066ff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer com informações adicionais */}
      <div
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
        }}
      >
        {chartData.length} pontos de dados • Última atualização: {chartData[chartData.length - 1]?.fullDate}
      </div>
    </div>
  );
}
