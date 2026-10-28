# Registro de Tarefas e Alterações (Tasks & Changelog) | BlushFit

Este documento registra todas as alterações, implementações, correções e manutenções realizadas no projeto **BlushFit**, mantendo um histórico cronológico e rastreável de cada mudança.

---

## 📌 Convenções de Registro

Cada entrada deve conter:
- **Data/Hora:** Data da execução (fuso `America/Sao_Paulo`).
- **Tipo de Mudança:** `[DOCUMENTAÇÃO]`, `[FEATURE]`, `[REFACTOR]`, `[BUGFIX]`, `[CONFIG]`, `[DATABASE]`, etc.
- **Arquivos Afetados:** Links diretos para os arquivos modificados ou criados.
- **Descrição da Alteração:** Detalhamento do que foi realizado e o motivo da mudança.

---

## 📋 Backlog de Planejamento (Próximos Passos)

- [ ] **Configuração do Ambiente Supabase BlushFit:** Criação/vinculação do novo banco e execução das migrations.
- [ ] **Identidade Visual e Branding:** Atualização de títulos, logos, favicon e paleta de cores (CSS HSL).
- [ ] **Configuração de Lojas e Permissões:** Mapeamento das unidades da BlushFit em `gigatech_clientes_config`.
- [ ] **Ajuste das Automações n8n:** Parametrização do agente de IA com o contexto da BlushFit.

---

## 📝 Histórico de Alterações Realizadas

### 2026-10-20

#### [DOCUMENTAÇÃO] Criação da Documentação Base do Projeto
- **Arquivos Criados:**
  - `ARQUITETURA.md`
  - `RULES.md`
  - `TASKS.md`
- **Descrição:**
  - Criação do documento de arquitetura (`ARQUITETURA.md`) detalhando stack (React 18 + Vite + Supabase), arquitetura multi-tenant, modelo de dados, RPCs analíticas e segurança (RLS/RBAC).
  - Criação do documento de regras de negócio (`RULES.md`) com a especificação funcional de cada módulo: KPIs, comissões dinâmicas, P.A, curva ABC de estoque, monitoramento de ações promocionais e governança administrativa.
  - Inicialização deste arquivo de rastreamento (`TASKS.md`) para registrar continuamente todas as futuras mudanças.

#### [DOCUMENTAÇÃO] Modelagem e Organização dos Dados PHIBO
- **Arquivo Criado:**
  - `ORGANIZACAO_DADOS.md`
- **Descrição:**
  - Mapeamento detalhado das tabelas do PHIBO no Supabase (`phibo_clientes_config` e `phibo_vendas`).
  - Fórmulas SQL diretas para cálculo de faturamento líquido, atendimentos, ticket médio, P.A e ranking por vendedora.
  - Especificação das 4 tabelas complementares enxutas (`blushfit_perfis`, `blushfit_vendedores_config`, `blushfit_metas_mensais`, `blushfit_campanhas`) para construir a nova aplicação sem débito técnico.
  - Estrutura planejada para a futura tabela de estoque (`phibo_estoque`) e índices de alta performance recomendados.

#### [DOCUMENTAÇÃO] Criação e Revisão do PRD (v2.0)
- **Arquivo Criado/Atualizado:**
  - `PRD.md`
- **Descrição:**
  - Criação e atualização para a Versão 2.0 do PRD com ajustes estratégicos de escopo:
    1. Modelo SaaS Multi-Tenant genérico para qualquer cliente do ERP PHIBO (com a BlushFit como cliente de estreia).
    2. Governança e isolamento total via RLS (usuário de uma loja só acessa a sua loja).
    3. Suporte nativo a múltiplas sessões simultâneas sem desconexão de usuários logados.
    4. Despriorização de Estoque/Curva ABC (aguardando dados do PHIBO) e de Agente IA/n8n para o backlog futuro.

