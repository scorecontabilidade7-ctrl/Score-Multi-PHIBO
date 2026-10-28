import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, ArrowRight, Sparkles } from 'lucide-react';
import { RankingVendedorEntry } from '../../integrations/supabase/types';
import { formatCurrency, formatNumber } from '../../lib/utils';

// Componente para animação fluída de contagem de números (Count-up)
const AnimatedAmount: React.FC<{ value: number }> = ({ value }) => {
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = current;
    const duration = 700;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Curva de desaceleração suave (ease-out cubic)
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(startVal + (value - startVal) * ease);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const reqId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(reqId);
  }, [value]);

  return <>{formatCurrency(current)}</>;
};

interface SalesPodiumProps {
  ranking: RankingVendedorEntry[];
  storePA: number;
}

export const SalesPodium: React.FC<SalesPodiumProps> = ({ ranking, storePA }) => {
  if (!ranking || ranking.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border border-border rounded-2xl bg-card">
        Nenhum vendedor encontrado para o período.
      </div>
    );
  }

  const top1 = ranking[0];
  const top2 = ranking[1];
  const top3 = ranking[2];

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-full space-y-4">
      {/* Cabeçalho do Pódio com Troféu Animado */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500 animate-[bounce_3s_ease-in-out_infinite]" />
            <span>Pódio das Vendedoras</span>
          </h3>
          <p className="text-xs text-muted-foreground">Classificação de faturamento da equipe no período</p>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20 whitespace-nowrap shadow-xs">
          P.A da Loja: {storePA.toFixed(2)}
        </div>
      </div>

      {/* Grid Olímpico com Elevação Animada Staggered */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 items-end flex-1">
        
        {/* 2º Lugar - Prata (Elevado com delay) */}
        {top2 && (
          <div className="order-2 sm:order-1 p-3.5 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-gradient-to-b from-slate-100/60 to-transparent dark:from-slate-800/40 text-center space-y-2 relative overflow-hidden flex flex-col justify-between h-full animate-podium-2 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-out cursor-pointer group">
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-card px-2 py-0.5 rounded-full border border-border shadow-2xs">
              <Medal className="w-3 h-3 text-slate-400 animate-medal-shine" />
              <span>2º Lugar</span>
            </div>
            
            <div className="pt-5 flex justify-center">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                {top2.url_foto ? (
                  <img
                    src={top2.url_foto}
                    alt={top2.vendedor}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-400 group-hover:ring-slate-300 shadow-md transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-400/20 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-base ring-2 ring-slate-400 group-hover:ring-slate-300 transition-all">
                    {top2.vendedor.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground truncate" title={top2.vendedor}>
                {top2.vendedor}
              </h4>
              <div className="text-base sm:text-lg font-black text-foreground mt-0.5 tracking-tight">
                <AnimatedAmount value={top2.faturamento} />
              </div>
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Ticket Médio</span>
                <strong className="text-foreground">{formatCurrency(top2.ticket_medio)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">P.A</span>
                <strong className={top2.pa >= storePA ? 'text-emerald-500' : 'text-amber-500'}>
                  {top2.pa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* 1º Lugar - Ouro Campeã (Efeito Sheen Dourado, Pulso de Aura e Coroa Flutuante) */}
        {top1 && (
          <div className="order-1 sm:order-2 p-4 sm:p-5 rounded-xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-transparent text-center space-y-2.5 relative overflow-hidden shadow-lg flex flex-col justify-between h-full animate-podium-1 animate-gold-glow hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer group">
            
            {/* Feixe de Luz / Shimmer Dourado Periódico */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/20 dark:via-amber-400/15 to-transparent animate-gold-sheen" />
            </div>

            {/* Badge de Campeã com Estrelas Pulsantes */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>1º Lugar • Campeã</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>

            <div className="pt-5 flex justify-center">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                {top1.url_foto ? (
                  <img
                    src={top1.url_foto}
                    alt={top1.vendedor}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-500 group-hover:ring-amber-400 shadow-xl transition-all"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-lg ring-4 ring-amber-500 group-hover:ring-amber-400 shadow-xl transition-all">
                    {top1.vendedor.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Coroa Flutuante no Canto do Avatar */}
                <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-white shadow-md animate-crown-float">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate" title={top1.vendedor}>
                {top1.vendedor}
              </h4>
              <div className="text-lg sm:text-xl font-black text-rose-500 mt-0.5 tracking-tight">
                <AnimatedAmount value={top1.faturamento} />
              </div>
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Ticket Médio</span>
                <strong className="text-foreground">{formatCurrency(top1.ticket_medio)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">P.A</span>
                <strong className={top1.pa >= storePA ? 'text-emerald-500' : 'text-amber-500'}>
                  {top1.pa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* 3º Lugar - Bronze (Elevado com delay suave) */}
        {top3 && (
          <div className="order-3 p-3.5 sm:p-4 rounded-xl border border-amber-700/30 bg-gradient-to-b from-amber-700/10 to-transparent text-center space-y-2 relative overflow-hidden flex flex-col justify-between h-full animate-podium-3 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-out cursor-pointer group">
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-500 bg-card px-2 py-0.5 rounded-full border border-border shadow-2xs">
              <Medal className="w-3 h-3 text-amber-700 animate-medal-shine" />
              <span>3º Lugar</span>
            </div>

            <div className="pt-5 flex justify-center">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                {top3.url_foto ? (
                  <img
                    src={top3.url_foto}
                    alt={top3.vendedor}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-700 group-hover:ring-amber-600 shadow-md transition-all"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-base ring-2 ring-amber-700 group-hover:ring-amber-600 transition-all">
                    {top3.vendedor.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs sm:text-sm text-foreground truncate" title={top3.vendedor}>
                {top3.vendedor}
              </h4>
              <div className="text-base sm:text-lg font-black text-foreground mt-0.5 tracking-tight">
                <AnimatedAmount value={top3.faturamento} />
              </div>
            </div>

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-1 text-[11px]">
              <div>
                <span className="text-muted-foreground block text-[10px]">Ticket Médio</span>
                <strong className="text-foreground">{formatCurrency(top3.ticket_medio)}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">P.A</span>
                <strong className={top3.pa >= storePA ? 'text-emerald-500' : 'text-amber-500'}>
                  {top3.pa.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SalesRankingTableProps {
  ranking: RankingVendedorEntry[];
  storePA: number;
}

export const SalesRankingTable: React.FC<SalesRankingTableProps> = ({ ranking, storePA }) => {
  const navigate = useNavigate();

  if (!ranking || ranking.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
      <h3 className="text-base font-bold tracking-tight">Desempenho Geral por Vendedora</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3">Posição</th>
              <th className="py-2.5 px-3">Vendedora</th>
              <th className="py-2.5 px-3">Faturamento</th>
              <th className="py-2.5 px-3">Atendimentos</th>
              <th className="py-2.5 px-3">Peças</th>
              <th className="py-2.5 px-3">Ticket Médio</th>
              <th className="py-2.5 px-3">P.A</th>
              <th className="py-2.5 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ranking.map((seller, index) => {
              const diffPA = seller.pa - storePA;
              const isAboveStore = diffPA >= 0;

              return (
                <tr 
                  key={seller.vendedor} 
                  className="hover:bg-secondary/40 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/vendedor/${encodeURIComponent(seller.vendedor)}`)}
                >
                  <td className="py-3 px-3 font-bold text-foreground">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-transform group-hover:scale-110 ${
                      index === 0
                        ? 'bg-amber-500 text-white shadow-xs'
                        : index === 1
                        ? 'bg-slate-400 text-white'
                        : index === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-secondary text-foreground'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2.5">
                    {seller.url_foto ? (
                      <img src={seller.url_foto} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border group-hover:ring-primary transition-all" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
                        {seller.vendedor.slice(0, 1)}
                      </div>
                    )}
                    <span className="group-hover:text-primary transition-colors">{seller.vendedor}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">{formatCurrency(seller.faturamento)}</td>
                  <td className="py-3 px-3 text-muted-foreground">{formatNumber(seller.qtd_vendas)} cupons</td>
                  <td className="py-3 px-3 text-muted-foreground">{formatNumber(seller.qtd_pecas)} un.</td>
                  <td className="py-3 px-3 font-medium text-foreground">{formatCurrency(seller.ticket_medio)}</td>
                  <td className="py-3 px-3">
                    <div className="inline-flex items-center gap-1 font-semibold">
                      <span className="text-foreground">{seller.pa.toFixed(2)}</span>
                      {isAboveStore ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded-sm">
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                          +{diffPA.toFixed(2)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-1 rounded-sm">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          {diffPA.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vendedor/${encodeURIComponent(seller.vendedor)}`);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary hover:bg-rose-500 hover:text-white transition-all cursor-pointer text-muted-foreground group-hover:bg-primary group-hover:text-white"
                      title="Ver Perfil 360º"
                    >
                      <span>Perfil</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const SalesRanking: React.FC<{ ranking: RankingVendedorEntry[]; storePA: number; showPodium?: boolean; showTable?: boolean }> = ({
  ranking,
  storePA,
  showPodium = true,
  showTable = true,
}) => {
  return (
    <div className="space-y-6">
      {showPodium && <SalesPodium ranking={ranking} storePA={storePA} />}
      {showTable && <SalesRankingTable ranking={ranking} storePA={storePA} />}
    </div>
  );
};
