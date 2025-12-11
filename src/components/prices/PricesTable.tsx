/**
 * Tabela de preços com suporte a clique para detalhes
 */

import { useTranslation } from 'react-i18next';
import type { MyItemPrice } from '../../api/types';
import { getItemImageUrl, getItemDisplayNameWithEnchantment } from '../../utils/items';
import { getQualityLabel, getQualityColor } from '../../constants/qualities';
import '../prices/PricesPage.css';

interface PricesTableProps {
  items: MyItemPrice[];
  isLoading?: boolean;
  onItemClick?: (item: MyItemPrice) => void;
  locale?: string;
}

export function PricesTable({
  items,
  isLoading = false,
  onItemClick,
  locale = 'pt-BR',
}: PricesTableProps) {
  const { t, i18n } = useTranslation();
  const normalizedLocale =
  locale === 'pt-BR' || locale === 'en-US'
    ? locale
    : i18n.language === 'pt-BR'
    ? 'pt-BR'
    : 'en-US';


  if (isLoading) {
    return (
      <div className="prices-table-loading">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 {t('prices.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="prices-content">
      <div className="prices-table">
        <table>
          <thead>
            <tr>
              <th>{t('prices.table.item')}</th>
              <th>{t('prices.table.city')}</th>
              <th>{t('prices.table.price')}</th>
              <th>{t('prices.table.quality')}</th>
              <th>{t('prices.table.enchantment')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const displayName =
                item.display_name ||
                getItemDisplayNameWithEnchantment(
                  item.item_name,
                  normalizedLocale
                );
              const quality = getQualityLabel(item.quality);
              const qualityColor = getQualityColor(item.quality);
              const enchant = item.enchantment > 0 ? `@${item.enchantment}` : '—';

              return (
                <tr
                  key={`${item.item_name}-${item.city}-${idx}`}
                  className={onItemClick ? 'clickable' : ''}
                  onClick={() => onItemClick?.(item)}
                >
                  <td className="item-with-image">
                    <img
                      src={getItemImageUrl(item.item_name)}
                      alt={item.item_name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://render.albiononline.com/v1/item/T1_BAG.png';
                      }}
                    />
                    <div className="item-info">
                      <strong>{displayName}</strong>
                      <span className="item-internal">{item.item_name}</span>
                    </div>
                  </td>

                  <td>
                    <span className="pill">{item.city || '—'}</span>
                  </td>

                  <td>
                    <strong>
                    {item.price.toLocaleString(normalizedLocale)}
                    </strong>
                    <span className="muted"> {t('dashboard.silver')}</span>
                  </td>

                  <td>
                    <span style={{ color: qualityColor, fontWeight: 700 }}>
                      {quality}
                    </span>
                  </td>

                  <td>{enchant}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}