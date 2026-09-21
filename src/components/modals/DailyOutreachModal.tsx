import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Users, 
  Calendar, 
  Plus, 
  Minus, 
  Check, 
  FileText, 
  Trash2, 
  TrendingUp, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface DailyOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyOutreachModal: React.FC<DailyOutreachModalProps> = ({
  isOpen,
  onClose
}) => {
  const { dailyOutreach, logDailyOutreach, deleteDailyOutreach, stats } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Initialize count with existing count for the selected date if available, or default to 5
  const existingForDate = dailyOutreach.find(d => d.date === selectedDate);
  const [count, setCount] = useState<number>(existingForDate ? existingForDate.count : 5);
  const [notes, setNotes] = useState<string>(existingForDate?.notes || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Update form if user switches date
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const found = dailyOutreach.find(d => d.date === newDate);
    if (found) {
      setCount(found.count);
      setNotes(found.notes || '');
    } else {
      setCount(5);
      setNotes('');
    }
  };

  const handleIncrement = (amount: number) => {
    setCount(prev => Math.max(0, prev + amount));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    logDailyOutreach(selectedDate, count, notes.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto overscroll-none animate-in fade-in duration-200">
      <div 
        id="daily-outreach-modal-card"
        className="w-full max-w-xl bg-[#0A162B] border border-[#0066FE]/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#060D1A]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0066FE]/20 border border-[#0066FE]/50 flex items-center justify-center text-[#0066FE] shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                Registrar Empresas Abordadas no Dia
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Acompanhe o ritmo diário de visitas e prospecção de placas NFC
              </p>
            </div>
          </div>
          <button
            id="close-daily-outreach-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} noValidate className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#060D1A] rounded-2xl border border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Abordagens Hoje</span>
              <span className="text-lg font-black text-blue-400">{stats.todayApproached}</span>
            </div>
            <div className="border-x border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Mês</span>
              <span className="text-lg font-black text-white">{stats.companiesApproached}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Taxa Conversão</span>
              <span className="text-lg font-black text-emerald-400">{stats.conversionRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Data da Prospecção
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-blue-400 absolute left-3.5 top-3" />
              <input
                id="outreach-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-[#0066FE]"
              />
            </div>
          </div>

          {/* Big Interactive Counter */}
          <div className="p-5 bg-gradient-to-b from-[#0B1A38] to-[#060D1A] rounded-2xl border border-[#0066FE]/30 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block">
              Quantas empresas foram abordadas nesta data?
            </span>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleIncrement(-1)}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-transform active:scale-95 border border-slate-700"
                aria-label="Diminuir"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="w-28">
                <input
                  id="outreach-count-input"
                  type="number"
                  min="0"
                  max="999"
                  value={count}
                  onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-center text-4xl font-black text-white bg-transparent border-none focus:outline-none focus:ring-0 selection:bg-blue-600"
                />
                <span className="text-[11px] text-slate-400 font-medium block -mt-1">
                  empresas
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleIncrement(1)}
                className="w-12 h-12 rounded-xl bg-[#0052FF] hover:bg-[#0066FE] text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                aria-label="Aumentar"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Chips */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[10px] text-slate-400 mr-1">Atalhos:</span>
              {[1, 3, 5, 10].map(addVal => (
                <button
                  key={addVal}
                  type="button"
                  onClick={() => handleIncrement(addVal)}
                  className="px-2.5 py-1 rounded-lg bg-[#0A162B] hover:bg-[#0066FE]/20 text-blue-300 border border-slate-700 hover:border-[#0066FE]/50 text-xs font-semibold transition-colors"
                >
                  +{addVal}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Visited areas */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Observações / Regiões Visitadas (Opcional)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="outreach-notes-input"
                type="text"
                placeholder="Ex: Av. Paulista, Centro, visitas a restaurantes e barbearias..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            id="btn-save-daily-outreach"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 shadow-lg shadow-blue-500/25 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Registrado com Sucesso!</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Salvar Abordagens do Dia ({count} Empresas)</span>
              </>
            )}
          </button>

          {/* History List */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Histórico de Dias Registrados ({dailyOutreach.length})
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {dailyOutreach.map(record => (
                <div 
                  key={record.id}
                  className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-[#0066FE]/20 text-blue-300 border border-[#0066FE]/30">
                      {record.count} empresas
                    </span>
                    <div>
                      <span className="font-semibold text-white block">
                        {formatDate(record.date)} {record.date === todayStr ? '• Hoje' : ''}
                      </span>
                      {record.notes && (
                        <span className="text-[11px] text-slate-400 line-clamp-1">
                          {record.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDailyOutreach(record.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remover registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
