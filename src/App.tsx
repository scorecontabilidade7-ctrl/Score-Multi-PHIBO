import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Building2, Moon, Sun, LogOut, LogIn, LayoutDashboard, Megaphone, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './pages/Dashboard';
import { SellerProfile } from './pages/SellerProfile';
import { Login } from './pages/Login';
import { Campanhas } from './pages/Campanhas';
import { MetasVendedoras } from './pages/admin/MetasVendedoras';
import { GovernancaLojas } from './pages/admin/GovernancaLojas';
import { BlushFitLogo } from './components/common/BlushFitLogo';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAuthenticated, signOut } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-sm">Super Admin</span>;
      case 'admin':
        return <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">Gerente</span>;
      case 'seller':
        return <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">Vendedora</span>;
      default:
        return <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-sm">Usuário</span>;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Top Header Global (oculto na tela de login) */}
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="*"
          element={
            <>
              <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md px-6 py-2.5 flex items-center justify-between shadow-xs">
                {/* Logo & Marca */}
                <div className="flex items-center gap-6">
                  <div 
                    onClick={() => {
                      if (profile?.role === 'seller') {
                        navigate(`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`);
                      } else {
                        navigate('/');
                      }
                    }} 
                    className="flex items-center gap-3 cursor-pointer group"
                    title={profile?.role === 'seller' ? 'Minhas Vendas' : 'Ir para o Dashboard Principal'}
                  >
                    <BlushFitLogo height={32} showTag={true} />
                  </div>

                  {/* Abas de Navegação Principal: Visível apenas para Gestão (Gerentes / Gestores / Diretoria) */}
                  {profile?.role !== 'seller' && (
                    <nav className="hidden md:flex items-center gap-1.5 pl-4 border-l border-border">
                      <button
                        onClick={() => navigate('/')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          location.pathname === '/'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => navigate('/campanhas')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          location.pathname === '/campanhas'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                        <span>Campanhas</span>
                      </button>

                      <button
                        onClick={() => navigate('/metas')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          location.pathname === '/metas' || location.pathname === '/admin'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Vendedoras & Metas</span>
                      </button>

                      {/* Governança: Exclusivo Super Admin (Cadastrar Lojas PHIBO no SaaS) */}
                      {profile?.role === 'super_admin' && (
                        <button
                          onClick={() => navigate('/governanca')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            location.pathname === '/governanca'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Governança</span>
                        </button>
                      )}
                    </nav>
                  )}
                </div>

                {/* Controles de Loja, Tema e Perfil */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground border border-border">
                    <Building2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Loja: <strong className="text-foreground">BlushFit (Piloto)</strong></span>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Alternar Tema"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  </button>

                  {/* Usuário Autenticado */}
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2 pl-2 border-l border-border">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-rose-500/30">
                        {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 'BF'}
                      </div>
                      <div className="hidden md:block text-left text-xs leading-tight">
                        <p className="font-bold text-foreground">{profile?.full_name || user?.email}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getRoleBadge(profile?.role)}
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Encerrar Sessão"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Entrar</span>
                    </button>
                  )}
                </div>
              </header>

              <main>
                <Routes>
                  {/* Dashboard Geral: Restrito a Gestores/Gerentes/Super Admin */}
                  <Route
                    path="/"
                    element={
                      profile?.role === 'seller' ? (
                        <Navigate to={`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`} replace />
                      ) : (
                        <Dashboard />
                      )
                    }
                  />

                  {/* Tela de Vendas do Vendedor */}
                  <Route path="/vendedor/:name" element={<SellerProfile />} />

                  {/* Campanhas Promocionais: Restrito à Gestão */}
                  <Route
                    path="/campanhas"
                    element={
                      profile?.role === 'seller' ? (
                        <Navigate to={`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`} replace />
                      ) : (
                        <Campanhas />
                      )
                    }
                  />

                  {/* Vendedoras & Metas: Restrito à Gestão */}
                  <Route
                    path="/metas"
                    element={
                      profile?.role === 'seller' ? (
                        <Navigate to={`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`} replace />
                      ) : (
                        <MetasVendedoras />
                      )
                    }
                  />

                  {/* Governança Multi-lojas: Restrito a Super Admin */}
                  <Route
                    path="/governanca"
                    element={
                      profile?.role === 'super_admin' ? (
                        <GovernancaLojas />
                      ) : profile?.role === 'seller' ? (
                        <Navigate to={`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`} replace />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />

                  <Route path="/admin" element={<Navigate to="/metas" replace />} />
                  <Route path="/admin/lojas" element={<Navigate to="/governanca" replace />} />

                  {/* Rota Padrão / Fallback */}
                  <Route
                    path="*"
                    element={
                      profile?.role === 'seller' ? (
                        <Navigate to={`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`} replace />
                      ) : (
                        <Navigate to="/" replace />
                      )
                    }
                  />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
}