#### [DATABASE] Criação e Revisão Rigorosa das Migrations SQL (PHIBO)
- **Arquivos Criados/Revisados:**
  - `supabase/migrations/20261020000001_phibo_core_schema.sql`
  - `supabase/migrations/20261020000002_phibo_dashboard_rpc.sql`
- **Arquivos Atualizados:**
  - `RULES.md` (adicionadas regras de isolamento de namespace `phibo_` e multi-sessão)
  - `ORGANIZACAO_DADOS.md` (padronização dos nomes com prefixo `phibo_`)
- **Descrição:**
  - Criação e revisão aprofundada do schema SQL no Supabase com tabelas com prefixo exclusivo `phibo_` (`phibo_clientes_config`, `phibo_vendas`, `phibo_perfis`, `phibo_vendedores_config`, `phibo_metas_mensais`, `phibo_campanhas`).
  - Prevenção de recursão infinita no RLS de `phibo_perfis`.
  - Trigger automático `phibo_handle_new_user` vinculado a `auth.users` para provisionamento instantâneo.
  - Implementação de índices compostos e Grants explícitos para execução de procedures analíticas.
  - Cadastro padrão da loja BlushFit como cliente inicial.

#### [FRONTEND] Inicialização da Estrutura Base (React 18 + Vite + Tailwind + TypeScript)
- **Arquivos Criados:**
  - `package.json`
  - `vite.config.ts`
  - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - `postcss.config.js`, `tailwind.config.js`
  - `index.html`
  - `src/index.css`
  - `src/lib/utils.ts`
  - `src/integrations/supabase/client.ts`
  - `src/integrations/supabase/types.ts`
  - `src/main.tsx`
  - `src/App.tsx`
  - `.env.example`
- **Descrição:**
  - Setup do projeto frontend com Vite SWC, tipagem rigorosa TypeScript, Tailwind CSS com paleta BlushFit (tons blush/rosa e dark mode refinado).
  - Configuração do cliente Supabase com persistência local de sessão (`localStorage`) para suportar multi-acessos simultâneos sem desconexão.
  - Componente inicial `App.tsx` com KPIs e header responsivo.
  - Compilação de produção (`npm run build`) validada com sucesso em 1.89s (0 erros TypeScript).
  - Servidor de desenvolvimento ativo em `http://localhost:3000` e validado visualmente via navegador no modo claro e escuro.

#### [FEATURE] Construção dos Componentes do Dashboard Comercial (Fase 2)
- **Arquivos Criados:**
  - `src/lib/mockStoreData.ts` (dados sintéticos de alta fidelidade para modo demonstração e fallback)
  - `src/hooks/useDashboardData.ts` (integração analítica com RPC `phibo_get_dashboard_data` e fallback inteligente)
  - `src/components/dashboard/DashboardFilters.tsx` (filtros por mês, canal, vendedora e exportação XLSX)
  - `src/components/dashboard/KPICards.tsx` (5 cards principais: Faturamento, Atendimentos, Ticket Médio, P.A e Comissão Estimada)
  - `src/components/dashboard/GoalsTracker.tsx` (termômetro das 4 metas da loja: Mínima, Top 1, Top 2 e Master)
  - `src/components/dashboard/SalesTimeline.tsx` (gráfico de área interativo de vendas diárias)
  - `src/components/dashboard/ChannelDistribution.tsx` (distribuição por canais: Loja Física, WhatsApp, E-commerce, Instagram)
  - `src/components/dashboard/SalesRanking.tsx` (pódio visual dos top 3 vendedores com fotos e tabela com comparativo de P.A vs. loja)
- **Arquivos Atualizados:**
  - `src/App.tsx` (orquestração dos filtros, query hook e renderização dos blocos do dashboard)
- **Descrição:**
  - Implementação completa do Dashboard Comercial do piloto BlushFit conforme especificado no PRD.
  - Teste de compilação de produção (`npm run build`) validado com zero erros TypeScript.
  - Validação visual automatizada no navegador via subagente em modo claro e escuro.

