/**
 * Tabela de preços com suporte a clique para detalhes - Versão shadcn UI
 */
import { useTranslation } from 'react-i18next';
import type { MyItemPrice } from '../../api/types';
import { getItemImageUrl, getItemDisplayNameWithEnchantment } from '../../utils/items';
import { getQualityLabel } from '../../constants/qualities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">{t('common.loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // O pai (PricesPage) já lida com o estado vazio
  }

  return (
    <Card className="overflow-hidden bg-card/40 border-border/60 shadow-2xl backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-border/40">
            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t('prices.table.item')}
            </TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
              {t('prices.table.city')}
            </TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
              {t('prices.table.price')}
            </TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
              {t('prices.table.quality')}
            </TableHead>
            <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
              {t('prices.table.enchantment')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => {
            const displayName =
              item.display_name ||
              getItemDisplayNameWithEnchantment(
                item.item_name,
                normalizedLocale
              );
            const qualityName = getQualityLabel(item.quality);
            const enchant = item.enchantment > 0 ? `@${item.enchantment}` : '—';

            return (
              <TableRow
                key={`${item.item_name}-${item.city}-${idx}`}
                className={`border-border/20 transition-all duration-200 group ${onItemClick ? 'cursor-pointer hover:bg-primary/5' : 'hover:bg-white/5'}`}
                onClick={() => onItemClick?.(item)}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="h-12 w-12 bg-black/40 rounded-xl border border-border/20 p-2 group-hover:scale-105 transition-transform flex items-center justify-center">
                        <img
                          src={getItemImageUrl(item.item_name)}
                          alt={item.item_name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = 'https://render.albiononline.com/v1/item/T1_BAG.png';
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black tracking-tight group-hover:text-primary transition-colors truncate">
                        {displayName}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/40 group-hover:text-muted-foreground transition-colors truncate">
                        {item.item_name}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[10px] font-black bg-background/50 border-border/40 py-0.5 px-3">
                    {item.city || '—'}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-foreground">
                      {item.price.toLocaleString(normalizedLocale)}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                      {t('dashboard.silver')}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-black border-0 px-3 uppercase tracking-tighter"
                    style={{
                      backgroundColor: item.quality === 5 ? 'hsl(var(--primary))' : 'hsla(var(--muted-foreground), 0.15)',
                      color: item.quality === 5 ? 'white' : 'inherit'
                    }}
                  >
                    {qualityName}
                  </Badge>
                </TableCell>

                <TableCell className="text-center">
                  <span className={`text-xs font-mono font-black ${item.enchantment > 0 ? 'text-primary' : 'text-muted-foreground/30'}`}>
                    {enchant}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="p-4 bg-muted/20 border-t border-border/20 flex items-center gap-2">
        <Info size={14} className="text-primary opacity-50" />
        <p className="text-[10px] font-medium text-muted-foreground/60 italic">
          Clique em uma linha para ver o histórico detalhado de preços do item (se disponível).
        </p>
      </div>
    </Card>
  );
}