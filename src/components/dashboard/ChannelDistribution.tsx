import React from 'react';
import { OrigemVendaEntry } from '../../integrations/supabase/types';
import { formatCurrency, formatNumber, formatPercent } from '../../lib/utils';
import { Store, MessageSquare, Globe, Instagram, Layers } from 'lucide-react';

interface ChannelDistributionProps {
  origens: OrigemVendaEntry[];
}

export const ChannelDistribution: React.FC<ChannelDistributionProps> = ({ origens }) => {
  if (!origens || origens.length === 0) {
    return null;
  }

  const getChannelIcon = (origem: string) => {
    const lower = origem.toLowerCase();
    if (lower.includes('física') || lower.includes('loja')) {
      return <Store className="w-4 h-4 text-rose-500" />;
    }
    if (lower.includes('whats') || lower.includes('direta')) {
      return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    }
    if (lower.includes('commerce') || lower.includes('site')) {
      return <Globe className="w-4 h-4 text-blue-500" />;
    }
    if (lower.includes('insta')) {
      return <Instagram className="w-4 h-4 text-pink-500" />;
    }
    return <Layers className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-500" />
          Faturamento por Canal de Venda
        </h3>
        <p className="text-xs text-muted-foreground">Origem das receitas captadas pelo ERP PHIBO</p>
      </div>

      <div className="space-y-3.5 pt-2">
        {origens.map((canal) => (
          <div key={canal.origem} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                {getChannelIcon(canal.origem)}
                <span>{canal.origem}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{formatNumber(canal.qtd_vendas)} vendas</span>
                <span className="font-bold text-foreground">{formatCurrency(canal.faturamento)}</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 min-w-10 text-right">
                  {formatPercent(canal.percentual)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(canal.percentual, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
