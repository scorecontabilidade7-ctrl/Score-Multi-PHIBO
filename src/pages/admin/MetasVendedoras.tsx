import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Users,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  ShieldAlert,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { useAuth } from '../../hooks/useAuth';
import { processAndUploadAvatar } from '../../utils/imageUpload';
import { AcompanhamentoSemanalMetas } from '../../components/metas/AcompanhamentoSemanalMetas';
import { cadastrarAcessoVendedora, redefinirSenhaVendedora, buscarPerfisLoja } from '../../utils/sellerAuth';
import { PhiboPerfil } from '../../integrations/supabase/types';

export const MetasVendedoras: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, loading } = useAuth();
  const isSeller = profile?.role === 'seller';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clienteId = 'e4190b32-62e4-4ae8-a8f1-6b8b8fcac49e';

  const {
    vendedores,
    atualizarVendedor,
    cadastrarVendedor,
  } = useAdminConfig();

  const [activeTab, setActiveTab] = useState<'acompanhamento' | 'vendedores'>('acompanhamento');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Perfis do Supabase Auth para cruzar com as vendedoras
  const [perfisLoja, setPerfisLoja] = useState<PhiboPerfil[]>([]);
  const [loadingPerfis, setLoadingPerfis] = useState(false);

  // Estados para cadastro de nova vendedora e upload de foto
  const [novoVendedorNome, setNovoVendedorNome] = useState('');
  const [novoVendedorFoto, setNovoVendedorFoto] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tableUploadLoadingId, setTableUploadLoadingId] = useState<string | null>(null);

  // Estados para credenciais de acesso no formulário de cadastro
  const [habilitarCredenciais, setHabilitarCredenciais] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [isSubmittingNovo, setIsSubmittingNovo] = useState(false);

  // Estados do Modal de Gestão/Troca de Senha
  const [modalVendedor, setModalVendedor] = useState<{ nome: string; perfil?: PhiboPerfil | null } | null>(null);
  const [modalEmail, setModalEmail] = useState('');
  const [modalSenha, setModalSenha] = useState('');
  const [showModalSenha, setShowModalSenha] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const carregarPerfis = async () => {
    setLoadingPerfis(true);
    try {
      const perfis = await buscarPerfisLoja(clienteId);
      setPerfisLoja(perfis);
    } finally {
      setLoadingPerfis(false);
    }
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const url = await processAndUploadAvatar(file, novoVendedorNome || 'vendedor');
      setNovoVendedorFoto(url);
      setSuccessMessage('Foto processada e pronta para cadastro!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleTablePhotoChange = async (vendedorId: string, vendedorNome: string, file: File) => {
    setTableUploadLoadingId(vendedorId);
    try {
      const url = await processAndUploadAvatar(file, vendedorNome);
      await atualizarVendedor(vendedorId, { url_foto: url });
      setSuccessMessage(`Foto de ${vendedorNome} atualizada com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar foto na tabela:', err);
    } finally {
      setTableUploadLoadingId(null);
    }
  };

  const handleCriarVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoVendedorNome) return;
    setIsSubmittingNovo(true);
    setErrorMessage('');

    try {
      // 1. Cadastra na configuração da loja
      await cadastrarVendedor(novoVendedorNome, novoVendedorFoto, 1.0);

      // 2. Se optou por criar credenciais de login
      if (habilitarCredenciais) {
        if (!novoEmail || !novaSenha) {
          throw new Error('Informe o e-mail e a senha para gerar o login da vendedora.');
        }
        if (novaSenha.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
        await cadastrarAcessoVendedora({
          nome: novoVendedorNome,
          email: novoEmail,
          senha: novaSenha,
          clienteId,
        });
        await carregarPerfis();
        setSuccessMessage(`Vendedora ${novoVendedorNome} cadastrada com login e senha ativos!`);
      } else {
        setSuccessMessage(`Vendedora ${novoVendedorNome} cadastrada com sucesso!`);
      }

      setNovoVendedorNome('');
      setNovoVendedorFoto('');
      setNovoEmail('');
      setNovaSenha('');
      setHabilitarCredenciais(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao cadastrar vendedora ou credenciais.');
    } finally {
      setIsSubmittingNovo(false);
    }
  };

  const abrirModalCredenciais = (nome: string) => {
    const perfil = perfisLoja.find(
      (p) =>
        p.nome_vendedor?.trim().toLowerCase() === nome.trim().toLowerCase() ||
        p.full_name?.trim().toLowerCase() === nome.trim().toLowerCase()
    );
    setModalVendedor({ nome, perfil });
    setModalEmail(perfil?.email || '');
    setModalSenha('');
    setModalError('');
    setShowModalSenha(false);
  };

  const handleSalvarModalCredenciais = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalVendedor) return;
    setModalLoading(true);
    setModalError('');

    try {
      if (modalVendedor.perfil) {
        // Usuário já possui conta: altera a senha
        if (!modalSenha || modalSenha.length < 6) {
          throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
        }
        const res = await redefinirSenhaVendedora(modalVendedor.perfil.id, modalSenha);
        if (!res.success) {
          throw new Error(res.error || 'Erro ao redefinir senha.');
        }
        setSuccessMessage(`Senha de acesso de ${modalVendedor.nome} redefinida com sucesso!`);
      } else {
        // Usuário novo: cria login do zero
        if (!modalEmail || !modalSenha) {
          throw new Error('Preencha o e-mail e a senha.');
        }
        if (modalSenha.length < 6) {
          throw new Error('A senha deve ter no mínimo 6 caracteres.');
        }
        await cadastrarAcessoVendedora({
          nome: modalVendedor.nome,
          email: modalEmail,
          senha: modalSenha,
          clienteId,
        });
        setSuccessMessage(`Credenciais de acesso criadas com sucesso para ${modalVendedor.nome}!`);
      }

      await carregarPerfis();
      setModalVendedor(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setModalError(err.message || 'Erro ao salvar credenciais.');
    } finally {
      setModalLoading(false);
    }
  };

  // 1. Estado de carregamento
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground animate-fade-in">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-rose-500" />
        Carregando permissões de acesso...
      </div>
    );
  }

  // 2. Se for vendedora (seller), bloqueia o acesso
  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Acesso Não Autorizado</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Seu perfil de vendedora não possui permissão para alterar metas ou configurações da loja.
          </p>
        </div>
        <button
          onClick={() => navigate(`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`)}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          Voltar ao Meu Painel de Vendas
        </button>
      </div>
    );
  }

  // 3. Se não estiver autenticado, exige login corporativo
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Acesso Restrito à Gestão</h2>
          <p className="text-xs text-muted-foreground mt-1">
            É necessário autenticar-se como Gerente ou Diretoria para gerenciar metas e equipe.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          Fazer Login Corporativo
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
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-rose-500" />
              Gestão de Vendedoras & Metas
            </h1>
            <p className="text-xs text-muted-foreground">
              Parametrização das metas da loja, comissões meritocráticas e equipe de vendas
            </p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setActiveTab('acompanhamento')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'acompanhamento'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Acompanhamento Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('vendedores')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'vendedores'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Vendedoras, Fotos & Logins</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ABA 0: ACOMPANHAMENTO SEMANAL (VISÃO SEMANAL E DIÁRIA DE METAS) */}
      {activeTab === 'acompanhamento' && (
        <AcompanhamentoSemanalMetas />
      )}

      {/* ABA 1: VENDEDORAS, FOTOS & LOGINS */}
      {activeTab === 'vendedores' && (
        <div className="space-y-6">
          {/* Formulário de Cadastro com Upload de Foto e Credenciais de Acesso */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  Cadastrar Nova Vendedora & Credenciais de Acesso
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cadastre o nome do ERP PHIBO, foto de perfil e configure o e-mail/senha para ela acessar seu próprio painel 360º
                </p>
              </div>
              <div className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 inline-flex items-center gap-1.5 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload de Foto & Acesso Individual</span>
              </div>
            </div>

            <form onSubmit={handleCriarVendedor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Nome Oficial */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Nome Oficial no ERP PHIBO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novoVendedorNome}
                    onChange={(e) => setNovoVendedorNome(e.target.value)}
                    placeholder="Ex: Mariana Costa"
                    className="w-full text-xs bg-secondary text-foreground px-3.5 py-2.5 rounded-xl border border-border focus:ring-1 focus:ring-rose-500 shadow-2xs"
                    required
                  />
                </div>

                {/* Área de Imagem / Upload */}
                <div className="md:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Foto da Vendedora (Arquivo ou Print)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      {showUrlInput ? 'Usar upload de arquivo' : 'Ou colar link URL'}
                    </button>
                  </div>

                  {showUrlInput ? (
                    <input
                      type="url"
                      value={novoVendedorFoto}
                      onChange={(e) => setNovoVendedorFoto(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs bg-secondary text-foreground px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Preview da Foto */}
                      {novoVendedorFoto ? (
                        <div className="relative group shrink-0">
                          <img
                            src={novoVendedorFoto}
                            alt="Preview"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setNovoVendedorFoto('')}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center text-[10px] hover:scale-110 transition-transform cursor-pointer shadow-xs"
                            title="Remover Foto"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/60" />
                        </div>
                      )}

                      {/* Botão de Escolha de Arquivo */}
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                          id="avatar-file-input"
                        />
                        <label
                          htmlFor="avatar-file-input"
                          className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed transition-all cursor-pointer ${
                            isUploadingPhoto
                              ? 'bg-secondary text-muted-foreground border-border'
                              : 'bg-secondary/60 hover:bg-secondary border-rose-500/40 hover:border-rose-500 text-foreground'
                          }`}
                        >
                          {isUploadingPhoto ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                              <span>Processando Imagem...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-rose-500" />
                              <span>{novoVendedorFoto ? 'Trocar Imagem' : 'Escolher Foto (PNG, JPG)'}</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle de Credenciais */}
                <div className="md:col-span-3 pt-6">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={habilitarCredenciais}
                      onChange={(e) => setHabilitarCredenciais(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 accent-rose-500 cursor-pointer"
                    />
                    <div className="text-left leading-tight">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-rose-500" />
                        Gerar Login de Acesso
                      </span>
                      <p className="text-[10px] text-muted-foreground">E-mail e senha individual</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Campos condicionais de E-mail e Senha para Login */}
              {habilitarCredenciais && (
                <div className="p-4 rounded-xl bg-secondary/30 border border-rose-500/20 grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-fade-in">
                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-rose-500" />
                      E-mail de Acesso da Vendedora <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={novoEmail}
                      onChange={(e) => setNovoEmail(e.target.value)}
                      placeholder="mariana@blushfit.com.br"
                      className="w-full text-xs bg-background text-foreground px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
                      required={habilitarCredenciais}
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      Senha de Acesso (mínimo 6 dígitos) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNovaSenha ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-background text-foreground px-3 py-2 pr-9 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
                        required={habilitarCredenciais}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNovaSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Salvar */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNovo}
                  className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmittingNovo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando Cadastro...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Salvar Vendedora {habilitarCredenciais ? '& Criar Acesso' : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tabela de Vendedoras com Gestão de Credenciais */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground">Vendedoras Cadastradas & Status de Acesso</h3>
                <p className="text-xs text-muted-foreground">
                  Passe o mouse na foto para trocar a imagem ou clique no botão de chave para configurar/redefinir o login
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loadingPerfis && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                <span className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground border border-border">
                  Total: <strong>{vendedores.length}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Foto (Upload Direto)</th>
                    <th className="py-2.5 px-3">Nome Oficial (PHIBO)</th>
                    <th className="py-2.5 px-3">Credenciais de Acesso (Login)</th>
                    <th className="py-2.5 px-3">Peso na Meta</th>
                    <th className="py-2.5 px-3">Status de Rateio</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendedores.map((v) => {
                    const perfil = perfisLoja.find(
                      (p) =>
                        p.nome_vendedor?.trim().toLowerCase() === v.nome_vendedor.trim().toLowerCase() ||
                        p.full_name?.trim().toLowerCase() === v.nome_vendedor.trim().toLowerCase()
                    );

                    return (
                      <tr key={v.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="relative group shrink-0">
                              {tableUploadLoadingId === v.id ? (
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                                </div>
                              ) : v.url_foto ? (
                                <img
                                  src={v.url_foto}
                                  alt={v.nome_vendedor}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500/30"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold text-xs ring-1 ring-border">
                                  {v.nome_vendedor.slice(0, 2).toUpperCase()}
                                </div>
                              )}

                              {/* Overlay de Câmera para troca rápida */}
                              <label
                                htmlFor={`file-upload-${v.id}`}
                                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white shadow-xs"
                                title="Trocar Foto"
                              >
                                <Camera className="w-4 h-4" />
                              </label>
                              <input
                                type="file"
                                id={`file-upload-${v.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleTablePhotoChange(v.id, v.nome_vendedor, file);
                                }}
                              />
                            </div>

                            <label
                              htmlFor={`file-upload-${v.id}`}
                              className="inline-flex sm:hidden p-1 rounded-md bg-secondary text-muted-foreground hover:text-rose-500 cursor-pointer"
                              title="Trocar Foto"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </label>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-foreground">{v.nome_vendedor}</p>
                          <span className="text-[10px] text-muted-foreground">ID: {v.id.slice(0, 8)}</span>
                        </td>

                        {/* Status e E-mail de Login */}
                        <td className="py-3 px-3">
                          {perfil ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                Login Ativo
                              </span>
                              <p className="text-[11px] font-medium text-foreground truncate max-w-[180px]">
                                {perfil.email}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">
                                Sem Login Criado
                              </span>
                              <p className="text-[10px] text-muted-foreground">Somente registro ERP</p>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-muted-foreground">{v.peso_meta.toFixed(1)}x (integral)</td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.ativo
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-secondary text-muted-foreground'
                            }`}
                          >
                            {v.ativo ? 'Ativa no Rateio' : 'Inativa'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão de Gestão de Credenciais / Senha */}
                            <button
                              onClick={() => abrirModalCredenciais(v.nome_vendedor)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-colors cursor-pointer"
                              title={perfil ? 'Redefinir Senha de Acesso' : 'Criar Acesso de Login'}
                            >
                              <Key className="w-3 h-3" />
                              <span>{perfil ? 'Trocar Senha' : 'Criar Acesso'}</span>
                            </button>

                            {/* Botão de Ativação no Rateio */}
                            <button
                              onClick={() => atualizarVendedor(v.id, { ativo: !v.ativo })}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-border transition-colors cursor-pointer"
                            >
                              {v.ativo ? 'Desativar' : 'Ativar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE GESTÃO DE CREDENCIAIS (CRIAR OU REDEFINIR SENHA) */}
      {modalVendedor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {modalVendedor.perfil ? 'Redefinir Senha de Acesso' : 'Criar Login de Acesso'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Vendedora: <strong>{modalVendedor.nome}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setModalVendedor(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSalvarModalCredenciais} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  E-mail de Acesso Corporativo
                </label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  disabled={!!modalVendedor.perfil}
                  placeholder={`exemplo@blushfit.com.br`}
                  className={`w-full text-xs bg-secondary text-foreground px-3 py-2.5 rounded-xl border border-border focus:ring-1 focus:ring-rose-500 ${
                    modalVendedor.perfil ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  required
                />
                {modalVendedor.perfil && (
                  <p className="text-[10px] text-muted-foreground">O e-mail já está registrado na base de dados.</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  {modalVendedor.perfil ? 'Nova Senha de Acesso' : 'Senha Inicial'}
                </label>
                <div className="relative">
                  <input
                    type={showModalSenha ? 'text' : 'password'}
                    value={modalSenha}
                    onChange={(e) => setModalSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full text-xs bg-secondary text-foreground px-3 py-2.5 pr-9 rounded-xl border border-border focus:ring-1 focus:ring-rose-500"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalSenha(!showModalSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showModalSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalVendedor(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-border text-foreground transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{modalVendedor.perfil ? 'Atualizar Senha' : 'Criar Acesso'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
