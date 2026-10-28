import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PhiboPerfil, UserRole } from '../integrations/supabase/types';

export interface AuthContextType {
  user: any | null;
  profile: PhiboPerfil | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (role: UserRole, name: string, email: string, nomeVendedor?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização síncrona do perfil salvo para evitar flashes ou perda de estado
  const [profile, setProfile] = useState<PhiboPerfil | null>(() => {
    try {
      const stored = localStorage.getItem('phibo_demo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('phibo_demo_user');
      if (stored) {
        const p = JSON.parse(stored);
        return { id: p.id, email: p.email };
      }
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('phibo_perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as PhiboPerfil);
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil do Supabase:', err);
    }
  };

  useEffect(() => {
    // 1. Verifica sessão real do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        const storedDemo = localStorage.getItem('phibo_demo_user');
        if (!storedDemo) {
          setUser(null);
          setProfile(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Falha ao autenticar' };
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = (role: UserRole, name: string, email: string, nomeVendedor?: string) => {
    const demoProfile: PhiboPerfil = {
      id: `demo-${role}-${Date.now()}`,
      cliente_id: 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e', // BlushFit
      full_name: name,
      email: email,
      role: role,
      nome_vendedor: nomeVendedor || null,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem('phibo_demo_user', JSON.stringify(demoProfile));
    setProfile(demoProfile);
    setUser({ id: demoProfile.id, email: demoProfile.email });
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('phibo_demo_user');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user || !!profile,
        signIn,
        loginDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
