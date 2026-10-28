# Regras de Negócio e Especificação de Módulos | BlushFit

Este documento reúne todas as **regras de negócio, fórmulas de cálculo, permissões e especificações operacionais** de cada módulo do sistema. Serve como o manual de referência canônico para gestores, desenvolvedores e para a parametrização do cliente **BlushFit**.

---

## 1. Princípios e Regras Gerais do Sistema

1. **Fuso Horário Padrão:** Toda a lógica de datas, virada de mês e cálculo diário é estritamente vinculada ao fuso horário brasileiro `America/Sao_Paulo` (Horário de Brasília), evitando discrepâncias em servidores ou máquinas de clientes em UTC.
2. **Moeda e Formatação:** Valores monetários seguem o padrão Real Brasileiro (`pt-BR`, `R$ 1.234,56`). Percentuais utilizam vírgula como separador decimal.
3. **Isolamento de Loja (`cliente_id`):** Nenhum dado de vendas, metas, estoque ou comissão de uma loja pode vazar para outra. Toda consulta operacional exige um `cliente_id` válido e é protegida por RLS no banco de dados.
4. **Resiliência e Fallback:** Caso a loja selecionada seja a Loja Modelo (`MOCK_STORE_ID`), o sistema opera com geradores de dados simulados sem quebrar chamadas ou exibir erros em tela.
5. **Multi-Sessão Simultânea sem Desconexão:** Múltiplas pessoas ou dispositivos podem acessar o sistema ao mesmo tempo (inclusive sob o mesmo perfil/loja) sem que uma conexão derrube ou force o logout da outra.
6. **Isolamento de Namespace (`phibo_`):** Todas as tabelas, índices e Stored Procedures analíticas utilizam obrigatoriamente o prefixo `phibo_` para garantir total separação de dados em bancos de dados Supabase compartilhados com outros projetos.
7. **Identidade Visual e Paleta Canônica da Marca:** A cor primária oficial da BlushFit é o tom rosa/blush `#c0577f` (definida nos tokens CSS como HSL `337 48% 55%`), extraída diretamente da tipografia oficial da marca para harmonizar cabeçalhos, botões, gráficos e destaques.
8. **Ergonomia Visual e Modo Claro Suave:** Para eliminar o ofuscamento do branco puro estéril e conferir profundidade estética, o fundo geral da aplicação no modo claro adota um tom neutro suave slate-gray (`hsl(220 18% 96%)` / `#f1f4f8`), enquanto os cartões e módulos analíticos utilizam branco puro elevado (`hsl(0 0% 100%)`) com bordas nítidas (`hsl(220 13% 88%)`), criando separação tátil e conforto visual prolongado. O modo escuro permanece 100% preservado com sua paleta escura de alto contraste.

---

## 2. Módulo de Autenticação, Perfis e Controle de Acesso (RBAC)

### 2.1. Papéis de Usuário (Roles)

| Papel (`role`) | Escopo de Acesso | Capacidades e Restrições |
|---|---|---|
| **`super_admin`** | Global (Todas as lojas) | Acesso irrestrito a todas as lojas cadastradas, relatórios, configurações e portal administrativo (`/admin`). Pode criar e alterar usuários, metas e permissões de qualquer unidade. |
| **`admin`** | Por Loja (Vinculada) | Acesso administrativo às lojas que possui em `multi_user_roles`. Pode gerenciar metas da sua loja, monitoramento de ações e visualizar dashboards. |
| **`manager`** | Por Loja (Vinculada) | Acesso de gestão comercial às lojas vinculadas. Acompanha faturamento, estoque, comissões e ranking, sem permissão para criar outros usuários administradores. |
| **`seller`** | Pessoal / Vendedor | Acesso focado no seu próprio desempenho. Possui o campo `nome_vendedor` preenchido em `multi_profiles`. Pode ser redirecionado diretamente ao seu perfil (`/vendedor/:name`). |

