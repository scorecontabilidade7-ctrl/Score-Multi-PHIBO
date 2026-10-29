import { createClient } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { PhiboPerfil } from '../integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lunsyufvxkiivnrhpxpj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Cria credenciais de acesso para uma vendedora no Supabase Auth
 * sem deslogar o Gerente/Administrador atual (sessão isolada).
 */
export async function cadastrarAcessoVendedora({
  nome,
  email,
  senha,
  clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e',
}: {
  nome: string;
  email: string;
  senha: string;
  clienteId?: string;
}) {
  const isolatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await isolatedClient.auth.signUp({
    email: email.trim().toLowerCase(),
    password: senha,
    options: {
      data: {
        full_name: nome,
        role: 'seller',
        nome_vendedor: nome,
        cliente_id: clienteId,
      },
    },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao criar credenciais de acesso da vendedora.');
  }

  return data.user;
}

/**
 * Redefine a senha de uma vendedora através da RPC segura phibo_redefinir_senha_vendedor
 */
export async function redefinirSenhaVendedora(userId: string, novaSenha: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('phibo_redefinir_senha_vendedor', {
      p_user_id: userId,
      p_nova_senha: novaSenha,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data && (data as any).success === false) {
      return { success: false, error: (data as any).error || 'Falha ao redefinir senha' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro de conexão ao redefinir senha.' };
  }
}

/**
 * Busca perfis de vendedoras da loja
 */
export async function buscarPerfisLoja(clienteId: string): Promise<PhiboPerfil[]> {
  try {
    const { data, error } = await supabase
      .from('phibo_perfis')
      .select('*')
      .eq('cliente_id', clienteId);

    if (error || !data) return [];
    return data as PhiboPerfil[];
  } catch {
    return [];
  }
}

