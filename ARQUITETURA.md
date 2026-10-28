# Arquitetura do Sistema | Score Multi → BlushFit

Este documento descreve detalhadamente a arquitetura técnica, fluxo de dados, modelo de dados, segurança e estratégias de integração do sistema herdado de **Score Multi** para a implementação e customização da **BlushFit**.

---

## 1. Visão Geral da Solução

O sistema é uma plataforma web integrada de **Business Intelligence (BI) Comercial, Gestão de Metas, Acompanhamento de Equipe de Vendas e Controle de Estoque (Curva ABC / Reposição)**, desenvolvida sob uma arquitetura **Multi-Tenant (Multi-Loja)** com backend baseado no ecossistema Supabase (PostgreSQL, Auth, RLS, RPCs e Edge Functions) e frontend SPA moderno em React + TypeScript.

```mermaid
graph TD
    subgraph "Fontes de Dados & Automação"
        ERP[ERP Comercial / Gigatech] -->|Ingestão / Sync SQL| DB[(Supabase PostgreSQL)]
        N8N[Agente n8n / IA Comercial] <-->|Webhook / Tools SQL| DB
        N8N <-->|WhatsApp API| WPP[Gestores & Vendedores WhatsApp]
    end

    subgraph "Camada de Dados & Segurança (Supabase)"
        DB --> RLS[Row Level Security (RLS)]
        RLS --> RPC[Stored Procedures / RPCs]
        AUTH[Supabase Auth (JWT)] --> RLS
        EDGE[Edge Functions (Admin Provisioning)]
    end

    subgraph "Camada Frontend (React 18 + Vite + TS)"
        UI[shadcn/ui + Tailwind CSS]
        STATE[TanStack React Query v5]
        ROUTER[React Router DOM v6]
        RPC --> STATE
        RLS --> STATE
        STATE --> UI
    end
```

---

## 2. Stack Tecnológica

### 2.1. Frontend
| Componente | Tecnologia | Função no Projeto |
|---|---|---|
| **Linguagem & Runtime** | TypeScript 5.8 + React 18.3 | Tipagem estática, componentização funcional e estabilidade |
| **Build Tool & Bundler** | Vite 5.4 + SWC (`@vitejs/plugin-react-swc`) | Hot Module Replacement (HMR) ultrarrápido e compilação otimizada |
| **Estilização** | Tailwind CSS 3.4 + `tailwindcss-animate` | Utilitários de estilização responsiva e tema customizável |
| **Componentes de UI** | Radix UI (shadcn/ui) + Lucide Icons | Componentes acessíveis, consistentes e sem dependências pesadas |
| **Roteamento** | React Router DOM v6.30 | Roteamento declarativo, layouts aninhados e guardas de rota (`AdminGuard`) |
| **Estado Remoto & Cache** | TanStack React Query v5.83 | Cache inteligente, deduplicação de requisições e refetch configurável |
| **Gráficos & Visualização** | Recharts 2.15 | Gráficos de barras, linhas, áreas, treemap de estoque e velocímetros |
| **Exportação de Relatórios** | `jspdf`, `jspdf-autotable`, `xlsx` | Geração de PDFs e planilhas Excel formatadas diretamente no browser |

### 2.2. Backend & Banco de Dados (Supabase)
| Componente | Tecnologia | Função no Projeto |
|---|---|---|
| **Banco de Dados** | PostgreSQL 15+ (Gerenciado Supabase) | Modelagem relacional, agregações analíticas e particionamento lógico |
| **Autenticação** | Supabase Auth (GoTrue) | Autenticação por e-mail/senha, emissão de tokens JWT e claims de usuário |
| **Segurança** | Row Level Security (RLS) | Restrição granular de linhas com base no `auth.uid()` e roles do usuário |
| **Lógica Analítica** | PL/pgSQL Stored Procedures (RPCs) | Processamento de relatórios pesados no servidor (agregação de vendas, ABC, KPIs) |
| **Serverless Functions** | Deno / Supabase Edge Functions | Provisionamento administrativo de usuários (`admin-create-user`) com `service_role` |

