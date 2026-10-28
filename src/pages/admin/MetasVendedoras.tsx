import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { useAdminConfig } from '../../hooks/useAdminConfig';
import { useAuth } from '../../hooks/useAuth';
import { processAndUploadAvatar } from '../../utils/imageUpload';
import { AcompanhamentoSemanalMetas } from '../../components/metas/AcompanhamentoSemanalMetas';

export const MetasVendedoras: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated, loading } = useAuth();
  const isSeller = profile?.role === 'seller';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    vendedores,
    atualizarVendedor,
    cadastrarVendedor,
  } = useAdminConfig();

  const [activeTab, setActiveTab] = useState<'acompanhamento' | 'vendedores'>('acompanhamento');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para cadastro de nova vendedora e upload de foto
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

  const handleCriarVendedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoVendedorNome) return;
    cadastrarVendedor(novoVendedorNome, novoVendedorFoto, 1.0);
    setNovoVendedorNome('');
    setNovoVendedorFoto('');
    setSuccessMessage('Vendedora cadastrada com sucesso!');
    setTimeout(() => setSuccessMessage(''), 3000);
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
            <span>Vendedoras & Fotos</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ABA 0: ACOMPANHAMENTO SEMANAL (VISÃO SEMANAL E DIÁRIA DE METAS) */}
      {activeTab === 'acompanhamento' && (
        <AcompanhamentoSemanalMetas />
      )}

      {/* ABA 1: VENDEDORAS & FOTOS */}
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
    </div>
  );
};
