import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Filter, Download, Users, ChevronDown, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DashboardDataResponse } from '../../integrations/supabase/types';

interface DashboardFiltersProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  selectedSellers: string[];
  onSellersChange: (sellers: string[]) => void;
  dashboardData?: DashboardDataResponse;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  currentMonth,
  onMonthChange,
  selectedChannel,
  onChannelChange,
  selectedSellers,
  onSellersChange,
  dashboardData,
}) => {
  const [isSellersOpen, setIsSellersOpen] = useState(false);
  const sellersDropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sellersDropdownRef.current &&
        !sellersDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSellersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToExcel = () => {
    if (!dashboardData) return;

    // Planilha 1: Ranking de Vendedores
    const rankingWs = XLSX.utils.json_to_sheet(
      dashboardData.ranking_vendedores.map((v, idx) => ({
        Posição: `${idx + 1}º`,
        Vendedor: v.vendedor,
        'Faturamento (R$)': v.faturamento,
        'Atendimentos (Cupons)': v.qtd_vendas,
        'Total Peças': v.qtd_pecas,
        'Ticket Médio (R$)': v.ticket_medio,
        'P.A (Peças/Atendimento)': v.pa,
      }))
    );

    // Planilha 2: Evolução Diária
    const timelineWs = XLSX.utils.json_to_sheet(
      dashboardData.timeline.map((t) => ({
        Data: t.data_venda,
        'Faturamento (R$)': t.faturamento,
        Atendimentos: t.qtd_vendas,
        Peças: t.qtd_pecas,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, rankingWs, 'Ranking_Vendedores');
    XLSX.utils.book_append_sheet(wb, timelineWs, 'Timeline_Diario');

    XLSX.writeFile(wb, `BlushFit_Relatorio_${currentMonth.replace(/\s|\//g, '_')}.xlsx`);
  };

  // Mantém uma lista acumulada de vendedoras para que opções não sumam ao filtrar
  const [knownSellers, setKnownSellers] = useState<string[]>([
    'Juliana',
    'PLISSIA',
    'Site',
  ]);

  useEffect(() => {
    if (dashboardData?.ranking_vendedores && dashboardData.ranking_vendedores.length > 0) {
      setKnownSellers((prev) => {
        const currentNames = dashboardData.ranking_vendedores.map((v) => v.vendedor);
        const set = new Set([...prev, ...currentNames]);
        return Array.from(set);
      });
    }
  }, [dashboardData]);

  const sellersList = knownSellers;

  // Lista dinâmica de canais
  const channelsList = useMemo(() => {
    if (dashboardData?.origens && dashboardData.origens.length > 0) {
      return Array.from(new Set(dashboardData.origens.map((o) => o.origem)));
    }
    return ['PDV', 'Loja Física', 'WhatsApp', 'E-commerce'];
  }, [dashboardData]);

  // Checa se uma vendedora específica está marcada
  const isSellerSelected = (seller: string) => {
    if (selectedSellers.length === 0) return true; // Se vazio, todas estão ativas
    if (selectedSellers.includes('__nenhuma__')) return false;
    return selectedSellers.some((s) => s.toLowerCase() === seller.toLowerCase());
  };

  const isFiltered =
    selectedSellers.length > 0 &&
    !selectedSellers.includes('__nenhuma__') &&
    selectedSellers.length < sellersList.length;

  const isNoneSelected = selectedSellers.includes('__nenhuma__');

  // Alterna a seleção de uma vendedora individual
  const handleToggleSeller = (seller: string) => {
    if (isNoneSelected) {
      onSellersChange([seller]);
      return;
    }

    if (selectedSellers.length === 0) {
      // Se estavam todas ativas e desmarcou uma
      const next = sellersList.filter((s) => s.toLowerCase() !== seller.toLowerCase());
      onSellersChange(next);
      return;
    }

    const exists = selectedSellers.some((s) => s.toLowerCase() === seller.toLowerCase());
    if (exists) {
      const next = selectedSellers.filter((s) => s.toLowerCase() !== seller.toLowerCase());
      if (next.length === 0) {
        onSellersChange(['__nenhuma__']);
      } else {
        onSellersChange(next);
      }
    } else {
      const next = [...selectedSellers, seller];
      if (next.length === sellersList.length) {
        onSellersChange([]); // Todas selecionadas (reset para padrão)
      } else {
        onSellersChange(next);
      }
    }
  };

  // Atalho: Selecionar Todas
  const handleSelectAll = () => {
    onSellersChange([]);
  };

  // Atalho: Selecionar Apenas Vendedoras Humanas / Físicas (Sem Site)
  const handleSelectOnlyHumans = () => {
    const humans = sellersList.filter(
      (s) =>
        !s.toLowerCase().includes('site') &&
        !s.toLowerCase().includes('commerce') &&
        !s.toLowerCase().includes('online')
    );
    onSellersChange(humans);
  };

  // Atalho: Desmarcar Todas
  const handleClearAll = () => {
    onSellersChange(['__nenhuma__']);
  };

  // Texto do botão do seletor
  const getButtonLabel = () => {
    if (isNoneSelected) return 'Nenhuma Vendedora';
    if (selectedSellers.length === 0 || selectedSellers.length === sellersList.length) {
      return 'Todas as Vendedoras';
    }
    if (selectedSellers.length === 1) {
      return selectedSellers[0];
    }
    if (selectedSellers.length === 2) {
      return `${selectedSellers[0]}, ${selectedSellers[1]}`;
    }
    return `${selectedSellers.length} Vendedoras`;
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs">
      {/* Filtros à Esquerda */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Seletor de Período Dinâmico */}
        <div className="relative">
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="appearance-none text-xs font-bold bg-secondary text-foreground pl-8 pr-8 py-1.5 rounded-lg border border-border focus:outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer shadow-2xs"
          >
            <option value="2026-10">Outubro / 2026 (Dados Reais PHIBO)</option>
            <option value="2026-09">Setembro / 2026 (Dados Reais PHIBO)</option>
            <option value="2026-08">Agosto / 2026 (Simulado)</option>
            <option value="2026-07">Julho / 2026 (Simulado)</option>
          </select>
          <Calendar className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Filter className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filtro por Origem / Canal Dinâmico */}
        <div className="relative">
          <select
            value={selectedChannel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="appearance-none text-xs font-medium bg-secondary text-foreground pl-3 pr-8 py-1.5 rounded-lg border border-border focus:outline-hidden focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            <option value="todos">Todos os Canais</option>
            {channelsList.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
          <Filter className="w-3 h-3 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filtro Multi-Select de Vendedoras */}
        <div className="relative" ref={sellersDropdownRef}>
          <button
            type="button"
            onClick={() => setIsSellersOpen(!isSellersOpen)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs ${
              isFiltered || isNoneSelected
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold'
                : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span className="max-w-[150px] sm:max-w-[220px] truncate" title={getButtonLabel()}>
                {getButtonLabel()}
              </span>
            </div>
            {isFiltered && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white leading-none">
                {selectedSellers.length}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${
                isSellersOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Popover / Menu Dropdown */}
          {isSellersOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 p-2.5 rounded-xl border border-border bg-card shadow-2xl z-50 animate-fade-in space-y-2">
              {/* Cabeçalho do Popover & Ações Rápidas */}
              <div className="flex items-center justify-between gap-1 pb-2 border-b border-border">
                <span className="text-[11px] font-bold text-foreground">Equipe de Vendas</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-secondary transition-colors cursor-pointer"
                  >
                    Todas
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectOnlyHumans}
                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                    title="Seleciona apenas vendedoras físicas e desmarca o Site"
                  >
                    Sem Site
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-muted-foreground hover:text-destructive px-1.5 py-0.5 rounded hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Lista com Checkbox */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                {sellersList.map((seller) => {
                  const checked = isSellerSelected(seller);
                  const isSite =
                    seller.toLowerCase().includes('site') || seller.toLowerCase().includes('commerce');

                  return (
                    <div
                      key={seller}
                      onClick={() => handleToggleSeller(seller)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors select-none ${
                        checked
                          ? 'bg-rose-500/10 text-foreground font-bold'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            checked
                              ? 'bg-rose-500 border-rose-500 text-white shadow-2xs'
                              : 'border-border bg-secondary'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{seller}</span>
                      </div>
                      {isSite && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                          E-comm
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rodapé Informativo */}
              {(isFiltered || isNoneSelected) && (
                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {isNoneSelected
                      ? 'Nenhuma selecionada'
                      : `${selectedSellers.length} de ${sellersList.length} ativas`}
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Mostrar todas
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          title="Exportar para Excel (.xlsx)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar XLS</span>
        </button>
      </div>
    </div>
  );
};
