import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TimelineEntry } from '../../integrations/supabase/types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { TrendingUp, Flame } from 'lucide-react';

interface SalesTimelineProps {
  timeline: TimelineEntry[];
}

export const SalesTimeline: React.FC<SalesTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border border-border rounded-2xl bg-card">
        Nenhum registro de venda encontrado no período.
      </div>
    );
  }

  // Identifica o melhor dia de venda
  const bestDay = [...timeline].sort((a, b) => b.faturamento - a.faturamento)[0];
  const averageSales = timeline.reduce((acc, curr) => acc + curr.faturamento, 0) / timeline.length;

  const chartData = timeline.map((item) => ({
    ...item,
    formattedDate: item.data_venda.split('-').slice(1).reverse().join('/'), // DD/MM
  }));

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            Evolução Diária de Vendas
          </h3>
          <p className="text-xs text-muted-foreground">Ritmo de faturamento diário faturado no PHIBO</p>
        </div>

        {/* Badges de destaque */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border">
            <span>Média/dia:</span>
            <strong className="text-foreground">{formatCurrency(averageSales)}</strong>
          </div>
          {bestDay && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>Recorde: <strong>{formatCurrency(bestDay.faturamento)}</strong> ({bestDay.data_venda.split('-').slice(1).reverse().join('/')})</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
            <XAxis
              dataKey="formattedDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as TimelineEntry & { formattedDate: string };
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1.5">
                      <p className="font-bold text-foreground">Dia {data.formattedDate}</p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Faturamento:</span>
                        <strong className="text-rose-500">{formatCurrency(data.faturamento)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Atendimentos:</span>
                        <span className="font-semibold text-foreground">{formatNumber(data.qtd_vendas)} cupons</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">Peças Vendidas:</span>
                        <span className="font-semibold text-foreground">{formatNumber(data.qtd_pecas)} peças</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="faturamento"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#roseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