### 2.3. Automação e IA (n8n & WhatsApp)
- **n8n Workflow Engine:** Orquestra consultas analíticas no Supabase e integra com a Evolution API / Z-API para envio de briefings diários e respostas de IA aos vendedores e diretores no WhatsApp.
- **AI Agent (LLM):** Utiliza ferramentas (Tools SQL / RPCs) para responder perguntas operacionais com cálculo automático de metas, comissões e faturamento em linguagem natural.

---

## 3. Arquitetura Multi-Tenant / Multi-Loja

A arquitetura adota o padrão **Shared Database, Shared Schema com Discriminação por Coluna (`cliente_id`)**:

```
                       [ gigatech_clientes_config ]
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
[ Loja 1 (UUID) ]            [ Loja 2 (UUID) ]           [ Loja Demo (UUID) ]
       │                            │                            │
       ├─ gigatech_vendas           ├─ gigatech_vendas           └─ mockStoreData (Fallback)
       ├─ gigatech_vendedores       ├─ gigatech_vendedores
       ├─ multi_monthly_goals       ├─ multi_monthly_goals
       └─ multi_inventory_view      └─ multi_inventory_view
```

### 3.1. Isolamento Lógico
1. Toda consulta e inserção analítica é filtrada pelo `cliente_id` (UUID que identifica a unidade/loja).
2. O usuário autenticado possui seus acessos mapeados na tabela `multi_user_roles`:
   - `super_admin`: Tem acesso a todas as lojas ativas (`gigatech_clientes_config.ativo = true`).
   - `admin` / `manager`: Tem acesso restrito às lojas vinculadas em `multi_user_roles.cliente_id`.
   - `seller`: Tem acesso vinculado à sua loja e ao seu nome de vendedor (`multi_profiles.nome_vendedor`).

---

## 4. Estrutura de Diretórios do Frontend

