# Score Multi-PHIBO 🚀

Plataforma analítica, comercial e de gestão de metas **Multi-Tenant** integrada ao **ERP PHIBO**, desenvolvida pela **Score** para redes de varejo físico e e-commerce (Unidade Piloto: **BlushFit**).

---

## 🌟 Funcionalidades Principais

* **📊 Dashboard Comercial Executivo:**
  * Indicadores em tempo real: Faturamento Líquido, Atendimentos, P.A Médio da Loja, Ticket Médio e Comissão Estimada.
  * Pódio dinâmico com fotos das vendedoras, ranking de vendas e taxa de conversão.
  * Curva de Principais Clientes e Cashback acumulado.
  * Gráfico interativo de evolução diária de vendas e ritmo da loja.
  * Filtro multi-seleção inteligente de vendedoras com atalho "Sem Site" (foco em vendedoras humanas).

* **🎯 Gestão de Metas & Comissões Meritocráticas:**
  * Estrutura em 3 patamares: **Meta Mínima (1,0%)**, **Meta Top 1 (1,5%)** e **Meta Master (2,5%)**.
  * Régua de metas da loja com taxa de atingimento visual e ritmo diário necessário.
  * Acompanhamento semanal de ritmo com parametrização de dias úteis e pesos operacionais por vendedora.

* **📢 Campanhas Promocionais Sazonais:**
  * Criação e monitoramento de ações comerciais pontuais (Lançamento de Coleção, Semanas Promocionais, Black Friday).
  * Status automático: Em Andamento, Sucesso, Finalizada ou Programada.
  * Gráfico comparativo de performance (Faturamento vs. Meta e Taxa de Atingimento).

* **👤 Perfil 360º Individual da Vendedora:**
  * Painel exclusivo com KPIs pessoais, projeção de fechamento, P.A individual comparado ao P.A da loja.
  * Régua individual de desbloqueio de comissões meritocráticas.
  * Linha do tempo diária e concentração de volume por dia da semana (análise para reuniões 1:1).

* **🛡️ Governança & Controle de Acesso (RBAC):**
  * **Super Admin (Diretoria):** Gestão multi-lojas e visão global.
  * **Gerente de Loja (Admin):** Gestão da loja, acompanhamento de metas, campanhas e reuniões 1:1.
  * **Vendedora (Seller):** Acesso estritamente restrito ao seu próprio painel de vendas, com bloqueio automático de rotas gerenciais e proteção anti-adulteração de URLs.

* **🎨 Design & Experiência:**
  * Suporte nativo a **Dark Mode** e **Light Mode** com paleta refinada e alto contraste.
  * Totalmente responsivo para smartphones, tablets e desktops de loja.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Estilização** | Tailwind CSS, Lucide Icons, Tailwind Animate |
| **Gráficos** | Recharts |
| **Gerenciamento de Estado & Cache** | TanStack React Query v5 |
| **Roteamento** | React Router DOM v6 |
| **Backend & Banco de Dados** | Supabase (PostgreSQL 15+) |
| **Segurança do Banco** | Row Level Security (RLS) & RPCs Analíticas (`SECURITY DEFINER`) |
| **Exportação** | SheetJS (XLSX) |

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js 18+ ou 20+
* Gerenciador de pacotes (npm, yarn ou pnpm)

### 2. Clonar o Repositório
```bash
git clone https://github.com/scorecontabilidade7-ctrl/Score-Multi-PHIBO.git
cd Score-Multi-PHIBO
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase:
```bash
cp .env.example .env
```

Conteúdo do `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon-aqui
```

### 5. Executar em Modo Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000`

---

## 📦 Build para Produção & Deploy na Vercel

### Build Local
```bash
npm run build
```
O build compila o TypeScript (`tsc -b`) e gera os arquivos estáticos otimizados na pasta `dist/`.

### Deploy na Vercel
1. Conecte o repositório GitHub à sua conta na [Vercel](https://vercel.com).
2. Configure o Framework Preset como **Vite**.
3. Em **Environment Variables**, adicione:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Clique em **Deploy**.

---

## 🔒 Segurança & Privacidade

* **Isolamento Multi-Tenant:** Todas as consultas no banco utilizam `cliente_id` com chaves UUID v4.
* **Row Level Security (RLS):** As tabelas `phibo_vendas`, `phibo_metas_mensais`, `phibo_perfis` e `phibo_campanhas` possuem políticas ativas que impedem leitura e gravação não autorizadas.
* **Proteção de Dados (LGPD):** A procedure analítica agrega métricas financeiras sem trafegar dados sensíveis de clientes (CPF, endereço ou telefone).
* **`.gitignore` Estruturado:** Chaves mestras e arquivos de ambiente nunca são versionados no Git.

---

## 📄 Licença & Propriedade

Desenvolvido para **Score Contabilidade & Inteligência Comercial**.  
Todos os direitos reservados.

