import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import '../components/common/common.css';
import { createItem, listItems, deleteItem } from '../api/items';
import { fetchMyItemsPrices } from '../api/albion';
import type { ItemPayload } from '../api/types';
import { getQualityLabel, getQualityColor } from '../constants/qualities';
import { getItemImageUrl } from '../utils/itemImage'; // IMPORT DA IMAGEM!

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<ItemPayload>({
    defaultValues: { item_name: '' },
  });

  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: listItems,
  });

  const myPricesQuery = useQuery({
    queryKey: ['my-items-prices'],
    queryFn: fetchMyItemsPrices,
    refetchInterval: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['my-items-prices'] });
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['my-items-prices'] });
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
  const myPrices = Array.isArray(myPricesQuery.data) ? myPricesQuery.data : [];

  const lowestPrice = myPrices.length > 0
    ? myPrices.reduce((min, item) => item.price < min ? item.price : min, myPrices[0].price)
    : null;

  return (
    <div className="dashboard">
      <section className="dashboard-grid">
        <Card title="Resumo rápido" description="Seus itens monitorados em tempo real.">
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

        <Card title="Adicionar item" description="Digite o nome interno do item (ex: T8_BAG@3)">
          <form className="form inline" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="T8_CAPE@2, T6_BAG..."
              {...register('item_name')}
              disabled={createMutation.isPending}
              autoFocus
            />
            <button className="primary-button" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
          {createMutation.error && (
            <p className="form-error">
              {(createMutation.error as any)?.message || 'Erro ao adicionar'}
            </p>
          )}
        </Card>
      </section>

      <section className="dashboard-grid two-columns">
        <Card title="Itens cadastrados" description="Clique em Remover para excluir.">
          {itemsQuery.isLoading ? (
            <p className="muted">Carregando...</p>
          ) : trackedItems.length > 0 ? (
            <ul className="item-list">
              {trackedItems.map((item) => (
                <li key={item.id} className="item-row">
                  <div>
                    <strong>{item.item_name}</strong>
                    <span className="muted">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : ''}
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
              Nenhum item adicionado ainda.<br />
              Comece adicionando um acima!
            </div>
          )}
        </Card>

        {/* TABELA COM ÍCONES + QUALIDADE COLORIDA */}
        <Card title="Preços em tempo real" description="Atualiza automaticamente a cada 5 minutos">
          {myPricesQuery.isLoading ? (
            <p className="muted">Buscando preços nas cidades...</p>
          ) : myPrices.length > 0 ? (
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
                  {myPrices
                    .sort((a: any, b: any) => a.price - b.price)
                    .map((item: any) => (
                      <tr key={item.item_name}>
                        {/* ITEM COM ÍCONE OFICIAL */}
                        <td className="item-with-image">
                          <img
                            src={getItemImageUrl(item.item_name)}
                            alt={item.item_name}
                            className="item-icon"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = 'https://render.albiononline.com/v1/item/T1_BAG.png';
                            }}
                          />
                          <strong>{item.item_name}</strong>
                        </td>

                        <td><span className="pill">{item.city || '—'}</span></td>
                        <td>{item.price?.toLocaleString('pt-BR') || '—'} silver</td>

                        {/* QUALIDADE COLORIDA */}
                        <td style={{ 
                          color: getQualityColor(item.quality),
                          fontWeight: 700,
                          textShadow: item.quality === 5 ? '0 0 10px #FF9800' : 'none'
                        }}>
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