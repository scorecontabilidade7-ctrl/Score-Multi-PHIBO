import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import { KPICards } from '../components/dashboard/KPICards';
import { SalesTimeline } from '../components/dashboard/SalesTimeline';
import { SalesPodium, SalesRankingTable } from '../components/dashboard/SalesRanking';
import { DeptosClientesCard } from '../components/dashboard/DeptosClientesCard';

export const Dashboard: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('todos');
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Loja Piloto BlushFit
  const clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e';
  
  // Intervalo do mês selecionado com último dia dinâmico e válido
  const [yearStr, monthStr] = selectedMonth.split('-');
  const lastDay = new Date(Number(yearStr), Number(monthStr), 0).getDate();
  const startDate = `${selectedMonth}-01`;
  const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === '2026-10';
  const diasDecorridos = isCurrentMonth ? 20 : lastDay;

  const { data, isLoading } = useDashboardData({
    clienteId,
    startDate,
    endDate,
    monthKey: selectedMonth,
    canal: selectedChannel,
    vendedor: selectedSellers,
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Filtros Operacionais */}
      <DashboardFilters
        currentMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        selectedSellers={selectedSellers}
        onSellersChange={setSelectedSellers}
        dashboardData={data}
      />

      {isLoading || !data ? (
        <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
          Carregando inteligência comercial...
        </div>
      ) : (
        <>
          {/* Cards de KPIs Principais */}
          <KPICards kpis={data.kpis} diasDecorridos={diasDecorridos} diasUteisTotais={26} />

          {/* Grid Intermediário: Pódio das Vendedoras + Painel Deptos & Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 h-full flex flex-col">
              <SalesPodium ranking={data.ranking_vendedores} storePA={data.kpis.pa_loja} />
            </div>
            <div className="lg:col-span-5 h-full flex flex-col">
              <DeptosClientesCard
                clientes={data.clientes || []}
                clientesCashback={data.clientes_cashback || []}
                faturamentoTotal={data.kpis.faturamento_total}
              />
            </div>
          </div>

          {/* Gráfico de Evolução Diária de Vendas (Largura Total para Máxima Visibilidade) */}
          <div className="w-full">
            <SalesTimeline timeline={data.timeline} />
          </div>

          {/* Tabela Completa de Desempenho por Vendedora */}
          <div className="w-full">
            <SalesRankingTable ranking={data.ranking_vendedores} storePA={data.kpis.pa_loja} />
          </div>
        </>
      )}
    </div>
  );
};

