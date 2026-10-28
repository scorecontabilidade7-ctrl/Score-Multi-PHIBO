import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Sparkles, CheckCircle2, Save, X } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { PhiboMetasMensais, PhiboDistributionConfig } from '../../integrations/supabase/types';

interface CadastroMetaMensalCardProps {
  metas: PhiboMetasMensais;
  onSalvar: (novasMetas: PhiboMetasMensais) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
}

export const CadastroMetaMensalCard: React.FC<CadastroMetaMensalCardProps> = ({
  metas,
  onSalvar,
  onClose,
  isModal = false,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(metas.year_month || '2026-10');
  const [diasUteis, setDiasUteis] = useState(metas.dias_uteis?.toString() || '26');
  const [distributionMode, setDistributionMode] = useState<'uniform' | 'week' | 'day'>(
    metas.distribution_mode || 'week'
  );

  // Metas em R$ e Comissões (%)
  const [metaMinima, setMetaMinima] = useState(metas.meta_minima?.toString() || '120000');
  const [metaTop1, setMetaTop1] = useState(metas.meta_top1?.toString() || '140000');
  const [metaMaster, setMetaMaster] = useState(metas.meta_master?.toString() || '180000');

  const [percMinima, setPercMinima] = useState(metas.perc_minima?.toString() || '1.0');
  const [percTop1, setPercTop1] = useState(metas.perc_top1?.toString() || '1.5');
  const [percMaster, setPercMaster] = useState(metas.perc_master?.toString() || '2.5');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calcula dinamicamente as semanas comerciais do mês selecionado
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();

  // Lista de semanas calculadas com rótulo real (ex: "01/10 - 03/10")
  const calculatedWeeks = useMemo(() => {
    const weeksList: { weekIdx: number; label: string; dateRange: string; businessDays: number }[] = [];
    let weekStart = 1;
    let currentWeekIdx = 1;

    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Dom, 6 = Sáb

      if (dayOfWeek === 6 || d === lastDay) {
        // Conta dias úteis comerciais (Seg a Sáb) nesta semana
        let businessDaysCount = 0;
        for (let wd = weekStart; wd <= d; wd++) {
          const wObj = new Date(year, month - 1, wd);
          if (wObj.getDay() !== 0) businessDaysCount++;
        }

        const startStr = `${String(weekStart).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
        const endStr = `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`;

        weeksList.push({
          weekIdx: currentWeekIdx,
          label: `Semana ${currentWeekIdx}`,
          dateRange: `${startStr} - ${endStr}`,
          businessDays: businessDaysCount || 1,
        });

        currentWeekIdx++;
        weekStart = d + 1;
      }
    }
    return weeksList;
  }, [year, month, lastDay]);

  // Total sugerido de dias úteis (Seg a Sáb) no mês
  const sugeridoDiasUteis = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0) count++;
    }
    return count;
  }, [year, month, lastDay]);

  // Pesos Semanais (%)
  const defaultWeeklyWeights = useMemo(() => {
    if (metas.distribution_config?.weeklyWeights && metas.distribution_config.weeklyWeights.length === calculatedWeeks.length) {
      return metas.distribution_config.weeklyWeights.map((w) => w.toString());
    }
    // Valores padrão ilustrados no print do usuário: [11.7, 29.6, 20.0, 19.0, 19.7]
    if (calculatedWeeks.length === 5) {
      return ['11.7', '29.6', '20.0', '19.0', '19.7'];
    }
    const equalShare = (100 / calculatedWeeks.length).toFixed(1);
    return calculatedWeeks.map(() => equalShare);
  }, [metas.distribution_config, calculatedWeeks]);

  const [weeklyWeights, setWeeklyWeights] = useState<string[]>(defaultWeeklyWeights);

  // Pesos Diários (%) para Seg a Sáb
  const daysKeys = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const defaultDailyWeights = useMemo(() => {
    if (metas.distribution_config?.dailyWeights) {
      return {
        Seg: metas.distribution_config.dailyWeights.Seg?.toString() || '16.66',
        Ter: metas.distribution_config.dailyWeights.Ter?.toString() || '16.66',
        Qua: metas.distribution_config.dailyWeights.Qua?.toString() || '16.66',
        Qui: metas.distribution_config.dailyWeights.Qui?.toString() || '16.66',
        Sex: metas.distribution_config.dailyWeights.Sex?.toString() || '16.66',
        Sáb: metas.distribution_config.dailyWeights.Sáb?.toString() || '16.70',
      };
    }
    return {
      Seg: '16.66',
      Ter: '16.66',
      Qua: '16.66',
      Qui: '16.66',
      Sex: '16.66',
      Sáb: '16.70',
    };
  }, [metas.distribution_config]);

  const [dailyWeights, setDailyWeights] = useState<{ [key: string]: string }>(defaultDailyWeights);

  // Sincroniza sempre que metas mudar
  useEffect(() => {
    if (metas.distribution_config?.weeklyWeights && metas.distribution_config.weeklyWeights.length === calculatedWeeks.length) {
      setWeeklyWeights(metas.distribution_config.weeklyWeights.map((w) => w.toString()));
    }
    if (metas.distribution_config?.dailyWeights) {
      setDailyWeights({
        Seg: metas.distribution_config.dailyWeights.Seg?.toString() || '16.66',
        Ter: metas.distribution_config.dailyWeights.Ter?.toString() || '16.66',
        Qua: metas.distribution_config.dailyWeights.Qua?.toString() || '16.66',
        Qui: metas.distribution_config.dailyWeights.Qui?.toString() || '16.66',
        Sex: metas.distribution_config.dailyWeights.Sex?.toString() || '16.66',
        Sáb: metas.distribution_config.dailyWeights.Sáb?.toString() || '16.70',
      });
    }
    if (metas.distribution_mode) {
      setDistributionMode(metas.distribution_mode);
    }
  }, [metas, calculatedWeeks.length]);

  // Soma dos percentuais semanais
  const totalWeeklyPercent = useMemo(() => {
    return weeklyWeights.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  }, [weeklyWeights]);

  // Soma dos percentuais diários
  const totalDailyPercent = useMemo(() => {
    return Object.values(dailyWeights).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
  }, [dailyWeights]);

  // Ação: Dividir Semanas Proporcionalmente / Igualmente
  const handleDividirSemanasIgualmente = () => {
    const totalDays = calculatedWeeks.reduce((acc, w) => acc + w.businessDays, 0);
    let accumulated = 0;
    const newWeights = calculatedWeeks.map((w, idx) => {
      if (idx === calculatedWeeks.length - 1) {
        const remaining = Math.max(0, 100 - accumulated);
        return remaining.toFixed(1);
      }
      const proportional = Number(((w.businessDays / totalDays) * 100).toFixed(1));
      accumulated += proportional;
      return proportional.toFixed(1);
    });
    setWeeklyWeights(newWeights);
  };

  // Ação: Dividir Dias Igualmente
  const handleDividirDiasIgualmente = () => {
    setDailyWeights({
      Seg: '16.66',
      Ter: '16.66',
      Qua: '16.66',
      Qui: '16.66',
      Sex: '16.66',
      Sáb: '16.70',
    });
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config: PhiboDistributionConfig = {
        mode: distributionMode,
        weeklyWeights: weeklyWeights.map((w) => parseFloat(w) || 0),
        dailyWeights: {
          Seg: parseFloat(dailyWeights.Seg) || 0,
          Ter: parseFloat(dailyWeights.Ter) || 0,
          Qua: parseFloat(dailyWeights.Qua) || 0,
          Qui: parseFloat(dailyWeights.Qui) || 0,
          Sex: parseFloat(dailyWeights.Sex) || 0,
          Sáb: parseFloat(dailyWeights.Sáb) || 0,
        },
      };

      await onSalvar({
        ...metas,
        year_month: selectedMonth,
        dias_uteis: parseInt(diasUteis, 10) || 26,
        meta_minima: parseFloat(metaMinima) || 0,
        meta_top1: parseFloat(metaTop1) || 0,
        meta_top2: 0,
        meta_master: parseFloat(metaMaster) || 0,
        perc_minima: parseFloat(percMinima) || 0,
        perc_top1: parseFloat(percTop1) || 0,
        perc_top2: 0,
        perc_master: parseFloat(percMaster) || 0,
        distribution_mode: distributionMode,
        distribution_config: config,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onClose) {
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error('Erro ao salvar parametrização de metas:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-slate-700/60 bg-[#0f172a] text-slate-100 shadow-xl overflow-hidden transition-all ${
        isModal ? 'max-w-xl w-full' : 'w-full'
      }`}
    >
      {/* Header do Card (Fiel ao design do print do usuário) */}
      <div className="p-5 pb-3 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Cadastrar Meta Mensal</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribuição tática de pesos por semana, dias comerciais e meritocracia
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSalvar} className="p-5 space-y-5">
        {/* Campo 1: Mês/Ano */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Mês/Ano</label>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-[#1da1aa] focus:ring-1 focus:ring-[#1da1aa] focus:outline-hidden cursor-pointer"
            >
              <option value="2026-10">outubro de 2026</option>
              <option value="2026-11">novembro de 2026</option>
              <option value="2026-12">dezembro de 2026</option>
              <option value="2026-09">setembro de 2026</option>
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Campo 2: Dias Úteis */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Dias Úteis</label>
            <button
              type="button"
              onClick={() => setDiasUteis(sugeridoDiasUteis.toString())}
              className="text-[11px] font-semibold text-[#1da1aa] hover:underline cursor-pointer"
            >
              Usar sugerido ({sugeridoDiasUteis})
            </button>
          </div>
          <input
            type="number"
            value={diasUteis}
            onChange={(e) => setDiasUteis(e.target.value)}
            className="w-full bg-[#0b1120] text-slate-100 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-[#1da1aa] focus:ring-1 focus:ring-[#1da1aa] focus:outline-hidden"
            required
          />
        </div>

        {/* Campo 3: Distribuição da Meta (Dropdown) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Distribuição da Meta</label>
          <select
            value={distributionMode}
            onChange={(e) => setDistributionMode(e.target.value as any)}
            className="w-full bg-[#0b1120] text-slate-100 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-[#1da1aa] focus:ring-1 focus:ring-[#1da1aa] focus:outline-hidden cursor-pointer"
          >
            <option value="week">Por semana (%)</option>
            <option value="day">Por dia (Seg a Sáb %)</option>
            <option value="uniform">Uniforme (Divisão linear automática)</option>
          </select>
        </div>

        {/* Sub-Card: Distribuição Semanal (Fiel ao Screenshot 1) */}
        {distributionMode === 'week' && (
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0b1120]/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Distribuição Semanal</span>
              <button
                type="button"
                onClick={handleDividirSemanasIgualmente}
                className="text-[11px] font-semibold text-[#1da1aa] hover:underline cursor-pointer"
              >
                Dividir igualmente
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {calculatedWeeks.map((week, idx) => (
                <div key={week.label} className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400 block truncate" title={week.dateRange}>
                    {week.dateRange}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weeklyWeights[idx] || ''}
                    onChange={(e) => {
                      const updated = [...weeklyWeights];
                      updated[idx] = e.target.value;
                      setWeeklyWeights(updated);
                    }}
                    className="w-full bg-[#070b14] text-white text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-700/80 focus:border-[#1da1aa] focus:ring-1 focus:ring-[#1da1aa] focus:outline-hidden text-center"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span
                className={`font-bold ${
                  Math.abs(totalWeeklyPercent - 100) < 0.05
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                Total: {totalWeeklyPercent.toFixed(2)}%
                {Math.abs(totalWeeklyPercent - 100) >= 0.05 && (
                  <span className="ml-1 text-[10px] text-slate-400">
                    ({(100 - totalWeeklyPercent).toFixed(1)}% restante)
                  </span>
                )}
              </span>
              <span className="text-slate-400 text-[10px]">Padrão: 100% da meta distribuída</span>
            </div>
          </div>
        )}

        {/* Sub-Card: Distribuição Diária (Fiel ao Screenshot 2) */}
        {distributionMode === 'day' && (
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0b1120]/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Distribuição Diária</span>
              <button
                type="button"
                onClick={handleDividirDiasIgualmente}
                className="text-[11px] font-semibold text-[#1da1aa] hover:underline cursor-pointer"
              >
                Dividir igualmente
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {daysKeys.map((day) => (
                <div key={day} className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400 block text-center">
                    {day}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dailyWeights[day] || ''}
                    onChange={(e) => {
                      setDailyWeights({
                        ...dailyWeights,
                        [day]: e.target.value,
                      });
                    }}
                    className="w-full bg-[#070b14] text-white text-xs font-bold px-2 py-2 rounded-lg border border-slate-700/80 focus:border-[#1da1aa] focus:ring-1 focus:ring-[#1da1aa] focus:outline-hidden text-center"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span
                className={`font-bold ${
                  Math.abs(totalDailyPercent - 100) < 0.1
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                Total: {totalDailyPercent.toFixed(2)}%
              </span>
              <span className="text-slate-400 text-[10px]">Segunda a Sábado</span>
            </div>
          </div>
        )}

        {/* Sub-Card: Informativo do Modo Uniforme */}
        {distributionMode === 'uniform' && (
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0b1120]/80 space-y-1.5 animate-fade-in text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <span className="text-[#1da1aa]">⚖️</span>
              <span>Divisão Linear Uniforme Ativa</span>
            </div>
            <p className="text-[11px] text-slate-400">
              A meta mensal é dividida de forma idêntica entre os {diasUteis} dias úteis do mês (aprox. {formatCurrency((parseFloat(metaMinima) || 120000) / (parseInt(diasUteis, 10) || 26))}/dia).
            </p>
            <p className="text-[11px] text-teal-400">
              Para definir pesos customizados (ex: 20% Semana 1, 30% Semana 2), selecione <strong>"Por semana (%)"</strong> acima.
            </p>
          </div>
        )}

        {/* Patamares de Metas da Loja (Mínima, Top 1, Master) */}
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <label className="text-xs font-bold text-slate-200 block">
            Patamares de Faturamento da Loja (R$)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Meta Mínima */}
            <div className="p-3 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">1. Mínima</span>
              <input
                type="number"
                value={metaMinima}
                onChange={(e) => setMetaMinima(e.target.value)}
                className="w-full text-xs font-black text-white bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700/60 focus:border-[#1da1aa] focus:outline-hidden"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Comissão:</span>
                <input
                  type="number"
                  step="0.1"
                  value={percMinima}
                  onChange={(e) => setPercMinima(e.target.value)}
                  className="w-12 text-right bg-transparent text-slate-200 font-bold focus:outline-hidden"
                />
                <span>%</span>
              </div>
            </div>

            {/* Meta Top 1 */}
            <div className="p-3 rounded-xl bg-[#0b1120] border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">2. Top 1</span>
              <input
                type="number"
                value={metaTop1}
                onChange={(e) => setMetaTop1(e.target.value)}
                className="w-full text-xs font-black text-white bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-700/60 focus:border-[#1da1aa] focus:outline-hidden"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Comissão:</span>
                <input
                  type="number"
                  step="0.1"
                  value={percTop1}
                  onChange={(e) => setPercTop1(e.target.value)}
                  className="w-12 text-right bg-transparent text-slate-200 font-bold focus:outline-hidden"
                />
                <span>%</span>
              </div>
            </div>

            {/* Meta Master */}
            <div className="p-3 rounded-xl bg-[#0b1120] border border-rose-500/40 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between">
                <span>3. Master</span>
                <Sparkles className="w-3 h-3 text-rose-400" />
              </span>
              <input
                type="number"
                value={metaMaster}
                onChange={(e) => setMetaMaster(e.target.value)}
                className="w-full text-xs font-black text-rose-300 bg-slate-900 px-2 py-1.5 rounded-lg border border-rose-500/50 focus:border-rose-400 focus:outline-hidden"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Comissão:</span>
                <input
                  type="number"
                  step="0.1"
                  value={percMaster}
                  onChange={(e) => setPercMaster(e.target.value)}
                  className="w-12 text-right bg-transparent text-rose-300 font-bold focus:outline-hidden"
                />
                <span>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback de Sucesso */}
        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Metas e distribuição salvas com sucesso no Supabase!</span>
          </div>
        )}

        {/* Rodapé com Botão Salvar */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1da1aa] hover:bg-[#188c94] text-white shadow-md shadow-[#1da1aa]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Gravando...' : 'Salvar Meta Mensal & Distribuição'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