#### [FEATURE] Módulo de Perfil 360º da Vendedora e Roteamento (Fase 3)
- **Arquivos Criados:**
  - `src/hooks/useSellerData.ts` (cálculo de métricas individuais, rateio de metas por vendedora, comissão escalonada e performance por dia da semana)
  - `src/pages/SellerProfile.tsx` (painel individual com foto, pódio, 5 cards de KPIs, régua de bonificação individual, timeline diária e gráfico de barras por dia da semana)
  - `src/pages/Dashboard.tsx` (isolamento da visão do Dashboard Comercial para desacoplamento de rotas)
- **Arquivos Atualizados:**
  - `src/App.tsx` (configuração de rotas declarativas do React Router: `/` e `/vendedor/:name`)
  - `src/components/dashboard/SalesRanking.tsx` (botão de perfil e navegação instantânea com `useNavigate`)
- **Descrição:**
  - Construção da experiência completa de autoatendimento e reuniões de feedback 1:1 para a equipe de vendas.
  - Transição fluida entre a visão global da loja e o desempenho detalhado de cada vendedora.
  - Validação de build em 5.22s e teste interativo completo no navegador via subagente.

#### [FEATURE] Módulo de Autenticação, Perfis RBAC e Multi-Sessão (Fase 4)
- **Arquivos Criados:**
  - `src/hooks/useAuth.ts` (gerenciamento de sessão Supabase Auth com persistência independente em `localStorage`, permitindo múltiplos acessos simultâneos sem desconexão, e perfis de demonstração rápida)
  - `src/pages/Login.tsx` (interface moderna com formulário de login corporativo, atalhos de acesso para Diretoria, Gerente e Vendedora, e garantia visual de multi-sessão)
- **Arquivos Atualizados:**
  - `src/App.tsx` (roteamento para `/login`, cabeçalho responsivo com identificação do usuário logado, badge de papel `Super Admin` / `Gerente` / `Vendedora` e botão de encerramento de sessão)
- **Descrição:**
  - Implementação completa do fluxo de autenticação conforme regras de governança e isolamento do PRD.
  - Suporte nativo a múltiplos acessos simultâneos no mesmo perfil ou perfis distintos sem conflito de logout.
  - Redirecionamento automático de vendedoras diretamente para o seu perfil pessoal (`/vendedor/:name`).
  - Validação de compilação em 5.28s e testes automatizados de navegação e logout no navegador via subagente.

#### [FEATURE] Módulo de Campanhas Promocionais Sazonais (Fase 4)
- **Arquivos Criados:**
  - `src/hooks/useCampanhas.ts` (gerenciamento analítico de ações sazonais, cálculo dinâmico de atingimento percentual, dias restantes e persistência)
  - `src/pages/Campanhas.tsx` (interface com cards de métricas de campanhas ativas, faturamento em ações, listagem com barras de progresso e modal de cadastro de novas ações)
- **Arquivos Atualizados:**
  - `src/App.tsx` (inclusão de aba 'Campanhas' no cabeçalho global e rota `/campanhas`)
- **Descrição:**
  - Implementação completa do módulo de monitoramento de eventos comerciais pontuais (ex: Lançamento de Coleção, Black Friday, Semana do Bem-Estar).
  - Cálculo em tempo real do faturamento realizado dentro da janela da campanha vs. meta financeira.
  - Build de produção validado e testado no navegador via subagente.

#### [FEATURE] Painel Administrativo de Governança e Multi-Tenant (Fase 5)
- **Arquivos Criados:**
  - `src/hooks/useAdminConfig.ts` (gerenciamento das 4 faixas de metas mensais da loja, normalização de nomes e fotos de vendedoras, e acoplamento de novas lojas PHIBO com geração de UUID de isolamento)
  - `src/pages/admin/AdminDashboard.tsx` (interface administrativa completa com 3 abas estruturadas: Metas da Loja, Vendedoras & Fotos, e Lojas PHIBO Multi-Tenant)