### 2.2. Fluxo de Sessão e Guardas de Rota
- **`/login`:** Autenticação via e-mail e senha no Supabase Auth.
- **`/welcome`:** Tela obrigatória para seleção de unidade. Se o usuário tiver acesso a apenas uma loja, pode ser direcionado automaticamente ao seu dashboard.
- **`AdminGuard`:** Envolve todas as rotas sob `/admin/*`. Se o usuário autenticado não possuir papel `admin` ou `super_admin`, ele é barrado com mensagem explicativa e redirecionado.

---

## 3. Módulo Dashboard Comercial Principal (`/dashboard/:cliente_id`)

O Dashboard consolida a performance comercial da loja no mês ou período selecionado.

### 3.1. Cards de KPIs Principais (`KPICards`)
1. **Faturamento Total:**
   $$\text{Faturamento} = \sum (\text{valor\_venda} \times \text{quantidade})$$
2. **Quantidade de Vendas (Atendimentos):** Contagem de cupons fiscais únicos emitidos no período selecionado.
3. **Ticket Médio:**
   $$\text{Ticket Médio} = \frac{\text{Faturamento Total}}{\text{Quantidade de Vendas}}$$
4. **Total de Comissões:**
   - **Modo Dinâmico Ativo:** Soma das comissões calculadas conforme as faixas de metas alcançadas por cada vendedor.
   - **Modo Fixo:** Soma das comissões brutas registradas na tabela `gigatech_vendedores`.

### 3.2. Filtros Dinâmicos (`DashboardFilters`)
- **Seletor de Mês:** Permite navegar entre os meses do ano atual.
- **Período Personalizado:** Permite selecionar intervalo de datas (`dataInicio` e `dataFim`).
- **Filtro por Vendedor:** Filtra toda a tela para os dados de uma única vendedora.
- **Filtro por Departamento:** Isola as vendas de um setor específico (ex: Vestuário, Calçados, Acessórios).

### 3.3. Linha do Tempo de Vendas (`SalesTimeline`)
- Gráfico de linha/área demonstrando as vendas dia a dia no mês.
- Permite identificar picos de faturamento (fins de semana, promoções, datas comemorativas) e comparar com o ritmo esperado.

### 3.4. Ranking de Vendedores & Pódio Animado (`SalesRanking` / `SalesPodium`)
- Exibe os vendedores ordenados de forma decrescente por faturamento.
- **Pódio Visual Dinâmico e Animado:**
  - **Entrada Olímpica em Escada:** Efeito de subida progressiva dos cartões com delay escalonado (3º Lugar → 2º Lugar → 1º Lugar Campeã).
  - **Aura & Shimmer da Campeã (1º Lugar):** Pulso dourado suave de iluminação ambiente (`gold-glow`), feixe de luz refletiva periódica (`gold-sheen`), badge com estrelas e coroa flutuante (`crown-float`).
  - **Contador Fluído de Faturamento (Count-Up):** Números rolam suavemente na tela na virada ou alternância de meses.
  - **Micro-interações de Hover:** Efeito de elevação 3D (`-translate-y-2`) e sombra ampliada ao passar o mouse.
- Exibe avatar/foto do vendedor, total vendido, quantidade de operações e ticket médio individual.
- Link direto para abrir o perfil individual (`/vendedor/:name`).

### 3.5. Painel de Vendas x Clientes & Cashback (`DeptosClientesCard` / `ClientesVendasCard`)
Substitui o antigo card de canais, focando 100% na relação real de **Vendas por Cliente** e **Cashback** captada pelo ERP PHIBO sem criação de categorias artificiais:
1. **Origem dos Dados:** Extraído diretamente da tabela `phibo_vendas` agrupando por `cliente_nome` e totalizando `SUM(valor_total)`, `SUM(cashback)` e `COUNT(id)` (compras).
2. **Alternador de Análise (`[ Valor | Cashback ]`):**
   - **Visão Valor (R$):** Ordena as clientes por faturamento acumulado decrescente, destacando os clientes de maior volume de compra e receita para a loja.
   - **Visão Cashback (R$):** Identifica as clientes com maior benefício de cashback acumulado/resgatado no período, revelando a adesão ao programa de fidelidade e recompensa do ERP PHIBO.
