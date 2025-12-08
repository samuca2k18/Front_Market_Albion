// src/pages/DashboardPage.tsx
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useEffect } from 'react';
import { Card } from '../components/common/Card';
import '../components/common/common.css';
import { createItem, listItems, deleteItem } from '../api/items';
import {
  fetchMyItemsPrices,
  fetchAlbionHistory,
  type AlbionHistoryResponse,
} from '../api/albion';
import type { ItemPayload, Item, MyItemPrice } from '../api/types';
import type { ApiErrorShape } from '../api/client';
import { getQualityLabel, getQualityColor } from '../constants/qualities';
import { getItemImageUrl } from '../utils/itemImage';
import { ALBION_TIERS } from '../constants/albion';
import { SearchAutocomplete } from '../components/search/SearchAutocomplete';
import { getItemDisplayNameWithEnchantment } from '../utils/itemNameMapper';
import { searchItems } from '../api/albion';

// recharts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type TierFilter = 'all' | 'no-tier' | number;

// helper: extrai o tier do nome interno (T4_BAG@2 -> 4, T1_BAG -> 1, etc.)
function getTierFromItemName(itemName: string): number | null {
  if (!itemName) return null;

  const match = itemName.match(/^T(\d+)_/);
  if (!match) return null;

  const tier = parseInt(match[1], 10);
  if (Number.isNaN(tier)) return null;

  if (tier < 1 || tier > 8) return null;
  return tier;
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { handleSubmit, reset } = useForm<ItemPayload>({
    defaultValues: { item_name: '' },
  });

  const [selectedTier, setSelectedTier] = useState<TierFilter>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);
  const [itemNamesCache, setItemNamesCache] = useState<Map<string, string>>(new Map());

  // Itens salvos pelo usuário
  const itemsQuery = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: listItems,
  });

  // Preços dos itens do usuário
  const myPricesQuery = useQuery<MyItemPrice[]>({
    queryKey: ['my-items-prices'],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  // Histórico do item selecionado
  const historyQuery = useQuery<AlbionHistoryResponse>({
    queryKey: ['albion-history', selectedHistoryItem],
    queryFn: () => fetchAlbionHistory(selectedHistoryItem!, 7, ['Caerleon'], '6h'),
    enabled: !!selectedHistoryItem,
  });

  // Criar item
  const createMutation = useMutation<void, ApiErrorShape, ItemPayload>({
    mutationFn: async (payload) => {
      await createItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['my-items-prices'] });
      myPricesQuery.refetch();
      reset();
    },
  });

  // Remover item
  const deleteMutation = useMutation<void, ApiErrorShape, number>({
    mutationFn: async (id) => {
      await deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['my-items-prices'] });
      myPricesQuery.refetch();
    },
  });

  const onSubmit = (payload: ItemPayload) => {
    const name = payload.item_name?.trim().toUpperCase();
    if (!name) return;
    createMutation.mutate({ item_name: name });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que quer remover este item da sua lista?')) {
      deleteMutation.mutate(id);
    }
  };

  const trackedItems = itemsQuery.data ?? [];
  const myPricesRaw = myPricesQuery.data ?? [];

  // 1) filtra por preço válido + tier
  const filtered = myPricesRaw
    .filter((p) => p && typeof p.price === 'number' && p.price > 0)
    .filter((p) => {
      const tier = getTierFromItemName(p.item_name);

      if (selectedTier === 'all') return true;
      if (selectedTier === 'no-tier') return tier === null;
      return tier === selectedTier;
    });

  // 2) agrupa por item_name e pega o MAIS BARATO de cada item
  const cheapestByItem = new Map<string, MyItemPrice>();

  for (const p of filtered) {
    const existing = cheapestByItem.get(p.item_name);
    if (!existing || p.price < existing.price) {
      cheapestByItem.set(p.item_name, p);
    }
  }

  // 3) vira array e ordena por preço
  const myPrices = Array.from(cheapestByItem.values()).sort(
    (a, b) => a.price - b.price,
  );

  const lowestPrice = myPrices.length > 0 ? myPrices[0].price : null;

  // Busca nomes em português para os itens
  useEffect(() => {
    const fetchItemNames = async () => {
      const uniqueItemNames = Array.from(new Set(myPrices.map(p => p.item_name.split('@')[0])));
      const promises = uniqueItemNames
        .filter(baseName => !itemNamesCache.has(baseName))
        .map(async (baseName) => {
          try {
            const results = await searchItems(baseName);
            const found = results.find(r => r.unique_name === baseName);
            if (found && found.name_pt) {
              return { baseName, name: found.name_pt };
            }
          } catch (error) {
            // Silenciosamente falha, usa fallback
          }
          return null;
        });

      const results = await Promise.all(promises);
      const newEntries = results.filter((r): r is { baseName: string; name: string } => r !== null);
      
      if (newEntries.length > 0) {
        setItemNamesCache(prev => {
          const newMap = new Map(prev);
          newEntries.forEach(({ baseName, name }) => {
            newMap.set(baseName, name);
          });
          return newMap;
        });
      }
    };

    if (myPrices.length > 0) {
      fetchItemNames();
    }
  }, [myPrices, itemNamesCache]);

  // Função helper para obter nome do item
  const getItemDisplayName = (itemName: string): string => {
    const baseName = itemName.split('@')[0];
    const cachedName = itemNamesCache.get(baseName);
    if (cachedName) {
      const enchant = itemName.includes('@') ? ` @${itemName.split('@')[1]}` : '';
      return `${cachedName}${enchant}`;
    }
    return getItemDisplayNameWithEnchantment(itemName);
  };

  // Dados formatados para o gráfico
  const chartData = useMemo(() => {
    if (!historyQuery.data) return [];
    return historyQuery.data.data.map((point) => ({
      // pega só a data/hora curta pra eixo X
      time: new Date(point.date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      avg_price: point.avg_price,
      city: point.city,
    }));
  }, [historyQuery.data]);

  return (
    <div className="dashboard-page">
      <section className="dashboard-grid">
        <Card
          title="Resumo rápido"
          description="Seus itens monitorados em tempo real."
        >
          <div className="stat-grid">
            <div className="stat-card">
              <span>Itens rastreados</span>
              <strong>{trackedItems.length}</strong>
            </div>
            <div className="stat-card">
              <span>Com preço ativo</span>
              <strong>{myPrices.length}</strong>
            </div>
            <div className="stat-card">
              <span>Melhor oportunidade</span>
              <strong>
                {lowestPrice !== null
                  ? `${lowestPrice.toLocaleString('pt-BR')} silver`
                  : '—'}
              </strong>
            </div>
          </div>
        </Card>

        <Card
          title="Adicionar item"
          description="Digite o nome interno do item (ex: T8_BAG@3) ou nome PT/EN"
        >
          <form className="form inline" onSubmit={handleSubmit(onSubmit)}>
            <SearchAutocomplete onSelectProduct={(product) => {
              createMutation.mutate({ item_name: product.unique_name });
              reset({ item_name: "" });
            }} />
          </form>

          {createMutation.error && (
            <p className="form-error">
              {createMutation.error.message || 'Erro ao adicionar item.'}
            </p>
          )}
        </Card>
      </section>

      <section className="dashboard-grid two-columns">
        <Card
          title="Itens cadastrados"
          description="Clique em Remover para excluir."
        >
          {itemsQuery.isLoading ? (
            <p className="muted">Carregando...</p>
          ) : itemsQuery.isError ? (
            <p className="form-error">Erro ao carregar itens.</p>
          ) : trackedItems.length > 0 ? (
            <ul className="item-list">
              {trackedItems.map((item) => (
                <li key={item.id} className="item-row">
                  <div>
                    <strong>{item.item_name}</strong>
                    <span className="muted">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('pt-BR')
                        : ''}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteMutation.isPending}
                    title="Remover item"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              Nenhum item adicionado ainda.
              <br />
              Comece adicionando um acima!
            </div>
          )}
        </Card>

        <Card
          title="Preços em tempo real"
          description="Clique em um item para ver o histórico de preço."
        >
          {/* FILTRO DE TIER */}
          <div className="filters-row">
            <label>
              Tier
              <select
                value={String(selectedTier)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    setSelectedTier('all');
                  } else if (value === 'no-tier') {
                    setSelectedTier('no-tier');
                  } else {
                    setSelectedTier(Number(value) as number);
                  }
                }}
              >
                <option value="all">Todos</option>
                <option value="no-tier">Sem tier</option>
                {ALBION_TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    T{tier}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {myPricesQuery.isLoading ? (
            <p className="muted">Buscando preços nas cidades...</p>
          ) : myPricesQuery.isError ? (
            <p className="form-error">Erro ao carregar preços.</p>
          ) : myPrices.length > 0 ? (
            <>
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
                    {myPrices.map((item) => (
                      <tr
                        key={`${item.item_name}-${item.city}-${item.quality}-${item.enchantment}`}
                        className="clickable-row"
                        onClick={() => setSelectedHistoryItem(item.item_name)}
                        title="Clique para ver o histórico deste item"
                      >
                        <td className="item-with-image">
                          <img
                            src={getItemImageUrl(item.item_name)}
                            alt={item.item_name}
                            className="item-icon"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://render.albiononline.com/v1/item/T1_BAG.png';
                            }}
                          />
                          <div>
                            <strong>{getItemDisplayName(item.item_name)}</strong>
                            <span className="muted" style={{ fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                              {item.item_name}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="pill">{item.city || '—'}</span>
                        </td>

                        <td>
                          {typeof item.price === 'number'
                            ? `${item.price.toLocaleString('pt-BR')} silver`
                            : '—'}
                        </td>

                        <td
                          style={{
                            color: getQualityColor(item.quality),
                            fontWeight: 700,
                            textShadow:
                              item.quality === 5 ? '0 0 10px #FF9800' : 'none',
                          }}
                        >
                          {getQualityLabel(item.quality)}
                        </td>

                        <td>{item.enchantment > 0 ? `@${item.enchantment}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GRÁFICO DE HISTÓRICO */}
              {selectedHistoryItem && (
                <div className="chart-wrapper" style={{ marginTop: 24 }}>
                  <h3>
                    Histórico de preço —{' '}
                    <span className="muted">{getItemDisplayName(selectedHistoryItem)}</span>
                  </h3>

                  {historyQuery.isLoading && <p className="muted">Carregando gráfico...</p>}

                  {historyQuery.isError && (
                    <p className="form-error">
                      Não foi possível carregar o histórico deste item.
                    </p>
                  )}

                  {!historyQuery.isLoading &&
                    !historyQuery.isError &&
                    chartData.length === 0 && (
                      <p className="muted">
                        Sem dados suficientes de histórico para este item.
                      </p>
                    )}

                  {!historyQuery.isLoading &&
                    !historyQuery.isError &&
                    chartData.length > 0 && (
                      <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="avg_price"
                              dot={false}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              Adicione itens para começar a monitorar os preços!
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
