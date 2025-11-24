import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import '../components/common/common.css';
import { createItem, listItems } from '../api/items';
import { fetchMyItemsPrices } from '../api/albion';
import type { ItemPayload } from '../api/types';

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
  });

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['my-items-prices'] });
      reset();
    },
  });

  const onSubmit = (payload: ItemPayload) => {
    if (!payload.item_name) return;
    createMutation.mutate(payload);
  };

  const trackedItems = itemsQuery.data ?? [];
  const myPrices = myPricesQuery.data ?? [];

  return (
    <div className="dashboard">
      <section className="dashboard-grid">
        <Card
          title="Resumo rápido"
          description="Indicadores dos itens monitorados e preços mais competitivos."
        >
          <div className="stat-grid">
            <div className="stat-card">
              <span>Itens rastreados</span>
              <strong>{trackedItems.length}</strong>
            </div>
            <div className="stat-card">
              <span>Itens com preço</span>
              <strong>{myPrices.length}</strong>
            </div>
            <div className="stat-card">
              <span>Menor preço atual</span>
              <strong>
                {myPrices.length
                  ? `${myPrices[0].cheapest_price.toLocaleString('pt-BR')} SILVER`
                  : '—'}
              </strong>
            </div>
          </div>
        </Card>

        <Card
          title="Adicionar item"
          description="Inclua itens que gostaria de monitorar diretamente da API."
        >
          <form className="form inline" onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="EX: T5_BAG, T8_CAPE@3"
              {...register('item_name')}
              disabled={createMutation.isPending}
            />
            <button className="primary-button" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adicionando...' : 'Adicionar'}
            </button>
          </form>
          {createMutation.error && (
            <p className="form-error">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Erro ao adicionar item'}
            </p>
          )}
        </Card>
      </section>

      <section className="dashboard-grid two-columns">
        <Card title="Itens cadastrados" description="Gerencie a lista que será utilizada nas buscas.">
          {itemsQuery.isLoading ? (
            <p className="muted">Carregando itens...</p>
          ) : trackedItems.length ? (
            <ul className="item-list">
              {trackedItems.map((item) => (
                <li key={item.id}>
                  <span>{item.item_name}</span>
                  <span className="muted">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              Nenhum item ainda. Adicione o primeiro para começar o monitoramento.
            </div>
          )}
        </Card>

        <Card title="Preços dos meus itens" description="Comparativo nas cidades monitoradas.">
          {myPricesQuery.isLoading ? (
            <p className="muted">Buscando preços...</p>
          ) : myPrices.length ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Cidade</th>
                    <th>Melhor preço</th>
                    <th>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {myPrices.map((price) => (
                    <tr key={price.item_name}>
                      <td>{price.item_name}</td>
                      <td>
                        <span className="pill">{price.cheapest_city}</span>
                      </td>
                      <td>{price.cheapest_price.toLocaleString('pt-BR')} silver</td>
                      <td>
                        {price.last_update
                          ? new Date(price.last_update).toLocaleString('pt-BR')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">Sincronize seus itens para visualizar os preços aqui.</div>
          )}
        </Card>
      </section>
    </div>
  );
}

