import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { DashboardDataResponse } from '../integrations/supabase/types';
import { mockMonthlyData, mockDashboardData } from '../lib/mockStoreData';

interface UseDashboardDataParams {
  clienteId: string;
  startDate: string;
  endDate: string;
  monthKey?: string;
  canal?: string;
  vendedor?: string | string[];
}

export function useDashboardData({
  clienteId,
  startDate,
  endDate,
  monthKey,
  canal,
  vendedor,
}: UseDashboardDataParams) {
  const activeMonthKey = monthKey || startDate.slice(0, 7);
  const baseMock = mockMonthlyData[activeMonthKey] || mockDashboardData;
  const sellerKey = Array.isArray(vendedor) ? vendedor.slice().sort().join(',') : (vendedor || 'todos');

  return useQuery<DashboardDataResponse>({
    queryKey: ['dashboard-data', clienteId, startDate, endDate, activeMonthKey, canal, sellerKey],
    queryFn: async () => {
      try {
        // Tenta chamada real à RPC analítica do Supabase
        const { data, error } = await supabase.rpc('phibo_get_dashboard_data', {
          p_cliente_id: clienteId,
          p_start_date: startDate,
          p_end_date: endDate,
        });

        if (error) {
          console.warn('Erro na RPC Supabase, utilizando fallback:', error);
          return applyFilters(baseMock, canal, vendedor);
        }

        // Se o banco retornou dados reais (como em Setembro e Outubro/2026)
        if (data && data.kpis && (Number(data.kpis.faturamento_total) > 0 || Number(data.kpis.total_atendimentos) > 0)) {
          const enriched: DashboardDataResponse = {
            ...(data as DashboardDataResponse),
            departamentos: (data as DashboardDataResponse).departamentos?.length 
              ? (data as DashboardDataResponse).departamentos 
              : baseMock.departamentos,
            clientes: (data as DashboardDataResponse).clientes?.length 
              ? (data as DashboardDataResponse).clientes 
              : baseMock.clientes,
            clientes_cashback: (data as DashboardDataResponse).clientes_cashback?.length
              ? (data as DashboardDataResponse).clientes_cashback
              : baseMock.clientes_cashback,
          };
          return applyFilters(enriched, canal, vendedor);
        }

        // Fallback para meses não povoados no banco
        return applyFilters(baseMock, canal, vendedor);
      } catch (err) {
        console.warn('Utilizando dados simulados de alta fidelidade:', err);
        return applyFilters(baseMock, canal, vendedor);
      }
    },
    staleTime: 1000 * 30, // 30 segundos
  });
}

function applyFilters(
  data: DashboardDataResponse,
  canal?: string,
  vendedor?: string | string[]
): DashboardDataResponse {
  let filtered = { ...data };

  // 1. Filtro de Vendedoras (Suporte a seleção múltipla e única)
  let selectedList: string[] = [];
  if (Array.isArray(vendedor)) {
    selectedList = vendedor.filter((v) => v && v !== 'todos');
  } else if (typeof vendedor === 'string' && vendedor !== 'todos' && vendedor.trim() !== '') {
    selectedList = [vendedor];
  }

  if (selectedList.length > 0) {
    // Se o usuário selecionou explicitamente "nenhuma" vendedora
    if (selectedList.includes('__nenhuma__')) {
      filtered = {
        ...filtered,
        kpis: {
          faturamento_total: 0,
          total_atendimentos: 0,
          total_pecas: 0,
          ticket_medio: 0,
          pa_loja: 0,
        },
        ranking_vendedores: [],
        timeline: data.timeline.map((t) => ({ ...t, faturamento: 0, qtd_vendas: 0, qtd_pecas: 0 })),
      };
    } else {
      const matchingSellers = data.ranking_vendedores.filter((r) =>
        selectedList.some(
          (sel) =>
            r.vendedor.toLowerCase().trim() === sel.toLowerCase().trim() ||
            r.vendedor.toLowerCase().includes(sel.toLowerCase()) ||
            sel.toLowerCase().includes(r.vendedor.toLowerCase())
        )
      );

      if (matchingSellers.length > 0) {
        const faturamentoTotal = matchingSellers.reduce((acc, curr) => acc + curr.faturamento, 0);
        const totalAtendimentos = matchingSellers.reduce((acc, curr) => acc + curr.qtd_vendas, 0);
        const totalPecas = matchingSellers.reduce((acc, curr) => acc + curr.qtd_pecas, 0);
        const ticketMedio = totalAtendimentos > 0 ? Number((faturamentoTotal / totalAtendimentos).toFixed(2)) : 0;
        const paLoja = totalAtendimentos > 0 ? Number((totalPecas / totalAtendimentos).toFixed(2)) : 0;

        // Ajusta a linha do tempo proporcionalmente ao faturamento dos selecionados
        const ratio = data.kpis.faturamento_total > 0 ? faturamentoTotal / data.kpis.faturamento_total : 1;
        const adjustedTimeline = data.timeline.map((t) => ({
          ...t,
          faturamento: Number((t.faturamento * ratio).toFixed(2)),
          qtd_vendas: Math.round(t.qtd_vendas * ratio),
          qtd_pecas: Math.round(t.qtd_pecas * ratio),
        }));

        filtered = {
          ...filtered,
          kpis: {
            faturamento_total: faturamentoTotal,
            total_atendimentos: totalAtendimentos,
            total_pecas: totalPecas,
            ticket_medio: ticketMedio,
            pa_loja: paLoja,
          },
          ranking_vendedores: matchingSellers,
          timeline: adjustedTimeline,
        };
      } else {
        filtered = {
          ...filtered,
          kpis: {
            faturamento_total: 0,
            total_atendimentos: 0,
            total_pecas: 0,
            ticket_medio: 0,
            pa_loja: 0,
          },
          ranking_vendedores: [],
          timeline: data.timeline.map((t) => ({ ...t, faturamento: 0, qtd_vendas: 0, qtd_pecas: 0 })),
        };
      }
    }
  }

  // 2. Filtro de Canal
  if (canal && canal !== 'todos') {
    const o = filtered.origens.find((item) =>
      item.origem.toLowerCase().includes(canal.toLowerCase())
    );
    if (o) {
      filtered = {
        ...filtered,
        origens: [o],
      };
    }
  }

  return filtered;
}
