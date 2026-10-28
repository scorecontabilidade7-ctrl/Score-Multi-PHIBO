import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Store,
} from 'lucide-react';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { useAuth } from '../../hooks/useAuth';

export const GovernancaLojas: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  const { lojas, cadastrarNovaLoja } = useAdminConfig();

  const [successMessage, setSuccessMessage] = useState('');
  const [novaLojaNome, setNovaLojaNome] = useState('');
  const [novaLojaEmail, setNovaLojaEmail] = useState('');

  const handleCriarLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaLojaNome) return;
    cadastrarNovaLoja(novaLojaNome, novaLojaEmail);
    setNovaLojaNome('');
    setNovaLojaEmail('');
    setSuccessMessage('Nova loja acoplada ao ecossistema SaaS com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // 1. Se não estiver autenticado, exige login
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Acesso Restrito ao Super Admin</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Esta tela de governança multi-tenant é restrita à Diretoria / Super Admin da plataforma.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          Fazer Login como Super Admin
        </button>
      </div>
    );
  }

  // 2. Se não for Super Admin, bloqueia o acesso
  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Acesso Exclusivo da Diretoria</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Seu perfil de <strong>{profile?.role === 'admin' || profile?.role === 'manager' ? 'Gerente' : 'Colaborador'}</strong> não possui permissão para acoplar ou gerenciar outras lojas do ecossistema SaaS.
          </p>
        </div>
        <button
          onClick={() => navigate('/metas')}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          Ir para Vendedoras & Metas da Loja
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-rose-500" />
                Governança Multi-Tenant & Lojas PHIBO
              </h1>
              <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-md border border-rose-500/30">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Acoplamento de novos clientes lojistas do ERP PHIBO com isolamento total de dados via RLS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/metas')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-rose-500" />
            <span>Ver Vendedoras & Metas</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Formulário de Cadastro de Novo Cliente PHIBO */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            Cadastrar Novo Cliente / Loja no Ecossistema
          </h3>
          <p className="text-xs text-muted-foreground">
            Qualquer lojista que utilize o ERP PHIBO pode ser acoplado instantaneamente com chave única de isolamento
          </p>
        </div>

        <form onSubmit={handleCriarLoja} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
              Nome Fantasia da Loja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={novaLojaNome}
              onChange={(e) => setNovaLojaNome(e.target.value)}
              placeholder="Ex: Academia & Estilo Fitness"
              className="w-full text-xs bg-secondary text-foreground px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">E-mail de Sincronização PHIBO</label>
            <input
              type="email"
              value={novaLojaEmail}
              onChange={(e) => setNovaLojaEmail(e.target.value)}
              placeholder="contato@cliente.com.br"
              className="w-full text-xs bg-secondary text-foreground px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 cursor-pointer transition-all h-9"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Acoplar Loja ao SaaS</span>
          </button>
        </form>
      </div>

      {/* Listagem de Lojas com seus UUIDs */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Lojas Acopladas ao SaaS PHIBO</h3>
            <p className="text-xs text-muted-foreground">
              Cada loja possui seu próprio UUID (`cliente_id`) com isolamento estrito via Row Level Security (RLS)
            </p>
          </div>
          <span className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground border border-border">
            Total: <strong>{lojas.length}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {lojas.map((loja, idx) => (
            <div
              key={loja.id}
              className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-500/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{loja.nome_loja}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      Piloto Oficial
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Ativa
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  E-mail PHIBO: <strong className="text-foreground">{loja.email_login_phibo || 'Nenhum'}</strong>
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  UUID de Isolamento (cliente_id): <code>{loja.id}</code>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Governança RLS Ativa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