- **Arquivos Atualizados:**
  - `src/App.tsx` (inclusão de aba 'Governança' no cabeçalho global e rota protegida `/admin`)
- **Descrição:**
  - Implementação das ferramentas de gestão de governança e multi-tenancy conforme especificado no PRD.
  - Parametrização em tempo real das 4 faixas de meta meritocrática (Mínima, Top 1, Top 2 e Master) e dias úteis.
  - Gerenciamento visual da equipe de vendedoras com fotos e status de rateio.
  - Interface para acoplamento de novos clientes que utilizem o ERP PHIBO sem alteração de código.
  - Validação de build em 6.96s e testes automatizados de navegação no navegador via subagente.

#### [BRANDING] Integração da Logo Oficial BlushFit e Harmonização de Cores
- **Arquivos Criados:**
  - `public/logo-blushfit.png` (arquivo original recebido do usuário)
  - `public/logo-blushfit-transparent.png` (versão tratada com transparência e anti-aliasing)
  - `public/logo-blushfit-dark.png` (versão otimizada para fundo preto)
  - `public/favicon.png` (ícone da aba do navegador derivado da logo oficial)
  - `src/components/common/BlushFitLogo.tsx` (componente reutilizável para renderização da marca)
- **Arquivos Atualizados:**
  - `src/index.css` (extraída e aplicada a cor exata `#c0577f` / HSL `337 48% 55%` nos tokens `--primary`, `--ring` e `--accent`)
  - `index.html` (atualização do favicon para `/favicon.png`)
  - `src/App.tsx` (aplicação da logo oficial no cabeçalho global)
  - `src/pages/Login.tsx` (destaque central da logo oficial na tela de login)
- **Descrição:**
  - Tratamento gráfico do arquivo de logo enviado, extração espectral do tom exato de rosa/blush e padronização visual em todo o sistema.
  - Validação de build em 5.71s e confirmação visual no navegador.

#### [FEATURE] Seletor de Períodos e Base Histórica Multi-Meses
- **Arquivos Criados/Atualizados:**
  - `src/lib/mockStoreData.ts` (expansão da base simulada em `mockMonthlyData` cobrindo Outubro/2026, Setembro/2026, Agosto/2026 e Julho/2026 com dinâmicas realistas)
  - `src/components/dashboard/DashboardFilters.tsx` (substituição do badge estático por dropdown dinâmico com ícone de calendário)
  - `src/hooks/useDashboardData.ts` (suporte ao parâmetro `monthKey` com fallback transparente por mês selecionado)
  - `src/pages/Dashboard.tsx` (integração do seletor com recálculo automático de dias úteis e períodos)
- **Descrição:**
  - Habilitação da navegação temporal no Dashboard permitindo alternar entre o mês em andamento e meses anteriores fechados.
  - Validação de compilação sem erros (`npm run build`).

#### [BUGFIX] Limpeza de Cache de Módulos do Vite & Validação E2E do Seletor
- **Causa Raiz:** O servidor de desenvolvimento do Vite reteve em cache otimizado a versão anterior de `src/lib/mockStoreData.ts`, causando falso erro de sintaxe no navegador do cliente ao importar `mockMonthlyData`.
- **Ação:**
  - Expurgado o diretório de pre-bundling `node_modules/.vite`.
  - Reiniciado o dev server com flag forçada `vite --force`.
  - Validação automatizada via navegador (Browser Subagent) alternando entre Outubro/2026 e Setembro/2026 com atualização instantânea de KPIs, gráficos e régua de metas com 0 erros de console.