```
src/
├── App.tsx                          # Provedores globais, rotas principais e guards
├── main.tsx                         # Bootstrap da aplicação
├── index.css                        # Tokens CSS, variáveis de tema HSL e utilitários
│
├── components/
│   ├── auth/
│   │   └── AdminGuard.tsx           # Guarda de rotas administrativas (valida permissões)
│   ├── dashboard/
│   │   ├── CommissionsTable.tsx     # Tabela analítica de comissões por vendedor
│   │   ├── DashboardFilters.tsx     # Filtros temporais (mês, período personalizado, vendedor)
│   │   ├── DepartmentChart.tsx      # Distribuição percentual de vendas por departamento
│   │   ├── InventoryDataTable.tsx   # Tabela interativa de estoque e curva ABC
│   │   ├── KPICards.tsx             # Cards dos principais indicadores comerciais
│   │   ├── MetasTracking.tsx        # Gráfico e barra de progresso das metas mensais
│   │   ├── PATable.tsx              # Tabela de Peças por Atendimento (P.A)
│   │   ├── ProductSalesTable.tsx    # Desempenho analítico por SKU / EAN
│   │   ├── SalesRanking.tsx         # Ranking visual dos vendedores com pódio
│   │   ├── SalesTimeline.tsx        # Gráfico diário de evolução das vendas
│   │   └── Sidebar.tsx              # Navegação lateral expansível e responsiva
│   ├── monitoramento/
│   │   └── MonitoramentoDialog.tsx  # Modal de criação/edição de ações promocionais
│   └── ui/                          # 30+ componentes reutilizáveis shadcn (Radix UI)
│
├── hooks/
│   ├── useAuth.ts                   # Gerenciamento de sessão, login e logout
│   ├── useUserAccess.ts             # Papéis, lojas autorizadas e contexto do usuário
│   ├── useSalesData.ts              # Consulta de vendas, timeline, departamentos e ranking
│   ├── useMonthlyGoals.ts           # Gestão de metas mensais e parâmetros de comissão
│   ├── useDynamicCommissions.ts     # Cálculo de comissões fixas e escalonadas
│   ├── usePAData.ts                 # Indicadores de Peças por Atendimento (P.A)
│   ├── useInventoryData.ts          # KPIs de estoque, Treemap e Curva ABC
│   ├── useInventoryList.ts          # Listagem paginada e detalhada de inventário
│   ├── useMonitoramentoAcoes.ts     # CRUD e atingimento de ações promocionais
│   ├── useProductSalesPerformance.ts # Consulta RPC de performance de produtos
│   ├── useVendedoresConfig.ts       # Configurações de vendedores (fotos, metas individuais)
│   └── useTheme.ts                  # Alternância de tema claro/escuro
│
├── integrations/
│   └── supabase/
│       ├── client.ts                # Instância inicializada do cliente Supabase
│       └── types.ts                 # Tipos gerados automaticamente a partir do banco
│
├── lib/
│   ├── mockStoreData.ts             # Dados sintéticos de alta fidelidade para modo Demo
│   └── utils.ts                     # Utilitários de fuso horário (America/Sao_Paulo), moeda e datas
│
└── pages/
    ├── Index.tsx                    # Dashboard Comercial Principal (`/dashboard/:cliente_id`)
    ├── Welcome.tsx                  # Seletor de Loja pós-login (`/welcome`)
    ├── Login.tsx                    # Tela de autenticação (`/login`)
    ├── SellerProfile.tsx            # Visão 360º do Vendedor (`/vendedor/:name`)
    ├── EstoqueDashboard.tsx         # Gestão de Estoque e Curva ABC (`/estoque/:cliente_id`)
    ├── MonitoramentoAcoes.tsx       # Monitoramento de Campanhas Promocionais
    ├── GlobalLayout.tsx             # Layout global com sidebar e cabeçalho unificado
    ├── NotFound.tsx                 # Tela 404
    └── admin/
        ├── AdminDashboard.tsx       # Hub administrativo com cards de navegação
        ├── GoalsManagement.tsx      # Configuração de Metas e Parâmetros
        ├── UsersManagement.tsx      # CRUD de Usuários e atribuição de perfis
        ├── VendedoresManagement.tsx # Normalização de nomes e vinculação de vendedores
        └── PermissionsManagement.tsx # Matriz de permissões e papéis por loja
```

---

## 5. Modelo de Dados e Banco de Dados

### 5.1. Tabelas de Negócio e Vendas
- **`gigatech_clientes_config`**: Cadastro central de clientes/unidades/lojas (`id`, `nome_loja`, `ativo`, `created_at`).
- **`gigatech_vendas`**: Linhas detalhadas de cada item vendido (`cliente_id`, `data_venda`, `ean`, `produto`, `departamento`, `marca`, `cor`, `tamanho`, `quantidade`, `valor_venda`, `custo`, `n_cupom`).
- **`gigatech_vendedores`**: Registro de vendas consolidado por vendedor e cupom (`cliente_id`, `data_venda`, `vendedor`, `valor_venda`, `comissao`, `n_cupom`, `tipo_venda`).
- **`gigatech_estoque`**: Snapshot atual do estoque físico (`cliente_id`, `ean`, `produto`, `marca`, `departamento`, `quantidade`, `custo`, `valor_venda`).
- **`gigatech_ranking_vendedores`**: Agregação diária por vendedor (`cliente_id`, `vendedor`, `data_venda`, `qtd_total_itens_vendidos`, `qtd_total_vendas`, `valor_total_vendas`, `ticket_medio`, `pecas_por_atendimento`).

