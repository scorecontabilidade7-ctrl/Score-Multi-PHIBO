-- =====================================================================================
-- MIGRATION: 20261020000002_phibo_dashboard_rpc.sql
-- PROJETO: Plataforma Comercial Multi-Tenant para ERP PHIBO (Piloto: BlushFit)
-- DESCRIÇÃO: Stored Procedure analítica de alta performance para consolidação do
--            Dashboard Comercial (KPIs, Timeline, Ranking com Fotos e Origens).
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.phibo_get_dashboard_data(
    p_cliente_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_kpis JSONB;
    v_timeline JSONB;
    v_ranking JSONB;
    v_origens JSONB;
    v_result JSONB;
    v_faturamento_total NUMERIC(12,2);
BEGIN
    -- 1. Agregação dos KPIs Principais da Loja
    SELECT 
        COALESCE(SUM(valor_total), 0.00),
        jsonb_build_object(
            'faturamento_total', COALESCE(SUM(valor_total), 0.00),
            'total_atendimentos', COUNT(id),
            'total_pecas', COALESCE(SUM(quantidade), 0),
            'ticket_medio', CASE 
                WHEN COUNT(id) > 0 THEN ROUND(SUM(valor_total) / COUNT(id), 2)
                ELSE 0.00 
            END,
            'pa_loja', CASE 
                WHEN COUNT(id) > 0 THEN ROUND(SUM(quantidade)::numeric / COUNT(id), 2)
                ELSE 0.00 
            END
        )
    INTO v_faturamento_total, v_kpis
    FROM public.phibo_vendas
    WHERE cliente_id = p_cliente_id
      AND data_venda BETWEEN p_start_date AND p_end_date;

    -- 2. Agregação da Linha do Tempo Diária (Timeline)
    SELECT COALESCE(jsonb_agg(t ORDER BY t.data_venda ASC), '[]'::jsonb)
    INTO v_timeline
    FROM (
        SELECT 
            data_venda,
            COUNT(id) AS qtd_vendas,
            COALESCE(SUM(quantidade), 0) AS qtd_pecas,
            COALESCE(SUM(valor_total), 0.00) AS faturamento
        FROM public.phibo_vendas
        WHERE cliente_id = p_cliente_id
          AND data_venda BETWEEN p_start_date AND p_end_date
        GROUP BY data_venda
    ) t;

    -- 3. Ranking de Vendedoras com Fotos e Indicador Individual de P.A
    SELECT COALESCE(jsonb_agg(r ORDER BY r.faturamento DESC), '[]'::jsonb)
    INTO v_ranking
    FROM (
        SELECT 
            v.vendedor,
            COALESCE(vc.url_foto, '') AS url_foto,
            COUNT(v.id) AS qtd_vendas,
            COALESCE(SUM(v.quantidade), 0) AS qtd_pecas,
            COALESCE(SUM(v.valor_total), 0.00) AS faturamento,
            ROUND(SUM(v.valor_total) / NULLIF(COUNT(v.id), 0), 2) AS ticket_medio,
            ROUND(SUM(v.quantidade)::numeric / NULLIF(COUNT(v.id), 0), 2) AS pa
        FROM public.phibo_vendas v
        LEFT JOIN public.phibo_vendedores_config vc 
               ON vc.cliente_id = v.cliente_id 
              AND vc.nome_vendedor = v.vendedor
        WHERE v.cliente_id = p_cliente_id
          AND v.data_venda BETWEEN p_start_date AND p_end_date
          AND v.vendedor IS NOT NULL
        GROUP BY v.vendedor, vc.url_foto
    ) r;

    -- 4. Distribuição de Vendas por Canal / Origem
    SELECT COALESCE(jsonb_agg(o ORDER BY o.faturamento DESC), '[]'::jsonb)
    INTO v_origens
    FROM (
        SELECT 
            COALESCE(origem, 'Outros') AS origem,
            COUNT(id) AS qtd_vendas,
            COALESCE(SUM(valor_total), 0.00) AS faturamento,
            CASE 
                WHEN v_faturamento_total > 0 THEN 
                    ROUND((SUM(valor_total) / v_faturamento_total) * 100, 2)
                ELSE 0.00 
            END AS percentual
        FROM public.phibo_vendas
        WHERE cliente_id = p_cliente_id
          AND data_venda BETWEEN p_start_date AND p_end_date
        GROUP BY origem
    ) o;

    -- 5. Principais Clientes por Faturamento (Valor)
    SELECT COALESCE(jsonb_agg(c ORDER BY c.faturamento DESC), '[]'::jsonb)
    INTO v_clientes
    FROM (
        SELECT 
            INITCAP(TRIM(cliente_nome)) AS cliente_nome,
            COUNT(id) AS qtd_compras,
            COALESCE(SUM(quantidade), 0) AS qtd_pecas,
            COALESCE(SUM(valor_total), 0.00) AS faturamento,
            COALESCE(SUM(cashback), 0.00) AS cashback,
            ROUND(SUM(valor_total) / NULLIF(COUNT(id), 0), 2) AS ticket_medio,
            CASE 
                WHEN v_faturamento_total > 0 THEN 
                    ROUND((SUM(valor_total) / v_faturamento_total) * 100, 2)
                ELSE 0.00 
            END AS percentual
        FROM public.phibo_vendas
        WHERE cliente_id = p_cliente_id
          AND data_venda BETWEEN p_start_date AND p_end_date
          AND cliente_nome IS NOT NULL 
          AND TRIM(cliente_nome) != ''
        GROUP BY TRIM(cliente_nome)
        ORDER BY faturamento DESC
        LIMIT 6
    ) c;

    -- 6. Principais Clientes por Cashback
    SELECT COALESCE(jsonb_agg(cb ORDER BY cb.cashback DESC, cb.faturamento DESC), '[]'::jsonb)
    INTO v_clientes_cashback
    FROM (
        SELECT 
            INITCAP(TRIM(cliente_nome)) AS cliente_nome,
            COUNT(id) AS qtd_compras,
            COALESCE(SUM(quantidade), 0) AS qtd_pecas,
            COALESCE(SUM(valor_total), 0.00) AS faturamento,
            COALESCE(SUM(cashback), 0.00) AS cashback,
            ROUND(SUM(valor_total) / NULLIF(COUNT(id), 0), 2) AS ticket_medio,
            CASE 
                WHEN v_cashback_total > 0 THEN 
                    ROUND((SUM(cashback) / v_cashback_total) * 100, 2)
                ELSE 0.00 
            END AS percentual
        FROM public.phibo_vendas
        WHERE cliente_id = p_cliente_id
          AND data_venda BETWEEN p_start_date AND p_end_date
          AND cliente_nome IS NOT NULL 
          AND TRIM(cliente_nome) != ''
        GROUP BY TRIM(cliente_nome)
        ORDER BY cashback DESC, faturamento DESC
        LIMIT 6
    ) cb;

    -- Montagem do JSON Consolidado
    v_result := jsonb_build_object(
        'kpis', v_kpis,
        'timeline', v_timeline,
        'ranking_vendedores', v_ranking,
        'origens', v_origens,
        'clientes', v_clientes,
        'clientes_cashback', v_clientes_cashback
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.phibo_get_dashboard_data IS 'Retorna dados analíticos consolidados do Dashboard Comercial para a loja e período especificados.';

-- Concessão explícita de permissão para execução da procedure
GRANT EXECUTE ON FUNCTION public.phibo_get_dashboard_data(UUID, DATE, DATE) TO anon, authenticated, service_role;
