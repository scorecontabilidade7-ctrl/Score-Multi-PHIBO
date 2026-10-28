export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'seller';

export interface PhiboClienteConfig {
  id: string;
  nome_loja: string;
  email_login_phibo: string | null;
  senha_login_phibo: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhiboVenda {
  id: number;
  cliente_id: string;
  origem: string | null;
  data_venda: string;
  hora_venda: string;
  cliente_nome: string | null;
  cliente_telefone: string | null;
  cliente_completo: string | null;
  vendedor: string | null;
  quantidade: number;
  sub_total: number;
  desconto: number;
  trocas: number;
  cashback: number;
  frete: number;
  valor_total: number;
  created_at: string;
}

export interface PhiboPerfil {
  id: string;
  cliente_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  nome_vendedor: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhiboVendedorConfig {
  id: string;
  cliente_id: string;
  nome_vendedor: string;
  url_foto: string | null;
  peso_meta: number;
  ativo: boolean;
  created_at: string;
}

export interface PhiboDistributionConfig {
  mode: 'uniform' | 'week' | 'day';
  weeklyWeights?: number[];
  dailyWeights?: { [key: string]: number };
}

export interface PhiboMetasMensais {
  id: string;
  cliente_id: string;
  year_month: string;
  dias_uteis: number;
  meta_minima: number;
  meta_top1: number;
  meta_top2: number;
  meta_master: number;
  perc_minima: number;
  perc_top1: number;
  perc_top2: number;
  perc_master: number;
  distribution_mode: 'uniform' | 'week' | 'day';
  distribution_config?: PhiboDistributionConfig;
  created_at: string;
}

export interface PhiboCampanha {
  id: string;
  cliente_id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  meta_valor: number;
  created_at: string;
}

export interface DashboardKPIs {
  faturamento_total: number;
  total_atendimentos: number;
  total_pecas: number;
  ticket_medio: number;
  pa_loja: number;
}

export interface TimelineEntry {
  data_venda: string;
  qtd_vendas: number;
  qtd_pecas: number;
  faturamento: number;
}

export interface RankingVendedorEntry {
  vendedor: string;
  url_foto: string;
  qtd_vendas: number;
  qtd_pecas: number;
  faturamento: number;
  ticket_medio: number;
  pa: number;
}

export interface OrigemVendaEntry {
  origem: string;
  qtd_vendas: number;
  faturamento: number;
  percentual: number;
}

export interface DepartamentoEntry {
  departamento: string;
  faturamento: number;
  percentual: number;
  qtd_pecas?: number;
}

export interface ClienteEntry {
  cliente_nome: string;
  faturamento: number;
  qtd_compras: number;
  cashback?: number;
  qtd_pecas?: number;
  ticket_medio?: number;
  percentual?: number;
}

export interface DashboardDataResponse {
  kpis: DashboardKPIs;
  timeline: TimelineEntry[];
  ranking_vendedores: RankingVendedorEntry[];
  origens: OrigemVendaEntry[];
  departamentos?: DepartamentoEntry[];
  clientes?: ClienteEntry[];
  clientes_cashback?: ClienteEntry[];
}