#### [INTEGRAÇÃO & DATABASE] Conexão Real com Supabase (phibo_vendas) e Execução da RPC Analítica
- **Arquivos Criados/Atualizados:**
  - `.env` (configuração da URL `https://lunsyufvxkiivnrhpxpj.supabase.co` e chave anônima oficial do projeto `ProjectsGerais`)
  - `src/hooks/useDashboardData.ts` (integração prioritária com a procedure `phibo_get_dashboard_data` e fallback inteligente)
  - `src/components/dashboard/DashboardFilters.tsx` (dropdowns dinâmicos de vendedoras e canais alimentados pelo retorno da RPC)
  - `src/pages/Dashboard.tsx` (cálculo dinâmico do último dia do mês para evitar erros de data como `2026-09-31` no Postgres)
  - `supabase/migrations/` (aplicação remota via MCP das tabelas complementares `phibo_perfis`, `phibo_vendedores_config`, `phibo_metas_mensais`, `phibo_campanhas` e da stored procedure analítica `phibo_get_dashboard_data`)
- **Descrição:**
  - Localizada a base real no Supabase com 182 vendas importadas via script Python para a loja **BlushFit** (`e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e`).
  - Painel 100% conectado aos dados reais:
    - **Outubro/2026 (Real):** R$ 18.780,01 (54 atendimentos, TM R$ 347,78, Juliana R$ 15.091,22, PLISSIA R$ 2.813,21, Site R$ 875,58).
    - **Setembro/2026 (Real):** R$ 37.886,73 (128 atendimentos, TM R$ 295,99, Juliana R$ 31.110,73, Site R$ 3.009,57, PLISSIA R$ 2.479,23).
  - Validação automatizada via subagente com capturas de tela e build sem erros em 5.46s.

#### [GOVERNANÇA & SEGURANÇA] Blindagem RBAC da Aba "Lojas PHIBO"
- **Arquivos Atualizados:**
  - `src/pages/admin/AdminDashboard.tsx` (inclusão de guardas de autenticação, bloqueio para vendedoras e renderização condicional estrita da aba 'Lojas PHIBO' apenas para `profile?.role === 'super_admin'`)
  - `src/App.tsx` (ocultação do botão 'Governança' no header para perfis de vendedora e redirecionamento de deslogados)
- **Descrição:**
  - **Super Admin (Diretoria):** Acesso irrestrito a 'Metas da Loja', 'Vendedoras & Fotos' e 'Lojas PHIBO (SaaS)'.
  - **Gerente (Admin/Manager):** Acesso exclusivo a 'Metas da Loja' e 'Vendedoras & Fotos' da BlushFit. A aba 'Lojas PHIBO' não é exibida.
  - **Vendedora (Seller):** Bloqueio total a `/admin` com mensagem de acesso restrito e redirecionamento para o perfil individual.
  - **Deslogado:** Bloqueio de tela com exibição de 'Acesso Restrito à Gestão' e botão para login.
  - Validação automatizada E2E no navegador (Browser Subagent) cobrindo todos os cenários com sucesso e build em 5.43s.

#### [FEATURE] Upload Direto de Imagens / Prints & Gestão de Vendedoras pelo Gerente
- **Arquivos Criados/Atualizados:**
  - `src/utils/imageUpload.ts` (função de processamento, redimensionamento via HTML5 Canvas para 300x300px com compressão leve e integração com bucket Supabase Storage `phibo_vendedores`)
  - `src/pages/admin/AdminDashboard.tsx` (novo componente de upload direto aceitando PNG, JPG, prints da área de transferência e botão de upload rápido de foto individual com ícone de câmera em cada vendedora na tabela)
  - `src/hooks/useAdminConfig.ts` (sincronização bidirecional em tempo real com `phibo_vendedores_config` e `phibo_metas_mensais` no Supabase com nomes oficiais do PHIBO)
  - `supabase/storage` (criação do bucket público `phibo_vendedores` e políticas RLS de leitura/escrita)
