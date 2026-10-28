import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PhiboMetasMensais, PhiboVendedorConfig, PhiboClienteConfig } from '../integrations/supabase/types';

export function useAdminConfig() {
  const clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e';

  // 1. Metas Mensais da Loja (BlushFit)
  const [metas, setMetas] = useState<PhiboMetasMensais>(() => {
    const saved = localStorage.getItem('phibo_metas_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'meta-blushfit-2026-10',
      cliente_id: clienteId,
      year_month: '2026-10',
      dias_uteis: 26,
      meta_minima: 120000.00,
      meta_top1: 140000.00,
      meta_top2: 160000.00,
      meta_master: 180000.00,
      perc_minima: 1.0,
      perc_top1: 1.5,
      perc_top2: 2.0,
      perc_master: 2.5,
      distribution_mode: 'uniform',
      created_at: new Date().toISOString(),
    };
  });

  // 2. Vendedoras e Fotos (Iniciando com as vendedoras reais do PHIBO)
  const [vendedores, setVendedores] = useState<PhiboVendedorConfig[]>(() => {
    const saved = localStorage.getItem('phibo_vendedores_config_local');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'vend-1',
        cliente_id: clienteId,
        nome_vendedor: 'Juliana',
        url_foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        peso_meta: 1.0,
        ativo: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'vend-2',
        cliente_id: clienteId,
        nome_vendedor: 'PLISSIA',
        url_foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        peso_meta: 1.0,
        ativo: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'vend-3',
        cliente_id: clienteId,
        nome_vendedor: 'Waleska',
        url_foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        peso_meta: 1.0,
        ativo: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'vend-4',
        cliente_id: clienteId,
        nome_vendedor: 'Site',
        url_foto: '',
        peso_meta: 1.0,
        ativo: true,
        created_at: new Date().toISOString(),
      },
    ];
  });

  // Carrega do Supabase se existirem registros no banco
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: vData } = await supabase
          .from('phibo_vendedores_config')
          .select('*')
          .eq('cliente_id', clienteId);

        if (vData && vData.length > 0) {
          setVendedores(vData as PhiboVendedorConfig[]);
        }

        const { data: mData } = await supabase
          .from('phibo_metas_mensais')
          .select('*')
          .eq('cliente_id', clienteId)
          .eq('year_month', '2026-10')
          .maybeSingle();

        if (mData) {
          const parsed: PhiboMetasMensais = {
            ...mData,
            meta_minima: Number(mData.meta_minima),
            meta_top1: Number(mData.meta_top1),
            meta_top2: Number(mData.meta_top2),
            meta_master: Number(mData.meta_master),
            perc_minima: Number(mData.perc_minima),
            perc_top1: Number(mData.perc_top1),
            perc_top2: Number(mData.perc_top2),
            perc_master: Number(mData.perc_master),
            dias_uteis: Number(mData.dias_uteis) || 26,
            distribution_mode: (mData.distribution_mode as any) || 'uniform',
            distribution_config: mData.distribution_config || undefined,
          };
          setMetas(parsed);
          localStorage.setItem('phibo_metas_config', JSON.stringify(parsed));
        }
      } catch (err) {
        console.warn('Carregamento inicial local:', err);
      }
    }
    loadFromSupabase();
  }, [clienteId]);

  // 3. Lojas / Clientes Cadastrados (Multi-Tenant)
  const [lojas, setLojas] = useState<PhiboClienteConfig[]>(() => {
    const saved = localStorage.getItem('phibo_lojas_local');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
        nome_loja: 'BlushFit (Loja Piloto)',
        email_login_phibo: 'contato@blushfit.com.br',
        senha_login_phibo: null,
        ativo: true,
        created_at: '2026-10-20T10:00:00Z',
        updated_at: '2026-10-20T10:00:00Z',
      },
    ];
  });

  const salvarMetas = async (novasMetas: PhiboMetasMensais) => {
    setMetas(novasMetas);
    localStorage.setItem('phibo_metas_config', JSON.stringify(novasMetas));

    try {
      await supabase.from('phibo_metas_mensais').upsert({
        cliente_id: novasMetas.cliente_id,
        year_month: novasMetas.year_month,
        dias_uteis: novasMetas.dias_uteis,
        meta_minima: novasMetas.meta_minima,
        meta_top1: novasMetas.meta_top1,
        meta_top2: novasMetas.meta_top2,
        meta_master: novasMetas.meta_master,
        perc_minima: novasMetas.perc_minima,
        perc_top1: novasMetas.perc_top1,
        perc_top2: novasMetas.perc_top2,
        perc_master: novasMetas.perc_master,
        distribution_mode: novasMetas.distribution_mode,
        distribution_config: novasMetas.distribution_config,
      }, { onConflict: 'cliente_id,year_month' });
    } catch (e) {
      console.warn('Persistência Supabase offline, salvo localmente:', e);
    }
  };

  const atualizarVendedor = async (id: string, updates: Partial<PhiboVendedorConfig>) => {
    const updated = vendedores.map((v) => (v.id === id ? { ...v, ...updates } : v));
    setVendedores(updated);
    localStorage.setItem('phibo_vendedores_config_local', JSON.stringify(updated));

    const target = updated.find((v) => v.id === id);
    if (target) {
      try {
        await supabase.from('phibo_vendedores_config').upsert({
          cliente_id: target.cliente_id,
          nome_vendedor: target.nome_vendedor,
          url_foto: target.url_foto,
          peso_meta: target.peso_meta,
          ativo: target.ativo,
        }, { onConflict: 'cliente_id,nome_vendedor' });
      } catch (e) {
        console.warn('Persistência Supabase vendedora offline:', e);
      }
    }
  };

  const cadastrarVendedor = async (nome: string, fotoUrl: string, peso: number) => {
    const novo: PhiboVendedorConfig = {
      id: `vend-${Date.now()}`,
      cliente_id: clienteId,
      nome_vendedor: nome,
      url_foto: fotoUrl || null,
      peso_meta: peso,
      ativo: true,
      created_at: new Date().toISOString(),
    };
    const updated = [...vendedores, novo];
    setVendedores(updated);
    localStorage.setItem('phibo_vendedores_config_local', JSON.stringify(updated));

    try {
      await supabase.from('phibo_vendedores_config').upsert({
        cliente_id: clienteId,
        nome_vendedor: nome,
        url_foto: fotoUrl || null,
        peso_meta: peso,
        ativo: true,
      }, { onConflict: 'cliente_id,nome_vendedor' });
    } catch (e) {
      console.warn('Persistência Supabase nova vendedora offline:', e);
    }
  };

  const cadastrarNovaLoja = (nomeLoja: string, emailPhibo: string) => {
    const nova: PhiboClienteConfig = {
      id: crypto.randomUUID ? crypto.randomUUID() : `loja-${Date.now()}`,
      nome_loja: nomeLoja,
      email_login_phibo: emailPhibo,
      senha_login_phibo: null,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...lojas, nova];
    setLojas(updated);
    localStorage.setItem('phibo_lojas_local', JSON.stringify(updated));
    return nova;
  };

  return {
    metas,
    vendedores,
    lojas,
    salvarMetas,
    atualizarVendedor,
    cadastrarVendedor,
    cadastrarNovaLoja,
  };
}
