import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, AlertCircle, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loginDemo, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    const result = await signIn(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.error || 'Credenciais inválidas.');
    }
  };

  const handleDemoLogin = (role: 'super_admin' | 'admin' | 'seller', name: string, userEmail: string, nomeVendedor?: string) => {
    loginDemo(role, name, userEmail, nomeVendedor);
    if (role === 'seller' && nomeVendedor) {
      navigate(`/vendedor/${encodeURIComponent(nomeVendedor)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorativo Suave */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Cabeçalho de Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xs mx-auto mb-1">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Inteligência Comercial & Gestão
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Plataforma analítica e de metas integrada ao ERP PHIBO
            </p>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-lg space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com.br"
                  className="w-full text-xs bg-secondary text-foreground pl-9 pr-3 py-2.5 rounded-xl border border-border focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Senha de Acesso</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-secondary text-foreground pl-9 pr-9 py-2.5 rounded-xl border border-border focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Autenticando...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Acesso Rápido de Teste
            </span>
          </div>

          {/* Botões de Acesso Demo Rápido */}
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('super_admin', 'Diretoria Executiva', 'diretoria@blushfit.com.br')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-rose-500/40 bg-secondary/50 hover:bg-secondary text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-500" />
                <span>Entrar como <strong>Diretoria (Super Admin)</strong></span>
              </div>
              <span className="text-[10px] text-muted-foreground">Todas as Lojas</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin', 'Gerente BlushFit', 'gerente@blushfit.com.br')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-rose-500/40 bg-secondary/50 hover:bg-secondary text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>Entrar como <strong>Gerente de Loja</strong></span>
              </div>
              <span className="text-[10px] text-muted-foreground">BlushFit</span>
            </button>

            <button
              onClick={() => handleDemoLogin('seller', 'Juliana Silva', 'juliana.silva@blushfit.com.br', 'Juliana')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-rose-500/40 bg-secondary/50 hover:bg-secondary text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>Entrar como <strong>Vendedora (Juliana Silva)</strong></span>
              </div>
              <span className="text-[10px] text-muted-foreground">Perfil 360º</span>
            </button>
          </div>
        </div>

        {/* Rodapé de Governança */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sessão multi-usuário simultânea ativa (sem desconexão automática)</span>
        </div>
      </div>
    </div>
  );
};