- **Descrição:**
  - O Gerente tem autonomia completa nas duas abas essenciais da loja: **Metas da Loja** (valores, comissões, dias úteis) e **Vendedoras & Fotos** (cadastro, fotos, ativação/desativação).
  - É possível subir fotos selecionando arquivos do computador/celular ou simplesmente colando imagens da área de transferência.
  - Teste E2E automatizado validado no navegador com salvamento de meta e captura de tela `manager_photo_upload_view`.

#### [UX & ARQUITETURA] Separação Clara: "Vendedoras & Metas" vs. "Governança"
- **Arquivos Criados:**
  - `src/pages/admin/MetasVendedoras.tsx` (tela dedicada à operação comercial da unidade: Metas da Loja e Vendedoras & Fotos com upload direto de imagens/prints, acessível para Gerente e Super Admin)
  - `src/pages/admin/GovernancaLojas.tsx` (tela dedicada exclusivamente à Governança Multi-Tenant: acoplamento de novos clientes/lojas do ERP PHIBO ao SaaS e listagem de UUIDs de isolamento, restrita ao Super Admin)
- **Arquivos Atualizados:**
  - `src/App.tsx` (reestruturação do cabeçalho global: 'Vendedoras & Metas' exibido para Gerente e Super Admin; 'Governança' exibido exclusivamente para o Super Admin; redirecionamentos seguros)
- **Descrição:**
  - A interface ficou muito mais intuitiva: Gerentes de loja agora acessam diretamente "Vendedoras & Metas" sem poluição de configurações SaaS.
  - O Super Admin mantém acesso a ambas as ferramentas no topo.
  - Validação automatizada E2E no navegador (Browser Subagent) com troca de papéis, testes de permissão e capturas de tela `manager_vendedoras_metas_view` e `super_admin_governanca_lojas_view`. Build sem erros em 5.20s.

#### [FEATURE & LAYOUT] Painel de Vendas x Clientes & Cashback e Reorganização do Dashboard
- **Arquivos Criados/Atualizados:**
  - `src/components/dashboard/DeptosClientesCard.tsx` (painel analítico de Vendas x Clientes com alternador `[ Valor | Cashback ]`, exibindo ranking das principais compradoras reais do ERP PHIBO por faturamento ou benefício de cashback acumulado)
  - `src/components/dashboard/SalesRanking.tsx` (desacoplamento em subcomponentes `SalesPodium` e `SalesRankingTable` mantendo compatibilidade)
  - `src/pages/Dashboard.tsx` (reorganização do layout: Pódio das Vendedoras e Vendas x Clientes lado a lado; Evolução Diária de Vendas em largura total abaixo; e Tabela Operacional de Vendedoras na base)
  - `src/integrations/supabase/types.ts` (interfaces `ClienteEntry` com `cashback`, `qtd_pecas`, `ticket_medio` e tipagem estendida com `clientes_cashback`)
  - `supabase/migrations/20261020000002_phibo_dashboard_rpc.sql` (extensão da stored procedure `phibo_get_dashboard_data` no Postgres totalizando faturamento e cashback por cliente no período)
  - `RULES.md` (especificação canônica na Seção 3.5 com estrita adesão à regra de não inventar dados e foco na métrica real de cashback)
- **Descrição:**
  - Ajuste estratégico do painel de clientes atendendo à solicitação do usuário: substituição do filtro de compras pela métrica real de **Cashback**.
  - Permite acompanhar com total clareza quais clientes tiveram maior benefício de cashback no mês (como *Anatana Aguiar*, *Priscila Queiroz*, *Wilvyhenne Pereira*, etc.) a partir da coluna `cashback` da tabela `phibo_vendas`.
  - Alternador fluído `[ Valor | Cashback ]` com barras proporcionais em tons de esmeralda/teal e somatório do cashback total distribuído no período.

