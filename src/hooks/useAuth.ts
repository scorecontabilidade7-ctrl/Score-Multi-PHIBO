import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PhiboPerfil, UserRole } from '../integrations/supabase/types';

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<PhiboPerfil | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inicializa sessão do Supabase ou recupera perfil demo local
  useEffect(() => {
    // 1. Verifica se há uma sessão ativa salva localmente (demo ou supabase)
    const storedDemoUser = localStorage.getItem('phibo_demo_user');
    if (storedDemoUser) {
      try {
        const parsed = JSON.parse(storedDemoUser);
        setProfile(parsed);
        setUser({ id: parsed.id, email: parsed.email });
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('phibo_demo_user');
      }
    }

    // 2. Verifica sessão real do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        if (!localStorage.getItem('phibo_demo_user')) {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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

  // Login de Demonstração Instantâneo para validação
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

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user || !!profile,
    signIn,
    loginDemo,
    signOut,
  };
}
