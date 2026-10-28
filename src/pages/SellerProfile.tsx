import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Users,
  Coins,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSellerData } from '../hooks/useSellerData';
import { formatCurrency, formatNumber, formatPercent } from '../lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SellerProfile: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Governança RBAC: Se o usuário logado for vendedora, ela só pode ver seu próprio perfil
  const isSellerRole = profile?.role === 'seller';
  const effectiveSellerName = (isSellerRole && profile?.nome_vendedor)
    ? profile.nome_vendedor
    : (name ? decodeURIComponent(name) : 'Juliana');

  // Bloqueio de espionagem / adulteração de URL entre vendedoras
  if (isSellerRole && profile?.nome_vendedor && name && decodeURIComponent(name).toLowerCase() !== profile.nome_vendedor.toLowerCase()) {
    return <Navigate to={`/vendedor/${encodeURIComponent(profile.nome_vendedor)}`} replace />;
  }

  const { data, isLoading } = useSellerData(effectiveSellerName, selectedMonth);

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          {!isSellerRole ? (
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-rose-500" />
              <span>Voltar ao Dashboard Geral</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground shadow-2xs">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Painel Individual de Vendas</span>
            </div>
          )}
        </div>
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          Carregando indicadores individuais da vendedora...
        </div>
      </div>
    );
  }

  const diffPA = data.paIndividual - data.paLoja;
  const isAboveStorePA = diffPA >= 0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Top Bar com Botão Voltar (apenas gestores) ou Badge de Perfil (vendedora) & Seletor de Período */}
      <div className="flex items-center justify-between gap-3">
        {!isSellerRole ? (
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Voltar ao Dashboard Geral</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground shadow-2xs">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Painel Individual de Vendas</span>
          </div>
        )}

        {/* Seletor de Mês Dinâmico */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none text-xs font-bold bg-secondary text-foreground pl-8 pr-8 py-1.5 rounded-lg border border-border focus:outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-2xs"
          >
            <option value="2026-10">Outubro / 2026 (Dados Reais PHIBO)</option>
            <option value="2026-09">Setembro / 2026 (Dados Reais PHIBO)</option>
            <option value="2026-08">Agosto / 2026 (Simulado)</option>
            <option value="2026-07">Julho / 2026 (Simulado)</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Banner de Identificação da Vendedora */}
      <div className="p-6 rounded-2xl border border-border bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative shrink-0">
            {data.url_foto ? (
              <img
                src={data.url_foto}
                alt={data.vendedor}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-500/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-2xl ring-4 ring-rose-500/30">
                {data.vendedor.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-white shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{data.vendedor}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                {data.rankingPos}º Lugar no Ranking
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                BlushFit (Piloto)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Inteligência individual, metas meritocráticas e diagnóstico para reuniões 1:1
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nível Conquistado: {data.metaIndividual.nivelAlcancado} ({data.metaIndividual.percentualComissao.toFixed(1).replace('.', ',')}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de KPIs da Vendedora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Faturamento */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase">Faturamento Pessoal</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{formatCurrency(data.faturamento)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Projeção: <strong className="text-foreground">{formatCurrency(data.projecaoFechamento)}</strong>
            </p>
          </div>
        </div>

        {/* Comissão Acumulada */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase">Comissão Estimada</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.metaIndividual.comissaoValor)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Alíquota atual: <strong className="text-foreground">{data.metaIndividual.percentualComissao.toFixed(1).replace('.', ',')}%</strong>
            </p>
          </div>
        </div>

        {/* P.A Individual */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase">P.A Individual</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {data.paIndividual.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">peças</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Loja: {data.paLoja.toFixed(2)}</span>
              {isAboveStorePA ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  (+{diffPA.toFixed(2)})
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ({diffPA.toFixed(2)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase">Ticket Médio</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{formatCurrency(data.ticketMedio)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de <strong className="text-foreground">{formatNumber(data.totalAtendimentos)}</strong> atendimentos
            </p>
          </div>
        </div>

        {/* Peças Totais */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase">Peças Vendidas</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{formatNumber(data.totalPecas)} un.</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média de <strong className="text-foreground">{(data.totalPecas / 20).toFixed(1)}</strong> peças/dia
            </p>
          </div>
        </div>
      </div>

      {/* Régua da Meta Individual */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-500" />
              Meta Individual & Desbloqueio de Comissão
            </h3>
            <p className="text-xs text-muted-foreground">Progresso pessoal pelas faixas de bonificação meritocrática</p>
          </div>

          {data.metaIndividual.faltaParaProximoNivel > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Faltam <strong>{formatCurrency(data.metaIndividual.faltaParaProximoNivel)}</strong> para o nível <strong>{data.metaIndividual.proximoNivelNome}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Parabéns! Meta Máxima Master Superada!</span>
            </div>
          )}
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Vendido: <strong className="text-foreground">{formatCurrency(data.faturamento)}</strong>
            </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {formatPercent((data.faturamento / data.metaIndividual.master) * 100)} do teto Master
            </span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min((data.faturamento / data.metaIndividual.master) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* As 3 Faixas Individuais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className={`p-3 rounded-xl border text-center ${data.faturamento >= data.metaIndividual.minima ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-secondary/30'}`}>
            <span className="text-xs font-bold text-foreground block">Meta Mínima (1,0%)</span>
            <strong className="text-xs text-foreground">{formatCurrency(data.metaIndividual.minima)}</strong>
          </div>
          <div className={`p-3 rounded-xl border text-center ${data.faturamento >= data.metaIndividual.top1 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-secondary/30'}`}>
            <span className="text-xs font-bold text-foreground block">Meta Top 1 (1,5%)</span>
            <strong className="text-xs text-foreground">{formatCurrency(data.metaIndividual.top1)}</strong>
          </div>
          <div className={`p-3 rounded-xl border text-center ${data.faturamento >= data.metaIndividual.master ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-secondary/30'}`}>
            <span className="text-xs font-bold text-foreground block">Meta Master (2,5%)</span>
            <strong className="text-xs text-foreground">{formatCurrency(data.metaIndividual.master)}</strong>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos: Linha do Tempo e Dias da Semana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Evolução Diária */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              Ritmo de Vendas Diárias
            </h3>
            <p className="text-xs text-muted-foreground">Comparativo de faturamento diário vs. ritmo da meta</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as { data: string; faturamento: number };
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-foreground">Dia {item.data}</p>
                          <p className="text-rose-500 font-extrabold">{formatCurrency(item.faturamento)}</p>
                        </div>
                      );
                    }
                      return null;
                  }}
                />
                <Area type="monotone" dataKey="faturamento" stroke="#f43f5e" strokeWidth={2.5} fill="url(#sellerGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Performance por Dia da Semana */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              Performance por Dia da Semana
            </h3>
            <p className="text-xs text-muted-foreground">Volume de faturamento concentrado em cada dia</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.performanceDiasSemana} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as { dia: string; faturamento: number; vendas: number };
                      return (
                        <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-foreground">{item.dia}</p>
                          <p className="text-rose-500 font-extrabold">{formatCurrency(item.faturamento)}</p>
                          <p className="text-muted-foreground">{item.vendas} atendimentos</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="faturamento" fill="#fb7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