#### [UI/UX & ANIMATION] Pódio Olímpico das Vendedoras Animado & Gamificado
- **Arquivos Atualizados:**
  - `src/index.css` (criação de keyframes CSS e classes: `podium-rise`, `gold-sheen`, `crown-float`, `gold-glow`, `medal-shine`)
  - `src/components/dashboard/SalesRanking.tsx` (implementação de elevação escalonada dos 3 lugares do pódio, feixe de luz refletiva da campeã, badge com estrelas pulsantes, coroa flutuante, micro-interações de hover com elevação 3D e contador dinâmico com efeito count-up nos valores)
  - `RULES.md` (especificação canônica na Seção 3.4)
- **Descrição:**
  - O pódio das vendedoras agora possui animações de alto nível que tornam a experiência comercial viva e motivacional.
  - A vendedora Campeã (1º lugar) conta com pulso dourado ambiente, feixe de luz dourada periódica atravessando o card e coroa flutuante.
  - Valores monetários agora realizam transição fluída (count-up) ao carregar ou alternar períodos.

#### [BUGFIX & SINCRONIZAÇÃO] Alinhamento da Meta Mínima (R$ 120.000,00) e Sincronização Reativa
- **Arquivos Atualizados:**
  - `src/hooks/useAdminConfig.ts` (conversão explícita para `Number()` dos campos numéricos retornados do Supabase e sincronização imediata com `localStorage`)
  - `src/pages/admin/MetasVendedoras.tsx` e `src/pages/admin/AdminDashboard.tsx` (adição de `useEffect` reativo para manter os inputs de formulário sempre sincronizados quando os dados do Supabase forem carregados ou alterados)
  - Banco de Dados Supabase (`phibo_metas_mensais`): Atualizado registro de Outubro/2026 para `meta_minima = 120000.00`, garantindo consonância total com os 120 mil cadastrados.
- **Descrição:**
  - Corrigida a divergência em que o banco possuía um registro residual de testes (125 mil), enquanto a tela exibia 120 mil.
  - O cálculo do ritmo diário agora reflete com exatidão a **Meta Mínima de R$ 120.000,00**:
    - Ritmo Diário: $\text{R\$ 120.000,00} \div 26 = \text{R\$ 4.615,38/dia}$ (exibido como ~R$ 4.6K nos cards).
    - Meta Semana 1 (3 dias úteis): R$ 13.846,15.
    - Meta Semana 2 (6 dias úteis): R$ 27.692,31.
  - Validação via Browser Subagent confirmada nas capturas `acompanhamento_semanal_120k_1792525826302.png` e `metas_da_loja_120k_1792525815889.png`.

#### [UI/UX & DESIGN SYSTEM] Suavização e Refinamento Ergonômico do Modo Claro
- **Arquivos Atualizados:**
  - `src/index.css` (redefinição das variáveis de `:root`: `--background` atualizado para slate neutro suave `hsl(220 18% 96%)` / `#f1f4f8`; `--card` mantido em branco puro elevado `hsl(0 0% 100%)` com `--border` nítido `hsl(220 13% 88%)`; e `--secondary` em `hsl(220 14% 92%)`)
  - `RULES.md` (documentação da Regra 8 de Ergonomia Visual e Modo Claro Suave na Seção 1)
- **Descrição:**
  - Atendida a solicitação do usuário para deixar o layout "menos branco" no modo claro, eliminando o ofuscamento estéril onde o fundo e os cartões eram ambos `#ffffff`.
  - O modo escuro foi mantido 100% inalterado (conforme elogio do usuário).
  - No modo claro, a tela agora apresenta uma transição elegante: fundo slate neutro suave que descansa a visão, cartões brancos que saltam aos olhos com elevação e profundidade tátil, e controles operacionais (dropdowns, botões de filtro, badges) com contraste sólido.
  - Validação E2E no navegador com capturas `dashboard_light_mode_1792526243643.png` e `metas_light_mode_1792526257463.png`.