3. **Indicadores no Card:** Barras horizontais estilizadas proporcionais ao maior valor, valor em R$, percentual sobre a receita total/cashback da loja e rodapé dinâmico com o montante total de cashback distribuído.

### 3.6. Disposição Arquitetural do Dashboard
- **Linha 1:** Cards de KPIs Principais (`KPICards`).
- **Linha 2:** Régua e Termômetro das 4 Metas (`GoalsTracker`).
- **Linha 3 (Grid Intermediário):**
  - **Coluna Esquerda (7 cols):** Pódio Visual das Vendedoras (`SalesPodium` com 1º, 2º e 3º lugar).
  - **Coluna Direita (5 cols):** Painel Departamentos & Principais Clientes (`DeptosClientesCard`).
- **Linha 4 (Largura Total):** Evolução Diária de Vendas (`SalesTimeline`), garantindo espaçamento amplo para leitura dos 30/31 dias do mês.
- **Linha 5 (Largura Total):** Tabela Operacional Completa por Vendedora (`SalesRankingTable`).

---

## 4. Módulo de Metas e Comissões Dinâmicas

Este é o coração motivacional e de governança do sistema. Ele substitui comissões fixas engessadas por um **modelo meritocrático progressivo**.

### 4.1. Parametrização dos Níveis de Meta (`multi_parametro_metas`)
Cada loja define seus patamares de excelência. A configuração padrão possui 4 níveis:
1. **Meta Mínima:** Patamar de sobrevivência comercial (Ex: 1,0% de comissão).
2. **Meta Top 1:** Bom desempenho inicial (Ex: 1,5% de comissão).
3. **Meta Top 2:** Desempenho acima da média (Ex: 2,0% de comissão).
4. **Meta Master:** Superação excepcional de resultados (Ex: 2,5% de comissão).

> Caso a loja não tenha metas cadastradas, o sistema avisa o gestor com botão de atalho para a tela `/admin/metas`.

### 4.2. Distribuição Temporal da Meta Mensal
Uma meta mensal de R$ 200.000 não ocorre de forma linear. O sistema suporta 3 modos de distribuição em `multi_monthly_goals`:
- **Uniforme (`uniform`):** Divide o valor total igualmente pelo número de dias úteis cadastrados.
- **Por Semana (`week`):** Define pesos percentuais para cada semana do mês (ex: 20% na semana 1, 20% na semana 2, 25% na semana 3, 35% na semana 4 de fechamento).
- **Por Dia (`day`):** Define pesos percentuais customizados para cada dia do mês.

### 4.3. Cálculo da Meta Individual do Vendedor
A meta da loja é rateada entre os vendedores ativos no mês:
$$\text{Meta Individual do Vendedor} = \frac{\text{Meta da Loja}}{\text{Quantidade de Vendedores Ativos no Mês}}$$

*(Suporta opcionalmente ponderação por peso de vendedor configurado em `multi_vendedores_config.peso_meta`).*

### 4.4. Regra de Aplicação da Comissão Dinâmica
Para cada vendedor:
1. Ordena-se os parâmetros de metas do maior valor individual para o menor (Master → Top 2 → Top 1 → Mínima).
2. O sistema compara o `Total Vendido` pelo vendedor contra o patamar:
   - Se $\text{Vendas} \ge \text{Meta Individual Master} \implies \text{Comissão} = \text{Vendas} \times \%_{\text{Master}}$
   - Senão, se $\text{Vendas} \ge \text{Meta Individual Top 2} \implies \text{Comissão} = \text{Vendas} \times \%_{\text{Top 2}}$
   - Senão, se $\text{Vendas} \ge \text{Meta Individual Top 1} \implies \text{Comissão} = \text{Vendas} \times \%_{\text{Top 1}}$
   - Senão, se $\text{Vendas} \ge \text{Meta Individual Mínima} \implies \text{Comissão} = \text{Vendas} \times \%_{\text{Mínima}}$
   - Abaixo da menor meta $\implies \text{Comissão Dinâmica} = 0\%$ (ou comissão base fixa, conforme a política da loja).

