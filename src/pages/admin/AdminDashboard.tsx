import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  Users,
  Building2,
  Save,
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
} from 'lucide-react';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { useAuth } from '../../hooks/useAuth';
import { processAndUploadAvatar } from '../../utils/imageUpload';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  const isSeller = profile?.role === 'seller';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    metas,
    vendedores,
    lojas,
    salvarMetas,
    atualizarVendedor,
    cadastrarVendedor,
    cadastrarNovaLoja,
  } = useAdminConfig();

  const [activeTab, setActiveTab] = useState<'metas' | 'vendedores' | 'lojas'>('metas');
  const [successMessage, setSuccessMessage] = useState('');

  // Se não for super admin e a aba selecionada for lojas, reseta para metas
  React.useEffect(() => {
    if (activeTab === 'lojas' && !isSuperAdmin) {
      setActiveTab('metas');
    }
  }, [activeTab, isSuperAdmin]);

  // Estados locais para edição de Metas
  const [metaMinima, setMetaMinima] = useState(metas.meta_minima.toString());
  const [metaTop1, setMetaTop1] = useState(metas.meta_top1.toString());
  const [metaTop2, setMetaTop2] = useState(metas.meta_top2.toString());
  const [metaMaster, setMetaMaster] = useState(metas.meta_master.toString());
  const [percMinima, setPercMinima] = useState(metas.perc_minima.toString());
  const [percTop1, setPercTop1] = useState(metas.perc_top1.toString());
  const [percTop2, setPercTop2] = useState(metas.perc_top2.toString());
  const [percMaster, setPercMaster] = useState(metas.perc_master.toString());
  const [diasUteis, setDiasUteis] = useState(metas.dias_uteis.toString());

  React.useEffect(() => {
    setMetaMinima(metas.meta_minima.toString());
    setMetaTop1(metas.meta_top1.toString());
    setMetaTop2(metas.meta_top2.toString());
    setMetaMaster(metas.meta_master.toString());
    setPercMinima(metas.perc_minima.toString());
    setPercTop1(metas.perc_top1.toString());
    setPercTop2(metas.perc_top2.toString());
    setPercMaster(metas.perc_master.toString());
    setDiasUteis(metas.dias_uteis.toString());
  }, [metas]);

  // Estado para cadastro de nova loja
  const [novaLojaNome, setNovaLojaNome] = useState('');
  const [novaLojaEmail, setNovaLojaEmail] = useState('');

  // Estado para cadastro de nova vendedora e upload de imagem
  const [novoVendedorNome, setNovoVendedorNome] = useState('');
  const [novoVendedorFoto, setNovoVendedorFoto] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tableUploadLoadingId, setTableUploadLoadingId] = useState<string | null>(null);

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

  const handleSalvarMetas = async (e: React.FormEvent) => {
    e.preventDefault();
    await salvarMetas({
      ...metas,
      meta_minima: parseFloat(metaMinima) || 0,
      meta_top1: parseFloat(metaTop1) || 0,
      meta_top2: parseFloat(metaTop2) || 0,
      meta_master: parseFloat(metaMaster) || 0,
      perc_minima: parseFloat(percMinima) || 0,
      perc_top1: parseFloat(percTop1) || 0,
      perc_top2: parseFloat(percTop2) || 0,
      perc_master: parseFloat(percMaster) || 0,
      dias_uteis: parseInt(diasUteis, 10) || 26,
    });
    setSuccessMessage('Configurações de metas salvas com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCriarLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaLojaNome) return;
    cadastrarNovaLoja(novaLojaNome, novaLojaEmail);
    setNovaLojaNome('');
    setNovaLojaEmail('');
    setSuccessMessage('Nova loja cadastrada no sistema multi-tenant com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCriarVendedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoVendedorNome) return;
    cadastrarVendedor(novoVendedorNome, novoVendedorFoto, 1.0);
    setNovoVendedorNome('');
    setNovoVendedorFoto('');
    setSuccessMessage('Vendedora cadastrada com sucesso!');
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
          <h2 className="text-base font-bold text-foreground">Acesso Restrito à Gestão</h2>
          <p className="text-xs text-muted-foreground mt-1">
            É necessário autenticar-se para acessar o painel de governança da loja.
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

  // 2. Se for vendedora (seller), bloqueia o acesso
  if (isSeller) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-border bg-card shadow-lg text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Acesso Não Autorizado</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Seu perfil de vendedora não possui permissão para alterar metas ou configurações da loja.
          </p>
        </div>
        <button
          onClick={() => navigate(`/vendedor/${encodeURIComponent(profile?.nome_vendedor || 'Juliana')}`)}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors cursor-pointer"
        >
          Ir para Meu Perfil de Vendas
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
              <ShieldCheck className="w-6 h-6 text-rose-500" />
              Painel Administrativo & Governança
            </h1>
            <p className="text-xs text-muted-foreground">
              Parametrização de metas, equipe de vendas e governança multi-loja do ERP PHIBO
            </p>
          </div>
        </div>

        {/* Abas de Configuração */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary border border-border">
          <button
            onClick={() => setActiveTab('metas')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'metas'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Metas da Loja</span>
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
            <span>Vendedoras & Fotos</span>
          </button>

          {/* Aba de Lojas PHIBO: Visível EXCLUSIVAMENTE para Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('lojas')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lojas'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Lojas PHIBO</span>
              <span className="text-[9px] font-black uppercase bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded-sm">
                Super Admin
              </span>
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ABA 1: METAS & COMISSÕES */}
      {activeTab === 'metas' && (
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                Régua de Metas Mensais & Comissões Dinâmicas
              </h2>
              <p className="text-xs text-muted-foreground">
                Defina os 4 patamares de meritocracia para a unidade BlushFit
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary text-xs font-semibold text-foreground border border-border">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Mês: Outubro / 2026</span>
            </div>
          </div>

          <form onSubmit={handleSalvarMetas} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Meta Mínima */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">1. Meta Mínima</span>
                  <span className="text-[11px] font-semibold text-rose-500">Patamar 1</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Valor em R$</label>
                  <input
                    type="number"
                    value={metaMinima}
                    onChange={(e) => setMetaMinima(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={percMinima}
                    onChange={(e) => setPercMinima(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Meta Top 1 */}
              <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">2. Meta Top 1</span>
                  <span className="text-[11px] font-semibold text-rose-500">Patamar 2</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Valor em R$</label>
                  <input
                    type="number"
                    value={metaTop1}
                    onChange={(e) => setMetaTop1(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={percTop1}
                    onChange={(e) => setPercTop1(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Meta Master */}
              <div className="p-4 rounded-xl border-2 border-rose-500/40 bg-rose-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    3. Meta Master
                  </span>
                  <span className="text-[11px] font-bold text-rose-500">Superação</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Valor em R$</label>
                  <input
                    type="number"
                    value={metaMaster}
                    onChange={(e) => setMetaMaster(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Comissão (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={percMaster}
                    onChange={(e) => setPercMaster(e.target.value)}
                    className="w-full text-xs font-bold bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dias Úteis */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/20">
              <div>
                <h4 className="text-xs font-bold text-foreground">Dias Úteis no Mês</h4>
                <p className="text-[11px] text-muted-foreground">
                  Base utilizada para o cálculo do ritmo diário e projeção de fechamento
                </p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={diasUteis}
                  onChange={(e) => setDiasUteis(e.target.value)}
                  className="w-24 text-xs font-bold text-center bg-background text-foreground px-3 py-2 rounded-lg border border-border focus:ring-1 focus:ring-rose-500"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Metas</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ABA 2: VENDEDORAS & FOTOS */}
      {activeTab === 'vendedores' && (
        <div className="space-y-6">
          {/* Formulário de Cadastro com Upload Direto de Imagem */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  Cadastrar Nova Vendedora & Foto
                </h3>
                <p className="text-xs text-muted-foreground">
                  Alimente com fotos reais (PNG, JPG, prints da tela) ou informe a URL de perfil
                </p>
              </div>
              <div className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 inline-flex items-center gap-1.5 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload de Imagem Direta & Print</span>
              </div>
            </div>

            <form onSubmit={handleCriarVendedor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Nome Oficial */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Nome Oficial no ERP PHIBO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={novoVendedorNome}
                    onChange={(e) => setNovoVendedorNome(e.target.value)}
                    placeholder="Ex: Fernanda Lima"
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

                {/* Botão de Salvar */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/25 cursor-pointer transition-all h-[38px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Tabela de Vendedoras */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Vendedoras Cadastradas no Sistema</h3>
                <p className="text-xs text-muted-foreground">Passe o mouse na foto para trocar a imagem da vendedora diretamente</p>
              </div>
              <span className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground border border-border">
                Total: <strong>{vendedores.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3">Foto (Upload Direto)</th>
                    <th className="py-2.5 px-3">Nome Oficial (PHIBO)</th>
                    <th className="py-2.5 px-3">Peso na Meta</th>
                    <th className="py-2.5 px-3">Status de Rateio</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vendedores.map((v) => (
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
                      <td className="py-3 px-3 font-bold text-foreground">{v.nome_vendedor}</td>
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
                        <button
                          onClick={() => atualizarVendedor(v.id, { ativo: !v.ativo })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-border transition-colors cursor-pointer"
                        >
                          {v.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: LOJAS PHIBO (MULTI-TENANT) - EXCLUSIVO SUPER ADMIN */}
      {activeTab === 'lojas' && isSuperAdmin && (
        <div className="space-y-6">
          {/* Formulário de Cadastro de Novo Cliente PHIBO */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Cadastrar Novo Cliente / Loja no Sistema
              </h3>
              <p className="text-xs text-muted-foreground">
                Qualquer lojista que utilize o ERP PHIBO pode ser acoplado instantaneamente com isolamento absoluto de dados
              </p>
            </div>
            <form onSubmit={handleCriarLoja} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Nome Fantasia da Loja</label>
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
            <h3 className="text-base font-bold text-foreground">Lojas Acopladas ao Ecossistema PHIBO</h3>
            <div className="space-y-3">
              {lojas.map((loja, idx) => (
                <div
                  key={loja.id}
                  className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                  <div className="text-xs text-muted-foreground shrink-0">
                    Governança RLS Ativa
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