### 5.2. Tabelas Administrativas e de Controle (`multi_*`)
- **`multi_profiles`**: Extensão do usuário do Supabase Auth (`id`, `username`, `full_name`, `nome_vendedor`, `default_cliente_id`, `active`).
- **`multi_user_roles`**: Matriz de papéis por usuário e por loja (`id`, `user_id`, `role`, `cliente_id`).
- **`multi_vendedores_config`**: Customizações do vendedor (`cliente_id`, `nome_vendedor`, `url_foto`, `peso_meta`, `ativo`).
- **`multi_parametro_metas`**: Definição dos níveis de metas da loja (`id`, `cliente_id`, `nome`, `percentual`, `ordem`). Exemplos: Mínima (1%), Top 1 (1.5%), Top 2 (2%), Master (2.5%).
- **`multi_monthly_goals`**: Metas mensais da loja (`id`, `year_month`, `cliente_id`, `dias_uteis`, `distribution_mode`, `distribution_week`, `distribution_day`).
- **`multi_monthly_goals_valores`**: Valores financeiros atribuídos a cada nível de meta (`monthly_goal_id`, `parametro_meta_id`, `valor`).
- **`multi_monitoramento_acoes`**: Campanhas promocionais cadastradas (`id`, `cliente_id`, `name`, `start_date`, `end_date`, `target_value`).

---

## 6. Stored Procedures e RPCs Analíticas

Para manter alto desempenho em bases com centenas de milhares de linhas, o sistema transfere o peso computacional para stored procedures no PostgreSQL:

1. **`multi_get_dashboard_data(p_cliente_id, p_start_date, p_end_date)`**: Consolida KPIs gerais, vendas diárias para timeline, ranking de vendedores e faturamento por departamento em uma única chamada JSON.
2. **`multi_get_inventory_kpis(p_cliente_id)`**: Retorna total de itens em estoque, custo total, valor potencial de venda e quantidade de SKUs únicos.
3. **`multi_get_inventory_treemap(p_cliente_id, p_group_by)`**: Agrupa o estoque por departamento ou marca em formato hierárquico para visualização em Treemap.
4. **`multi_get_inventory_abc_replenishment(p_cliente_id, p_days)`**: Calcula a Curva ABC acumulada das vendas nos últimos N dias, cruza com o saldo atual de estoque, projeta o giro diário (`avg_daily_sales`), dias de cobertura (`days_of_supply`) e classifica o status de reposição.
5. **`multi_get_monitoramento_acoes(p_cliente_id, p_year, p_month)`**: Cruza as ações cadastradas com as vendas efetivas ocorridas no período de cada ação.
6. **`multi_get_product_sales_performance(...)`**: Agrega vendas por produto/SKU com ranking e margens.

---

## 7. Mecanismos de Fallback e Modo Demonstração (Demo Mode)

O sistema possui uma camada nativa de fallback para demonstração comercial:
- Se o `cliente_id` selecionado for `loja-ficticia-score` ou `d0000000-0000-0000-0000-000000000001`, o hook intercepta a requisição e devolve dados gerados programaticamente por `src/lib/mockStoreData.ts`.
- Isso permite apresentar todo o sistema para novos clientes (como a BlushFit) sem necessidade de popular o banco de dados previamente com dados reais.

---

## 8. Guia de Adaptação para o Cliente BlushFit

Para transformar esta cópia no projeto oficial da **BlushFit**, siga o seguinte roteiro:

1. **Branding e Identidade Visual:**
   - Atualizar títulos, logos e metatags em `index.html` e `src/components/dashboard/Sidebar.tsx`.
   - Ajustar paleta de cores HSL em `src/index.css` para refletir as cores da marca BlushFit.
2. **Configuração de Variáveis de Ambiente:**
   - Criar projeto Supabase dedicado para a BlushFit.
   - Configurar `.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. **Migração do Banco de Dados:**
   - Executar as migrations contidas em `supabase/migrations/` no novo banco da BlushFit.
   - Cadastrar as lojas da BlushFit em `gigatech_clientes_config`.
4. **Alinhamento do Script de Ingestão de Dados:**
   - Configurar a rotina de ETL/Sync do ERP da BlushFit para alimentar as tabelas `gigatech_vendas`, `gigatech_vendedores` e `gigatech_estoque`.
5. **Automações de IA (n8n):**
   - Ajustar as variáveis do agente em `agente_n8n/multi_agente_n8n.json` com o nome "BlushFit", adaptando o tom de voz e regras de atendimento.
