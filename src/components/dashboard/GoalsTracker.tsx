import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { PhiboMetasMensais } from '../../integrations/supabase/types';
import { useAdminConfig } from '../../hooks/useAdminConfig';

interface GoalsTrackerProps {
  currentSales: number;
  metasConfig?: PhiboMetasMensais;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({ currentSales, metasConfig }) => {
  const { metas: configMetas } = useAdminConfig();
  const activeConfig = metasConfig || configMetas;

  // Carrega as 3 metas reais cadastradas na loja
  const metas = [
    {
      nome: 'Mínima',
      valor: Number(activeConfig.meta_minima) || 120000,
      comissao: Number(activeConfig.perc_minima) || 1.0,
    },
    {
      nome: 'Top 1',
      valor: Number(activeConfig.meta_top1) || 140000,
      comissao: Number(activeConfig.perc_top1) || 1.5,
    },
    {
      nome: 'Master',
      valor: Number(activeConfig.meta_master) || 180000,
      comissao: Number(activeConfig.perc_master) || 2.5,
    },
  ];

  // Identifica o maior nível já batido
  const metaBatida = [...metas].reverse().find((m) => currentSales >= m.valor);
  const proximaMeta = metas.find((m) => currentSales < m.valor) || metas[metas.length - 1];

  const maxMeta = metas[metas.length - 1].valor;
  const percentTotal = Math.min((currentSales / maxMeta) * 100, 100);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            Régua de Metas & Comissões
          </h3>
          <p className="text-xs text-muted-foreground">Progresso rumo aos patamares de bonificação da loja</p>
        </div>
        {metaBatida && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Nível {metaBatida.nome} Alcançado ({metaBatida.comissao}%)</span>
          </div>
        )}
      </div>

      {/* Barra de Progresso Geral */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Atual: <strong className="text-foreground">{formatCurrency(currentSales)}</strong>
          </span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {formatPercent((currentSales / proximaMeta.valor) * 100)} da meta {proximaMeta.nome}
          </span>
        </div>
        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${percentTotal}%` }}
          />
        </div>
      </div>

      {/* Os 3 Patamares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {metas.map((meta) => {
          const atingida = currentSales >= meta.valor;
          return (
            <div
              key={meta.nome}
              className={`p-3 rounded-xl border text-center transition-all ${
                atingida
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-border bg-secondary/30'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xs font-bold text-foreground">Meta {meta.nome}</span>
                {atingida && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              </div>
              <div className="text-xs font-black text-foreground">{formatCurrency(meta.valor)}</div>
              <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
                {meta.comissao.toFixed(1).replace('.', ',')}% comissão
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