### 4.5. Acompanhamento Semanal e Diário de Metas (`AcompanhamentoSemanalMetas`)
Disponível na aba principal de **Vendedoras & Metas** (`/metas`), este módulo oferece aos gestores e vendedoras a visão tática do ritmo de vendas do mês dividido semana a semana:

1. **Controles Superiores Dinâmicos:**
   - **Tipo de Meta (`[ Meta Mínima | Meta Padrão | Super Meta ]`):** Alterna instantaneamente a meta de referência (Mínima, Top 1 / Padrão ou Master / Super), recalculando em tempo real todas as metas semanais, ritmo diário e status de superação.
   - **Tipo de Comissão (`[ Dinâmica | Fixa ]`):** Sinaliza a política de remuneração variável adotada no período analisado.
   - **Mês Analisado:** Permite navegar entre o mês vigente e os meses anteriores.

2. **Métricas de Ritmo e Pace Diário:**
   - Exibe a meta mensal de referência em R$ e o ritmo diário exigido:
     $$\text{Ritmo Diário} = \frac{\text{Meta Referência Selecionada}}{\text{Dias Úteis Cadastrados}}$$

3. **Cartão Semanal Consolidado (Semana 1 a Semana 5):**
   - Agrupa os dias comerciais (Segunda a Sábado) da semana correspondente.
   - **Meta Semanal:** Calculada proporcionalmente à quantidade de dias úteis da semana multiplicada pelo ritmo diário.
   - **Realizado:** Soma do faturamento bruto real obtido nas datas da semana.
   - **Diferença:** Realizado menos a Meta Semanal (com sinal positivo e cor verde para saldo favorável; sinal negativo e cor vermelha para deficit).
   - **Barra de Progresso Ciano (`#1da1aa`):** Preenchimento proporcional ao percentual de atingimento da semana.
   - **Badge de Status:** Exibe `🎯 Meta Superada! (100%)` em verde quando o realizado iguala ou supera a meta semanal, ou `🎯 Em Andamento (X%)` durante o progresso.

4. **Matriz de Cards Diários com Sinalização Inteligente:**
   - Cada dia exibe o dia abreviado com a data (ex: `Seg 5/10`), a meta diária de referência (ex: `META: R$ 4.8K`) e o faturamento real alcançado.
   - **Borda Verde Esmeralda (`border-emerald-500`):** Aplicada quando o faturamento do dia atingiu ou superou a meta diária.
   - **Borda Vermelha (`border-rose-500`):** Aplicada quando o dia teve movimentação e fechou abaixo da meta diária esperada.
   - **Borda Neutra / Opaca:** Aplicada a dias futuros ou sem operações registradas.

---

## 5. Módulo de P.A (Peças por Atendimento) e Ticket Médio (`PATable`)

O indicador de **Peças por Atendimento (P.A)** mede a eficiência da equipe em realizar vendas adicionais (upsell / cross-sell).

### 5.1. Fórmulas de Cálculo
- **P.A Individual:**
  $$\text{P.A}_{\text{vendedor}} = \frac{\text{Quantidade Total de Peças Vendidas}}{\text{Total de Atendimentos (Cupons)}}$$
- **P.A Médio da Loja:**
  $$\text{P.A}_{\text{loja}} = \frac{\sum \text{Peças Vendidas na Loja}}{\sum \text{Atendimentos da Loja}}$$
