import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { BarChart3, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { CampanhaAnalitica } from '../../hooks/useCampanhas';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface CampanhasChartProps {
  campanhas: CampanhaAnalitica[];
}

export const CampanhasChart: React.FC<CampanhasChartProps> = ({ campanhas }) => {
  const [metricMode, setMetricMode] = useState<'financial' | 'percent'>('financial');

  // Identifica a melhor campanha em faturamento e em atingimento
  const { bestByRevenue, bestByPercent, chartData } = useMemo(() => {
    if (!campanhas || campanhas.length === 0) {
      return { bestByRevenue: null, bestByPercent: null, chartData: [] };
    }

    const sortedByRevenue = [...campanhas].sort((a, b) => b.faturamentoRealizado - a.faturamentoRealizado);
    const sortedByPercent = [...campanhas].sort((a, b) => b.percentualAtingido - a.percentualAtingido);

    const formatted = campanhas.map((c) => {
      // Abrevia o nome para o eixo X se for muito longo
      const shortName = c.nome.length > 22 ? `${c.nome.slice(0, 20)}...` : c.nome;

      return {
        id: c.id,
        fullName: c.nome,
        name: shortName,
        meta: c.meta_valor,
        realizado: c.faturamentoRealizado,
        percentual: Number(c.percentualAtingido.toFixed(1)),
        bateuMeta: c.percentualAtingido >= 100,
        status: c.status,
        dataInicio: c.data_inicio.split('-').reverse().join('/'),
        dataFim: c.data_fim.split('-').reverse().join('/'),
      };
    });

    return {
      bestByRevenue: sortedByRevenue[0]?.faturamentoRealizado > 0 ? sortedByRevenue[0] : null,
      bestByPercent: sortedByPercent[0]?.percentualAtingido > 0 ? sortedByPercent[0] : null,
      chartData: formatted,
    };
  }, [campanhas]);

  if (!campanhas || campanhas.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5 animate-fade-in">
      {/* Cabeçalho do Gráfico e Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            Desempenho Comparativo das Campanhas
          </h3>
          <p className="text-xs text-muted-foreground">
            Avalie qual ação promocional gerou maior receita e superou as metas estabelecidas
          </p>
        </div>

        {/* Badges de Destaque & Seletor de Métrica */}
        <div className="flex flex-wrap items-center gap-2.5">
          {bestByPercent && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-emerald-500" />
              <span>Maior Atingimento: {bestByPercent.nome.slice(0, 15)}... ({bestByPercent.percentualAtingido.toFixed(1)}%)</span>
            </div>
          )}

          {/* Seletor Financeiro vs % Atingimento */}
          <div className="inline-flex items-center bg-secondary p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setMetricMode('financial')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metricMode === 'financial'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Faturamento vs Meta (R$)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('percent')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                metricMode === 'percent'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              % Atingimento
            </button>
          </div>
        </div>
      </div>

      {/* Destaques Rápidos em Cards Informativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {bestByRevenue && (
          <div className="p-3.5 rounded-xl border border-border bg-secondary/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                Líder em Faturamento
              </span>
              <h4 className="text-xs font-bold text-foreground truncate max-w-xs" title={bestByRevenue.nome}>
                {bestByRevenue.nome}
              </h4>
            </div>
            <strong className="text-sm font-black text-rose-500">
              {formatCurrency(bestByRevenue.faturamentoRealizado)}
            </strong>
          </div>
        )}

        {bestByPercent && (
          <div className="p-3.5 rounded-xl border border-border bg-secondary/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Maior Eficiência de Meta
              </span>
              <h4 className="text-xs font-bold text-foreground truncate max-w-xs" title={bestByPercent.nome}>
                {bestByPercent.nome}
              </h4>
            </div>
            <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {bestByPercent.percentualAtingido.toFixed(1).replace('.', ',')}% da Meta
            </strong>
          </div>
        )}
      </div>

      {/* Área do Gráfico */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'financial' ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3.5 shadow-xl text-xs space-y-2 min-w-52">
                        <div className="border-b border-border pb-1.5">
                          <p className="font-bold text-foreground text-sm leading-tight">{item.fullName}</p>
                          <span className="text-[11px] text-muted-foreground">
                            {item.dataInicio} até {item.dataFim}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                              Faturado:
                            </span>
                            <strong className="text-rose-500 font-bold">{formatCurrency(item.realizado)}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 inline-block" />
                              Meta Planejada:
                            </span>
                            <strong className="text-foreground">{formatCurrency(item.meta)}</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                            <span className="text-muted-foreground">Atingimento:</span>
                            <span
                              className={`font-black ${
                                item.bateuMeta ? 'text-emerald-500' : 'text-amber-500'
                              }`}
                            >
                              {formatPercent(item.percentual)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                formatter={(val) => (
                  <span className="text-xs font-medium text-muted-foreground">
                    {val === 'realizado' ? 'Faturamento Realizado' : 'Meta Planejada'}
                  </span>
                )}
              />
              <Bar
                dataKey="meta"
                name="meta"
                fill="hsl(var(--muted-foreground) / 0.35)"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
              <Bar
                dataKey="realizado"
                name="realizado"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.bateuMeta ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-10}
                textAnchor="end"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <ReferenceLine
                y={100}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'Meta 100%',
                  fill: '#10b981',
                  position: 'top',
                  fontSize: 10,
                  fontWeight: 'bold',
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1.5 min-w-44">
                        <p className="font-bold text-foreground text-sm leading-tight">{item.fullName}</p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Atingimento:</span>
                          <strong
                            className={`font-black text-sm ${
                              item.bateuMeta ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {formatPercent(item.percentual)}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
                          <span>Faturado: {formatCurrency(item.realizado)}</span>
                          <span>Meta: {formatCurrency(item.meta)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="percentual"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-pct-${entry.id}`}
                    fill={
                      entry.percentual >= 100
                        ? '#10b981'
                        : entry.percentual >= 70
                        ? '#f59e0b'
                        : '#f43f5e'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

