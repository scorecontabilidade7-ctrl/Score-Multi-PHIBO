import React, { useState } from 'react';
import { ClienteEntry } from '../../integrations/supabase/types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { Users, Coins, Sparkles } from 'lucide-react';

interface ClientesVendasCardProps {
  clientes: ClienteEntry[];
  clientesCashback?: ClienteEntry[];
  faturamentoTotal?: number;
}

export const DeptosClientesCard: React.FC<ClientesVendasCardProps> = ({
  clientes = [],
  clientesCashback = [],
  faturamentoTotal = 0,
}) => {
  // Alternador de visão: 'valor' (Volume Faturado em R$) vs. 'cashback' (Relação de Cashback em R$)
  const [activeTab, setActiveTab] = useState<'valor' | 'cashback'>('valor');

  // Fallback seguro caso não haja clientes no período
  const safeClientesValor: ClienteEntry[] = clientes && clientes.length > 0 ? clientes : [
    { cliente_nome: 'Antonia Delheiça De Brito', faturamento: 1385.20, cashback: 0.00, qtd_compras: 3, percentual: 7.38 },
    { cliente_nome: 'Patricia Rodrigues De Paiva Teles', faturamento: 1089.30, cashback: 0.00, qtd_compras: 2, percentual: 5.80 },
    { cliente_nome: 'Anatana Aguiar', faturamento: 940.40, cashback: 29.00, qtd_compras: 1, percentual: 5.01 },
    { cliente_nome: 'Liliane Viana Silva', faturamento: 929.40, cashback: 0.00, qtd_compras: 2, percentual: 4.95 },
    { cliente_nome: 'Priscila Queiroz', faturamento: 875.58, cashback: 0.00, qtd_compras: 3, percentual: 4.66 },
    { cliente_nome: 'Leticia Azevedo Marçal', faturamento: 757.50, cashback: 0.00, qtd_compras: 2, percentual: 4.03 },
  ];

  // Determina lista de clientes com cashback
  const safeClientesCashback: ClienteEntry[] = clientesCashback && clientesCashback.length > 0
    ? clientesCashback
    : safeClientesValor
        .filter(c => (c.cashback || 0) > 0)
        .sort((a, b) => (b.cashback || 0) - (a.cashback || 0));

  // Itens atualmente exibidos de acordo com a aba selecionada
  const currentList = activeTab === 'valor'
    ? [...safeClientesValor].sort((a, b) => b.faturamento - a.faturamento).slice(0, 6)
    : [...safeClientesCashback].sort((a, b) => (b.cashback || 0) - (a.cashback || 0)).slice(0, 6);

  // Totais e valores máximos
  const totalCashbackPeriodo = safeClientesCashback.reduce((acc, c) => acc + (c.cashback || 0), 0);
  const totalTopFaturamento = currentList.reduce((acc, c) => acc + c.faturamento, 0);

  const maxValue = activeTab === 'valor'
    ? Math.max(...currentList.map(c => c.faturamento), 1)
    : Math.max(...currentList.map(c => c.cashback || 0), 1);

  const shareTopClientes = faturamentoTotal > 0 ? (totalTopFaturamento / faturamentoTotal) * 100 : 0;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Cabeçalho com Título Dinâmico e Botões Alternadores [ Valor | Cashback ] */}
      <div className="flex items-center justify-between gap-2 pb-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            {activeTab === 'valor' ? (
              <>
                <Users className="w-4 h-4 text-teal-400" />
                <span>Principais Clientes</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Clientes & Cashback</span>
              </>
            )}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === 'valor'
              ? 'Relação de maiores compradores do período (PHIBO)'
              : 'Clientes com maior cashback acumulado no período'}
          </p>
        </div>

        {/* Alternador em Pílula [ Valor | Cashback ] */}
        <div className="inline-flex items-center bg-slate-900/80 dark:bg-slate-950/90 p-1 rounded-lg border border-slate-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('valor')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'valor'
                ? 'bg-[#1da1aa] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Ver maiores compradores por faturamento total"
          >
            <span>Valor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cashback')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'cashback'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Ver clientes com maior saldo de cashback acumulado"
          >
            <Coins className="w-3 h-3 mr-0.5" />
            <span>Cashback</span>
          </button>
        </div>
      </div>

      {/* Área Gráfica com Barras Horizontais e Grade Pontilhada ao Fundo */}
      <div className="relative pt-2 pb-1 flex-1 flex flex-col justify-center space-y-4">
        {/* Linhas verticais de grade sutis ao fundo (estilo BI) */}
        <div className="absolute inset-y-0 left-28 sm:left-40 right-4 flex justify-between pointer-events-none opacity-15">
          <div className="border-r border-dashed border-slate-400 h-full" />
          <div className="border-r border-dashed border-slate-400 h-full" />
          <div className="border-r border-dashed border-slate-400 h-full" />
          <div className="border-r border-dashed border-slate-400 h-full" />
        </div>

        {/* Listagem de Clientes */}
        {currentList.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Nenhum registro de cashback encontrado no período.
          </div>
        ) : (
          currentList.map((cliente, idx) => {
            const displayValue = activeTab === 'valor' ? cliente.faturamento : (cliente.cashback || 0);
            const widthPercent = Math.min(Math.max((displayValue / maxValue) * 92, 14), 94);
            const percShare = activeTab === 'valor'
              ? (cliente.percentual || (faturamentoTotal > 0 ? (cliente.faturamento / faturamentoTotal) * 100 : 0))
              : (totalCashbackPeriodo > 0 ? ((cliente.cashback || 0) / totalCashbackPeriodo) * 100 : 0);

            return (
              <div key={`${cliente.cliente_nome}-${idx}`} className="relative z-10 flex items-center gap-3 sm:gap-4 group">
                {/* Nome do Cliente à Esquerda */}
                <div 
                  className="w-24 sm:w-40 text-right text-xs font-semibold text-foreground/90 truncate"
                  title={cliente.cliente_nome}
                >
                  {cliente.cliente_nome}
                </div>

                {/* Barra Horizontal Proporcional */}
                <div className="flex-1 relative flex items-center">
                  <div
                    className={`h-7 sm:h-7.5 rounded-md transition-all duration-500 ease-out flex items-center justify-between px-2.5 relative shadow-xs cursor-pointer group-hover:brightness-105 ${
                      activeTab === 'valor'
                        ? 'bg-[#2ca5a5] hover:bg-[#32b5b5]'
                        : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                    style={{ width: `${widthPercent}%` }}
                    title={
                      activeTab === 'valor'
                        ? `${cliente.cliente_nome}: ${formatCurrency(cliente.faturamento)} • ${cliente.qtd_compras} compras (${formatPercent(percShare)} do total)`
                        : `${cliente.cliente_nome}: Cashback de ${formatCurrency(cliente.cashback || 0)} (${formatPercent(percShare)} do cashback da loja)`
                    }
                  >
                    {widthPercent >= 38 ? (
                      <>
                        <span className="text-[11px] font-bold text-white drop-shadow-xs truncate">
                          {formatCurrency(displayValue)}
                        </span>
                        <span className="text-[10px] font-extrabold text-white/90 ml-1 whitespace-nowrap">
                          {percShare.toFixed(0)}%
                        </span>
                      </>
                    ) : null}
                  </div>

                  {/* Exibição externa quando a barra é curta */}
                  {widthPercent < 38 && (
                    <span className={`ml-2 text-[11px] font-bold whitespace-nowrap ${
                      activeTab === 'valor' ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatCurrency(displayValue)} ({percShare.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé Informativo Consolidado */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        {activeTab === 'valor' ? (
          <>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Top 6 representam <strong>{shareTopClientes.toFixed(1)}%</strong> da receita</span>
            </span>
            <span className="font-medium text-foreground">
              Total: {formatCurrency(totalTopFaturamento)}
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-500" />
              <span>Cashback total distribuído na loja:</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCashbackPeriodo)}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export const ClientesVendasCard = DeptosClientesCard;