- **Diferencial vs. Loja (`diff_vs_loja`):**
  $$\Delta_{\text{P.A}} = \text{P.A}_{\text{vendedor}} - \text{P.A}_{\text{loja}}$$
  - Se $\Delta > 0$: Vendedor puxa a média da loja para cima (destaque verde 🟢).
  - Se $\Delta < 0$: Vendedor com índice abaixo da média (destaque âmbar/vermelho 🔴).

---

## 6. Módulo Perfil do Vendedor (`SellerProfile` / `/vendedor/:name`)

Página de inteligência individual desenhada para reuniões de feedback 1:1 e autoacompanhamento do colaborador.

### 6.1. Funcionalidades e Indicadores
- **Cards do Vendedor:** Total vendido, comissão calculada (com toggle Dinâmica/Fixa), P.A e ticket médio individual.
- **Gráfico de Evolução com Linha de Meta:** Linha de tendência diária do vendedor contra a linha de meta projetada para o período.
- **Mix de Departamentos:** Gráfico demonstrando quais categorias de produtos o vendedor tem mais facilidade ou dificuldade de vender.
- **Performance por Dia da Semana:** Identifica quais dias da semana geram maior receita para aquele profissional (ex: sábados fortes vs. terças fracas).
- **Projeção de Fechamento:** Estimativa de faturamento final caso o ritmo de vendas diárias atual seja mantido até o último dia do mês.

---

## 7. Módulo de Gestão de Estoque e Curva ABC (`EstoqueDashboard` / `/estoque/:cliente_id`)

Integração entre o saldo de estoque físico e a velocidade real de escoamento das vendas.

### 7.1. Classificação da Curva ABC
Calculada sobre a receita gerada por cada SKU nos últimos $N$ dias (padrão: 30 dias):
- **Classe A:** SKUs responsáveis pelos primeiros **80% do faturamento acumulado** (alta prioridade).
- **Classe B:** SKUs responsáveis pelos próximos **15% do faturamento** (80% a 95% acumulado).
- **Classe C:** SKUs responsáveis pelos **5% finais do faturamento** (> 95% acumulado).
- **Sem Venda:** Produtos com estoque físico positivo, mas sem registro de venda no período analisado.

### 7.2. Métricas de Giro e Cobertura
- **Venda Média Diária:**
  $$\text{avg\_daily\_sales} = \frac{\text{Quantidade Total Vendida no Período}}{N \text{ dias}}$$
- **Dias de Cobertura (Days of Supply):**
  $$\text{days\_of\_supply} = \begin{cases} \frac{\text{Estoque Físico Atual}}{\text{avg\_daily\_sales}}, & \text{se } \text{avg\_daily\_sales} > 0 \\ 9999, & \text{se } \text{avg\_daily\_sales} = 0 \end{cases}$$

### 7.3. Matriz de Status Operacional de Reposição

| Status | Regra de Disparo | Ação Recomendada |
|---|---|---|
| 🚨 **Ruptura Crítica** | Produto da **Curva A** com $\text{days\_of\_supply} \le 15$ dias | Compra ou transferência urgente de fornecedor; risco iminente de perda de receita. |
| ⚠️ **Atenção** | Produto da **Curva A** com $15 < \text{days\_of\_supply} \le 30$ dias | Planejar pedido de reposição no próximo ciclo de compras. |
| 🟢 **Estoque Saudável** | Produto **Curva A ou B** com $31 \le \text{days\_of\_supply} \le 90$ dias | Nível de estoque ideal para a operação. |
| 📦 **Regular** | Produtos que não se enquadram nas situações de risco crítico ou saudável | Manter acompanhamento regular. |
| 🟡 **Excesso de Estoque** | $\text{days\_of\_supply} > 120$ dias com última venda recente ($< 90$ dias) | Suspender novas compras; avaliar inclusão em promoções de giro. |
| 🏷️ **Bazar (Obsoleto)** | $\text{avg\_daily\_sales} = 0$ ou $\text{days\_of\_supply} > 120$ dias **sem vendas há mais de 90 dias** | Liquidar em bazar, queima de estoque ou negociar devolução com o fornecedor. |

