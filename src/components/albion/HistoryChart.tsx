// src/components/albion/HistoryChart.tsx
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
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

  if (historyQuery.isLoading) {
    return <p className="muted">Carregando histórico de preços...</p>;
  }

  if (historyQuery.isError) {
    return <p className="form-error">Erro ao carregar histórico.</p>;
  }

  const points = historyQuery.data?.data ?? [];

  if (!points.length) {
    return <p className="muted">Sem dados de histórico recentes para esse item/cidade.</p>;
  }

  const chartData = points.map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    price: p.avg_price,
  }));

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value: any) =>
              `${Number(value).toLocaleString('pt-BR')} silver`
            }
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
