import { useState, useMemo } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PhiboCampanha } from '../integrations/supabase/types';

export interface CampanhaAnalitica extends PhiboCampanha {
  faturamentoRealizado: number;
  percentualAtingido: number;
  status: 'em_andamento' | 'concluida_sucesso' | 'concluida_abaixo' | 'programada';
  diasRestantes: number;
}

const mockCampanhasIniciais: CampanhaAnalitica[] = [
  {
    id: 'camp-1',
    cliente_id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
    nome: 'Lançamento Coleção Fitness Verão',
    data_inicio: '2026-10-01',
    data_fim: '2026-10-15',
    meta_valor: 60000.00,
    created_at: '2026-09-25T10:00:00Z',
    faturamentoRealizado: 68450.00,
    percentualAtingido: 114.1,
    status: 'concluida_sucesso',
    diasRestantes: 0,
  },
  {
    id: 'camp-2',
    cliente_id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
    nome: 'Semana do Bem-Estar & Cross',
    data_inicio: '2026-10-16',
    data_fim: '2026-10-25',
    meta_valor: 45000.00,
    created_at: '2026-10-10T10:00:00Z',
    faturamentoRealizado: 34120.00,
    percentualAtingido: 75.8,
    status: 'em_andamento',
    diasRestantes: 5,
  },
  {
    id: 'camp-3',
    cliente_id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
    nome: 'Black Friday Antecipada BlushFit',
    data_inicio: '2026-11-20',
    data_fim: '2026-11-30',
    meta_valor: 120000.00,
    created_at: '2026-10-15T10:00:00Z',
    faturamentoRealizado: 0.00,
    percentualAtingido: 0.0,
    status: 'programada',
    diasRestantes: 31,
  },
];

export function useCampanhas() {
  const [campanhas, setCampanhas] = useState<CampanhaAnalitica[]>(() => {
    const saved = localStorage.getItem('phibo_campanhas_local');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return mockCampanhasIniciais;
  });

  const salvarLocal = (novas: CampanhaAnalitica[]) => {
    setCampanhas(novas);
    localStorage.setItem('phibo_campanhas_local', JSON.stringify(novas));
  };

  const criarCampanha = async (nome: string, dataInicio: string, dataFim: string, metaValor: number) => {
    const hoje = new Date().toISOString().split('T')[0];
    let status: 'em_andamento' | 'concluida_sucesso' | 'concluida_abaixo' | 'programada' = 'programada';
    
    if (hoje >= dataInicio && hoje <= dataFim) {
      status = 'em_andamento';
    } else if (hoje > dataFim) {
      status = 'concluida_abaixo';
    }

    const nova: CampanhaAnalitica = {
      id: `camp-${Date.now()}`,
      cliente_id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
      nome,
      data_inicio: dataInicio,
      data_fim: dataFim,
      meta_valor: metaValor,
      created_at: new Date().toISOString(),
      faturamentoRealizado: 0.00,
      percentualAtingido: 0.0,
      status,
      diasRestantes: Math.max(0, Math.ceil((new Date(dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
    };

    // Tenta persistir no Supabase se configurado
    try {
      await supabase.from('phibo_campanhas').insert({
        nome: nova.nome,
        data_inicio: nova.data_inicio,
        data_fim: nova.data_fim,
        meta_valor: nova.meta_valor,
        cliente_id: nova.cliente_id,
      });
    } catch (e) {
      console.warn('Persistindo campanha localmente (modo demo ativo):', e);
    }

    salvarLocal([nova, ...campanhas]);
  };

  const excluirCampanha = async (id: string) => {
    try {
      await supabase.from('phibo_campanhas').delete().eq('id', id);
    } catch (e) {
      // ignore
    }
    salvarLocal(campanhas.filter((c) => c.id !== id));
  };

  const metricasGerais = useMemo(() => {
    const totalCampanhas = campanhas.length;
    const ativas = campanhas.filter((c) => c.status === 'em_andamento').length;
    const faturamentoTotalCampanhas = campanhas.reduce((acc, c) => acc + c.faturamentoRealizado, 0);
    const metaTotalCampanhas = campanhas.reduce((acc, c) => acc + c.meta_valor, 0);
    const percentualGeral = metaTotalCampanhas > 0 ? (faturamentoTotalCampanhas / metaTotalCampanhas) * 100 : 0;

    return {
      totalCampanhas,
      ativas,
      faturamentoTotalCampanhas,
      percentualGeral,
    };
  }, [campanhas]);

  return {
    campanhas,
    metricasGerais,
    criarCampanha,
    excluirCampanha,
  };
}