---

## 8. Módulo de Monitoramento de Campanhas Promocionais (`MonitoramentoAcoes`)

Acompanhamento de eventos comerciais pontuais (ex: Dia das Mães, Black Friday, Semana do Consumidor, Lançamento de Coleção).

### 8.1. Regras Operacionais
- Cada ação é cadastrada com: `nome`, `start_date`, `end_date` e `target_value` (meta em R$).
- O sistema executa a RPC `multi_get_monitoramento_acoes` que agrega em tempo real as vendas da loja ocorridas estritamente entre `start_date 00:00:00` e `end_date 23:59:59`.
- **Cálculo de Atingimento:**
  $$\%_{\text{Atingido}} = \left(\frac{\text{Vendas Realizadas no Período}}{\text{target\_value}}\right) \times 100$$
- Indicadores visuais de status: Não iniciada (futura), Em andamento, Concluída com sucesso ($\ge 100\%$) ou Concluída abaixo da meta.

---

## 9. Módulo Administrativo (`/admin`)

Área restrita à gestão e governança da plataforma.

### 9.1. Gestão de Vendedoras & Metas (`/metas`)
- **Acesso Permitido:** `admin` (Gerente), `manager` e `super_admin` (Diretoria).
- **Metas da Loja:** Parametrização dos 4 patamares de metas (Mínima, Top 1, Top 2, Master), comissões progressivas e dias úteis.
- **Vendedoras & Fotos:** Padronização de grafias do ERP PHIBO, upload direto de fotos (PNG, JPG, prints da área de transferência) e ativação/desativação no rateio.

### 9.2. Painel de Governança Multi-Tenant & Lojas PHIBO (`/governanca`)
- **Acesso Permitido:** Exclusivo `super_admin` (Diretoria / Administrador Global do SaaS).
- **Acoplamento de Lojas:** Cadastro de novos lojistas que utilizam o ERP PHIBO com geração de `cliente_id` único e isolamento por Row Level Security (RLS).
- **Governança SaaS:** Monitoramento de todas as unidades ativas no ecossistema sem mistura de dados.

---

## 10. Agente de Inteligência Comercial (n8n & WhatsApp)

O sistema possui integração opcional com agente de inteligência artificial via n8n para resposta de dúvidas comerciais no WhatsApp.

### 10.1. Regras Inegociáveis do Agente
1. **Identificação da Empresa:** O assistente deve sempre se apresentar no tom de voz da **BlushFit**.
2. **Contexto de Loja Obrigatório:** Se um usuário com acesso a múltiplas lojas perguntar *"Quanto vendemos hoje?"*, o agente **não pode** escolher uma loja aleatória. Ele deve responder perguntando: *"De qual loja você gostaria de saber? (Loja A, Loja B...)"*, a menos que o usuário solicite o total consolidado da rede.
3. **Tratamento Rigoroso de Datas:**
   - Perguntas de "hoje" ou "ontem" utilizam ferramentas diárias (`YYYY-MM-DD`).
   - Perguntas de "mês atual" ou meses específicos utilizam ferramentas mensais (`YYYY-MM`).
   - Trimestres seguem rigorosamente o calendário oficial (Q1: Jan-Mar, Q2: Abr-Jun, Q3: Jul-Set, Q4: Out-Dez).
4. **Formatação Nativa de WhatsApp:** Proibido usar markdown com hashtags `#` ou negrito duplo `**`. Uso exclusivo de asterisco simples `*texto*`, sublinhado `_texto_` e emojis demarcadores.
5. **Zero Alucinação de Números:** Caso uma ferramenta retorne erro ou ausência de dados, o agente é expressamente proibido de inventar faturamento ou comissões. Deve informar com clareza o problema técnico.
