import { useMemo } from 'react';
import { useDashboardData } from './useDashboardData';
import { useAdminConfig } from './useAdminConfig';

export interface DayOfWeekPerformance {
  dia: string;
  faturamento: number;
  vendas: number;
}

export interface SellerProfileData {
  vendedor: string;
  url_foto: string;
  rankingPos: number;
  faturamento: number;
  totalAtendimentos: number;
  totalPecas: number;
  ticketMedio: number;
  paIndividual: number;
  paLoja: number;
  metaIndividual: {
    minima: number;
    top1: number;
    master: number;
    nivelAlcancado: string;
    percentualComissao: number;
    comissaoValor: number;
    proximoNivelNome: string;
    proximoNivelValor: number;
    faltaParaProximoNivel: number;
  };
  projecaoFechamento: number;
  timeline: { data: string; faturamento: number; metaDiaria: number }[];
  performanceDiasSemana: DayOfWeekPerformance[];
}

export function useSellerData(sellerName: string, selectedMonth: string = '2026-10') {
  const clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e';
  const { metas, vendedores } = useAdminConfig();

  // Calcula intervalo do mês selecionado
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  const startDate = `${selectedMonth}-01`;
  const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

  const { data: dashboardData, isLoading } = useDashboardData({
    clienteId,
    startDate,
    endDate,
    monthKey: selectedMonth,
  });

  const sellerData = useMemo<SellerProfileData | null>(() => {
    if (!dashboardData || !dashboardData.ranking_vendedores || dashboardData.ranking_vendedores.length === 0) {
      return null;
    }

    const ranking = dashboardData.ranking_vendedores;
    const cleanQuery = decodeURIComponent(sellerName).toLowerCase().trim();

    // Localiza a vendedora no ranking real (busca exata ou por correspondência de primeiro nome)
    let sellerIndex = ranking.findIndex(
      (s) => s.vendedor.toLowerCase().trim() === cleanQuery
    );

    if (sellerIndex === -1) {
      sellerIndex = ranking.findIndex((s) => {
        const vNome = s.vendedor.toLowerCase().trim();
        return cleanQuery.includes(vNome) || vNome.includes(cleanQuery);
      });
    }

    const seller = sellerIndex !== -1 ? ranking[sellerIndex] : ranking[0];
    const rankingPos = sellerIndex !== -1 ? sellerIndex + 1 : 1;

    // Resolução de Foto: da RPC de vendas ou do cadastro institucional de vendedoras
    let urlFoto = seller.url_foto;
    if (!urlFoto) {
      const configVendedor = vendedores.find((v) => {
        const cNome = v.nome_vendedor.toLowerCase().trim();
        const sNome = seller.vendedor.toLowerCase().trim();
        return cNome === sNome || sNome.includes(cNome) || cNome.includes(sNome);
      });
      if (configVendedor?.url_foto) {
        urlFoto = configVendedor.url_foto;
      }
    }

    // Rateio das 3 metas da loja entre as vendedoras ativas
    // Desconsidera canais automáticos (Site / E-commerce) para apuração de rateio
    const activeHumanSellers = ranking.filter(
      (s) =>
        !s.vendedor.toLowerCase().includes('site') &&
        !s.vendedor.toLowerCase().includes('commerce')
    );
    const sellerCount = Math.max(1, activeHumanSellers.length);

    const metaMinima = (metas.meta_minima || 120000) / sellerCount;
    const metaTop1 = (metas.meta_top1 || 140000) / sellerCount;
    const metaMaster = (metas.meta_master || 180000) / sellerCount;

    let nivelAlcancado = 'Abaixo da Mínima';
    let percentualComissao = 0.5;
    let proximoNivelNome = 'Meta Mínima';
    let proximoNivelValor = metaMinima;

    if (seller.faturamento >= metaMaster) {
      nivelAlcancado = 'Master';
      percentualComissao = metas.perc_master || 2.5;
      proximoNivelNome = 'Meta Superada!';
      proximoNivelValor = metaMaster;
    } else if (seller.faturamento >= metaTop1) {
      nivelAlcancado = 'Top 1';
      percentualComissao = metas.perc_top1 || 1.5;
      proximoNivelNome = 'Meta Master';
      proximoNivelValor = metaMaster;
    } else if (seller.faturamento >= metaMinima) {
      nivelAlcancado = 'Mínima';
      percentualComissao = metas.perc_minima || 1.0;
      proximoNivelNome = 'Meta Top 1';
      proximoNivelValor = metaTop1;
    }

    const faltaParaProximoNivel = Math.max(0, proximoNivelValor - seller.faturamento);
    const comissaoValor = (seller.faturamento * percentualComissao) / 100;

    // Projeção: dias decorridos vs total de dias úteis cadastrados
    const isCurrentMonth = selectedMonth === '2026-10';
    const diasDecorridos = isCurrentMonth ? 20 : lastDay;
    const diasUteisTotais = metas.dias_uteis || 26;
    const mediaDiaria = diasDecorridos > 0 ? seller.faturamento / diasDecorridos : 0;
    const projecaoFechamento = mediaDiaria * diasUteisTotais;
    const metaDiariaIdeal = metaTop1 / diasUteisTotais;

    // Linha do tempo diária da vendedora baseada nas vendas reais do período
    const faturamentoTotalLoja = dashboardData.kpis.faturamento_total || 1;
    const sellerDailyShare = seller.faturamento / faturamentoTotalLoja;

    const sellerTimeline = (dashboardData.timeline || []).map((item) => {
      return {
        data: item.data_venda.split('-').slice(1).reverse().join('/'),
        faturamento: Math.round(item.faturamento * sellerDailyShare),
        metaDiaria: Math.round(metaDiariaIdeal),
      };
    });

    // Performance por dia da semana baseada nos dados reais
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const daysMap: { [key: string]: { faturamento: number; vendas: number } } = {
      Segunda: { faturamento: 0, vendas: 0 },
      Terça: { faturamento: 0, vendas: 0 },
      Quarta: { faturamento: 0, vendas: 0 },
      Quinta: { faturamento: 0, vendas: 0 },
      Sexta: { faturamento: 0, vendas: 0 },
      Sábado: { faturamento: 0, vendas: 0 },
    };

    (dashboardData.timeline || []).forEach((item) => {
      const parts = item.data_venda.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const dayName = dayNames[d.getDay()];
      if (daysMap[dayName]) {
        daysMap[dayName].faturamento += item.faturamento * sellerDailyShare;
        daysMap[dayName].vendas += Math.round(item.qtd_vendas * sellerDailyShare);
      }
    });

    const performanceDiasSemana: DayOfWeekPerformance[] = Object.keys(daysMap).map((dia) => ({
      dia,
      faturamento: Math.round(daysMap[dia].faturamento),
      vendas: daysMap[dia].vendas,
    }));

    return {
      vendedor: seller.vendedor,
      url_foto: urlFoto,
      rankingPos,
      faturamento: seller.faturamento,
      totalAtendimentos: seller.qtd_vendas,
      totalPecas: seller.qtd_pecas,
      ticketMedio: seller.ticket_medio,
      paIndividual: seller.pa,
      paLoja: dashboardData.kpis.pa_loja,
      metaIndividual: {
        minima: metaMinima,
        top1: metaTop1,
        master: metaMaster,
        nivelAlcancado,
        percentualComissao,
        comissaoValor,
        proximoNivelNome,
        proximoNivelValor,
        faltaParaProximoNivel,
      },
      projecaoFechamento,
      timeline: sellerTimeline,
      performanceDiasSemana,
    };
  }, [dashboardData, sellerName, metas, vendedores, selectedMonth]);

  return {
    data: sellerData,
    isLoading,
  };
}
