import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useCampanhas, CampanhaAnalitica } from '../hooks/useCampanhas';
import { formatCurrency, formatPercent } from '../lib/utils';
import { CampanhasChart } from '../components/campanhas/CampanhasChart';

export const Campanhas: React.FC = () => {
  const navigate = useNavigate();
  const { campanhas, metricasGerais, criarCampanha, excluirCampanha } = useCampanhas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('2026-10-20');
  const [dataFim, setDataFim] = useState('2026-10-31');
  const [metaValor, setMetaValor] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !dataInicio || !dataFim || !metaValor) return;

    await criarCampanha(nome, dataInicio, dataFim, parseFloat(metaValor));
    setNome('');
    setDataInicio('');
    setDataFim('');
    setMetaValor('');
    setIsModalOpen(false);
  };

  const getStatusBadge = (campanha: CampanhaAnalitica) => {
    switch (campanha.status) {
      case 'concluida_sucesso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sucesso ({campanha.percentualAtingido.toFixed(1)}%)</span>
          </span>
        );
      case 'em_andamento':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Em Andamento ({campanha.diasRestantes}d restantes)</span>
          </span>
        );
      case 'programada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5" />
            <span>Programada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground border border-border">
            <span>Encerrada</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Top Header & Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-rose-500" />
              Campanhas Promocionais Sazonais
            </h1>
            <p className="text-xs text-muted-foreground">
              Acompanhamento de metas e receita gerada por eventos comerciais pontuais da BlushFit
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ação Promocional</span>
        </button>
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total de Campanhas */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Campanhas Ativas</span>
            <div className="text-2xl font-black text-foreground mt-1">
              {metricasGerais.ativas}{' '}
              <span className="text-xs font-normal text-muted-foreground">de {metricasGerais.totalCampanhas} totais</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        {/* Faturamento em Campanhas */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Faturamento em Ações</span>
            <div className="text-2xl font-black text-rose-500 mt-1">
              {formatCurrency(metricasGerais.faturamentoTotalCampanhas)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Taxa Média de Atingimento */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Atingimento Geral</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatPercent(metricasGerais.percentualGeral)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Gráfico Comparativo de Performance das Campanhas */}
      <CampanhasChart campanhas={campanhas} />

      {/* Listagem em Cards das Campanhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campanhas.map((campanha) => {
          const percent = Math.min(campanha.percentualAtingido, 100);

          return (
            <div
              key={campanha.id}
              className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground tracking-tight leading-snug">
                    {campanha.nome}
                  </h3>
                  <button
                    onClick={() => excluirCampanha(campanha.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Excluir campanha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    {campanha.data_inicio.split('-').reverse().join('/')} até {campanha.data_fim.split('-').reverse().join('/')}
                  </span>
                </div>

                <div>{getStatusBadge(campanha)}</div>
              </div>

              {/* Números e Progresso */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Faturado:</span>
                  <div className="text-right">
                    <strong className="text-base font-black text-foreground">
                      {formatCurrency(campanha.faturamentoRealizado)}
                    </strong>
                    <span className="text-xs text-muted-foreground block">
                      Meta: {formatCurrency(campanha.meta_valor)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-muted-foreground">Atingimento</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">
                      {campanha.percentualAtingido.toFixed(1).replace('.', ',')}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        campanha.percentualAtingido >= 100
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-rose-500 to-pink-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Dialog de Criação de Campanha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">Nova Ação Promocional</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Nome da Campanha</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Lançamento Coleção Outono"
                  className="w-full text-xs bg-secondary text-foreground px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Data de Início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full text-xs bg-secondary text-foreground px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Data de Fim</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full text-xs bg-secondary text-foreground px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Meta Financeira (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={metaValor}
                  onChange={(e) => setMetaValor(e.target.value)}
                  placeholder="Ex: 50000.00"
                  className="w-full text-xs bg-secondary text-foreground px-3 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-secondary cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 cursor-pointer transition-all"
                >
                  Cadastrar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
