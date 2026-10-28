import React, { useState } from 'react';
import { HelpCircle, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { CadastroMetaMensalCard } from './CadastroMetaMensalCard';
import { GoalsTracker } from '../dashboard/GoalsTracker';

interface AcompanhamentoSemanalMetasProps {
  initialMonth?: string;
}

export const AcompanhamentoSemanalMetas: React.FC<AcompanhamentoSemanalMetasProps> = ({
  initialMonth = '2026-10',
}) => {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedMetaType, setSelectedMetaType] = useState<'minima' | 'top1' | 'master'>('minima');
  const [comissaoType, setComissaoType] = useState<'dinamica' | 'fixa'>('dinamica');
  const [showModalCadastro, setShowModalCadastro] = useState(false);

  // Loja Piloto BlushFit
  const clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e';
  const { metas, salvarMetas } = useAdminConfig();

  // Intervalo do mês selecionado
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  const startDate = `${selectedMonth}-01`;
  const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

  const { data, isLoading } = useDashboardData({
    clienteId,
    startDate,
    endDate,
    monthKey: selectedMonth,
  });

  // Metas da loja configuradas (Mínima, Top 1 e Master)
  const metaMinimaValor = metas.meta_minima || 120000;
  const metaTop1Valor = metas.meta_top1 || 140000;
  const metaMasterValor = metas.meta_master || 180000;

  const currentMetaValor =
    selectedMetaType === 'minima'
      ? metaMinimaValor
      : selectedMetaType === 'top1'
      ? metaTop1Valor
      : metaMasterValor;

  const currentMetaNome =
    selectedMetaType === 'minima'
      ? 'Meta Mínima'
      : selectedMetaType === 'top1'
      ? 'Meta Top 1'
      : 'Meta Master';

  const diasUteisTotais = metas.dias_uteis || 26;
  const dailyTarget = currentMetaValor / diasUteisTotais;

  // Mapeamento dos dias do mês em semanas comerciais
  const timeline = data?.timeline || [];
  const salesMap = new Map<string, number>();
  timeline.forEach((t) => {
    salesMap.set(t.data_venda, t.faturamento);
  });

  // Nomes abreviados dos dias da semana em pt-BR
  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Gera a lista de semanas comerciais (Seg a Sáb)
  interface DayInfo {
    dateStr: string;
    dayNum: number;
    monthNum: number;
    weekDayName: string;
    isSunday: boolean;
    faturamento: number;
    metaDiaria: number;
    atingiu: boolean;
    temVenda: boolean;
  }

  interface WeekInfo {
    weekNumber: number;
    label: string;
    days: DayInfo[];
    metaSemanal: number;
    realizadoSemanal: number;
    diferenca: number;
    percentual: number;
    superada: boolean;
  }

  const weeks: WeekInfo[] = [];
  let currentWeekDays: DayInfo[] = [];
  let currentWeekIndex = 1;

  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Dom, 6 = Sáb
    const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
    const faturamento = salesMap.get(dateStr) || 0;
    const isSunday = dayOfWeek === 0;

    // Apenas dias úteis comerciais (Seg a Sáb) ou dias com faturamento
    if (!isSunday || faturamento > 0) {
      const atingiu = faturamento >= dailyTarget;
      currentWeekDays.push({
        dateStr,
        dayNum: d,
        monthNum: month,
        weekDayName: weekDayNames[dayOfWeek],
        isSunday,
        faturamento,
        metaDiaria: dailyTarget,
        atingiu,
        temVenda: salesMap.has(dateStr),
      });
    }

    // Fecha a semana aos sábados ou no último dia do mês
    if (dayOfWeek === 6 || d === lastDay) {
      if (currentWeekDays.length > 0) {
        const realizadoSemanal = currentWeekDays.reduce((acc, curr) => acc + curr.faturamento, 0);
        const diasUteisSemana = currentWeekDays.filter((dia) => !dia.isSunday).length || currentWeekDays.length;
        
        let metaSemanal = diasUteisSemana * dailyTarget;

        // Se a distribuição for por semana (%)
        if (metas.distribution_mode === 'week' && metas.distribution_config?.weeklyWeights) {
          const wIdx = currentWeekIndex - 1;
          const weight = metas.distribution_config.weeklyWeights[wIdx];
          if (typeof weight === 'number' && !isNaN(weight) && weight > 0) {
            metaSemanal = currentMetaValor * (weight / 100);
          }
        }

        // Se a distribuição for por dia (Seg a Sáb %)
        if (metas.distribution_mode === 'day' && metas.distribution_config?.dailyWeights) {
          let somaMetaDias = 0;
          currentWeekDays.forEach((dia) => {
            const pesoDia = metas.distribution_config?.dailyWeights?.[dia.weekDayName] || 16.66;
            const metaD = (currentMetaValor * (pesoDia / 100)) / (diasUteisTotais / 6);
            dia.metaDiaria = metaD;
            dia.atingiu = dia.faturamento >= metaD;
            somaMetaDias += metaD;
          });
          metaSemanal = somaMetaDias;
        } else {
          // Ajusta a meta diária de cada dia na semana
          const metaDiariaSemana = diasUteisSemana > 0 ? metaSemanal / diasUteisSemana : dailyTarget;
          currentWeekDays.forEach((dia) => {
            if (!dia.isSunday) {
              dia.metaDiaria = metaDiariaSemana;
              dia.atingiu = dia.faturamento >= metaDiariaSemana;
            }
          });
        }

        const diferenca = realizadoSemanal - metaSemanal;
        const percentual = metaSemanal > 0 ? (realizadoSemanal / metaSemanal) * 100 : 0;
        const superada = realizadoSemanal >= metaSemanal && metaSemanal > 0;

        weeks.push({
          weekNumber: currentWeekIndex,
          label: `Semana ${currentWeekIndex}`,
          days: [...currentWeekDays],
          metaSemanal,
          realizadoSemanal,
          diferenca,
          percentual,
          superada,
        });

        currentWeekIndex++;
        currentWeekDays = [];
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Régua de Metas & Comissões da Loja */}
      <GoalsTracker
        currentSales={data?.kpis?.faturamento_total || 0}
        metasConfig={metas}
      />

      {/* Barra de Controles Superiores (Tipo de Meta & Tipo de Comissão) */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Tipo de Meta */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
            Tipo de Meta
          </label>
          <div className="inline-flex items-center bg-slate-900/80 dark:bg-slate-950/90 p-1 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => setSelectedMetaType('minima')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedMetaType === 'minima'
                  ? 'bg-[#1da1aa] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meta Mínima
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetaType('top1')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedMetaType === 'top1'
                  ? 'bg-[#1da1aa] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meta Top 1
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetaType('master')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedMetaType === 'master'
                  ? 'bg-[#1da1aa] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Meta Master
            </button>
          </div>
        </div>

        {/* Lado Direito: Seletor de Mês & Tipo de Comissão */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Seletor do Mês */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
              Mês Analisado
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-xl border border-border bg-secondary text-foreground text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="2026-10">Outubro / 2026 (Mês Atual)</option>
                <option value="2026-09">Setembro / 2026 (Fechado)</option>
                <option value="2026-08">Agosto / 2026 (Fechado)</option>
                <option value="2026-07">Julho / 2026 (Fechado)</option>
              </select>
            </div>
          </div>

          {/* Tipo de Comissão */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Tipo de Comissão
              </label>
              <span title="Comissão Dinâmica (escalonada por atingimento de meta) ou Fixa">
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </span>
            </div>
            <div className="inline-flex items-center bg-slate-900/80 dark:bg-slate-950/90 p-1 rounded-xl border border-slate-700/50">
              <button
                type="button"
                onClick={() => setComissaoType('dinamica')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  comissaoType === 'dinamica'
                    ? 'bg-[#1da1aa] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dinâmica
              </button>
              <button
                type="button"
                onClick={() => setComissaoType('fixa')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  comissaoType === 'fixa'
                    ? 'bg-[#1da1aa] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fixa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Acompanhamento Semanal</span>
          </h2>
          <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
            <span>
              Meta de referência:{' '}
              <strong className="text-teal-400 font-semibold">{currentMetaNome}</strong> ({formatCurrency(currentMetaValor)}) • Ritmo Diário:{' '}
              <strong className="text-foreground">{formatCurrency(dailyTarget)}/dia</strong>
            </span>
            {metas.distribution_mode && metas.distribution_mode !== 'uniform' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1da1aa]/15 text-[#1da1aa] border border-[#1da1aa]/30">
                Ponderado {metas.distribution_mode === 'week' ? 'por Semana (%)' : 'por Dia (%)'}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModalCadastro(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1da1aa] hover:bg-[#188c94] text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Cadastrar Meta & Pesos</span>
        </button>
      </div>

      {/* Modal de Cadastro & Distribuição de Metas */}
      {showModalCadastro && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative max-w-xl w-full my-auto">
            <CadastroMetaMensalCard
              metas={metas}
              onSalvar={salvarMetas}
              onClose={() => setShowModalCadastro(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
          Carregando ritmo semanal de metas...
        </div>
      ) : (
        /* Lista de Semanas (Semana 1, Semana 2, Semana 3, etc.) */
        <div className="space-y-6">
          {weeks.map((week) => {
            const hasSurpassed = week.realizadoSemanal >= week.metaSemanal;
            const diffPositive = week.diferenca >= 0;

            return (
              <div
                key={week.label}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4 relative overflow-hidden"
              >
                {/* Topo do Card da Semana */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground tracking-tight">{week.label}</h3>

                  {/* Badge de Status */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs border ${
                      hasSurpassed
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : week.percentual >= 75
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <span>🎯</span>
                    <span>
                      {hasSurpassed
                        ? `Meta Superada! (${Math.min(week.percentual, 100).toFixed(0)}%)`
                        : `Em Andamento (${week.percentual.toFixed(0)}%)`}
                    </span>
                  </div>
                </div>

                {/* 3 Blocos de KPIs Principais da Semana */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Meta Semanal
                    </span>
                    <div className="text-lg font-black text-foreground">{formatCurrency(week.metaSemanal)}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Realizado
                    </span>
                    <div className="text-lg font-black text-teal-400">{formatCurrency(week.realizadoSemanal)}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Diferença
                    </span>
                    <div
                      className={`text-lg font-black flex items-center gap-1 ${
                        diffPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>
                        {diffPositive ? '+' : ''}
                        {formatCurrency(week.diferenca)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Semanal em Ciano / Teal */}
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1da1aa] rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(week.percentual, 100)}%` }}
                  />
                </div>

                {/* Cards Diários da Semana (Dia a Dia com Borda Verde/Vermelha Inteligente) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  {week.days.map((dia) => {
                    const isBateu = dia.faturamento >= dia.metaDiaria;
                    const temVendaReal = dia.faturamento > 0;

                    return (
                      <div
                        key={dia.dateStr}
                        className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                          temVendaReal && isBateu
                            ? 'border-emerald-500/70 bg-emerald-500/5 shadow-xs'
                            : temVendaReal && !isBateu
                            ? 'border-rose-500/70 bg-rose-500/5 shadow-xs'
                            : 'border-border bg-secondary/20 opacity-60'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground">
                          {dia.weekDayName} {dia.dayNum}/{dia.monthNum}
                        </div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">
                          META: R$ {(dia.metaDiaria / 1000).toFixed(1)}K
                        </div>
                        <div
                          className={`text-xs font-black pt-0.5 ${
                            temVendaReal && isBateu
                              ? 'text-emerald-400'
                              : temVendaReal && !isBateu
                              ? 'text-rose-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {temVendaReal ? formatCurrency(dia.faturamento) : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
