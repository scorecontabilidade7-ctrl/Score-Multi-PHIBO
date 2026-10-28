import React from 'react';
import { TrendingUp, ShoppingBag, Award, Users, Coins, ArrowUpRight } from 'lucide-react';
import { DashboardKPIs } from '../../integrations/supabase/types';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface KPICardsProps {
  kpis: DashboardKPIs;
  diasDecorridos?: number;
  diasUteisTotais?: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  kpis,
  diasDecorridos = 20,
  diasUteisTotais = 26,
}) => {
  // Projeção linear simples baseada no ritmo dos dias decorridos
  const mediaDiaria = diasDecorridos > 0 ? kpis.faturamento_total / diasDecorridos : 0;
  const projecaoFechamento = mediaDiaria * diasUteisTotais;

  // Estimativa de comissão média ponderada (~2.0% nível Top 2)
  const estimativaComissao = kpis.faturamento_total * 0.02;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Faturamento Total */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Líquido</span>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-foreground">
            {formatCurrency(kpis.faturamento_total)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <span>Projeção:</span>
            <strong className="text-foreground">{formatCurrency(projecaoFechamento)}</strong>
          </div>
        </div>
      </div>

      {/* 2. Atendimentos (Cupons) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Atendimentos</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-foreground">
            {formatNumber(kpis.total_atendimentos)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Média de <strong className="text-foreground">{(kpis.total_atendimentos / Math.max(diasDecorridos, 1)).toFixed(1)}</strong> vendas/dia
          </div>
        </div>
      </div>

      {/* 3. Ticket Médio */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-foreground">
            {formatCurrency(kpis.ticket_medio)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Saudável (&gt; R$ 200)</span>
          </div>
        </div>
      </div>

      {/* 4. P.A (Peças por Atendimento) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">P.A Médio da Loja</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-foreground">
            {kpis.pa_loja.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">peças</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Total de <strong className="text-foreground">{formatNumber(kpis.total_pecas)}</strong> peças vendidas
          </div>
        </div>
      </div>

      {/* 5. Comissões Dinâmicas */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/30 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider">Comissão Estimada</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(estimativaComissao)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Régua meritocrática progressiva
          </div>
        </div>
      </div>
    </div>
  );
};
