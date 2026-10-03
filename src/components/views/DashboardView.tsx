import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Target, 
  SmartphoneNfc, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
  Edit,
  Sun,
  CalendarDays,
  Layers,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { Sale, Expense } from '../../types';

interface DashboardViewProps {
  onOpenNewSale: () => void;
  onOpenDailyOutreach: () => void;
  onOpenNewExpense: () => void;
  onEditSale?: (sale: Sale) => void;
  onEditExpense?: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewSale,
  onOpenDailyOutreach,
  onOpenNewExpense,
  onEditSale,
  onEditExpense
}) => {
  const { 
    goals, 
    sales, 
    expenses, 
    dailyOutreach, 
    quickIncrementToday, 
    logDailyOutreach,
    deleteSale,
    setActiveTab 
  } = useApp();

  // Active section view toggle: 'daily' (Sessão Diária), 'monthly' (Sessão Mensal), or 'both' (Ambas as Sessões)
  const [activeSection, setActiveSection] = useState<'daily' | 'monthly' | 'both'>('daily');

  // Today reference string
  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Current month reference string
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  // Selected date for Daily Session
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Selected month for Monthly Session
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Notes state for daily outreach
  const [dailyNotes, setDailyNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Modal de confirmação para deletar venda sem window.confirm
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  // Date navigation handlers for Daily Session
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // Month navigation handlers for Monthly Session
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  // Human-readable formatted month name
  const formattedMonthName = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // ==========================================
  // 1. DADOS E MÉTRICAS DA SESSÃO DIÁRIA
  // ==========================================
  const selectedDateSales = useMemo(() => {
    return sales.filter(s => s.saleDate === selectedDate);
  }, [sales, selectedDate]);

  const selectedDateExpenses = useMemo(() => {
    return expenses.filter(e => e.date === selectedDate);
  }, [expenses, selectedDate]);

  const selectedDateOutreach = useMemo(() => {
    return dailyOutreach.find(d => d.date === selectedDate);
  }, [dailyOutreach, selectedDate]);

  const dailyOutreachCount = selectedDateOutreach ? selectedDateOutreach.count : 0;

  const dailyRevenue = useMemo(() => {
    return selectedDateSales.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);
  }, [selectedDateSales]);

  const dailyPlatesSold = useMemo(() => {
    return selectedDateSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  }, [selectedDateSales]);

  const dailyPlatesCost = useMemo(() => {
    return selectedDateSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  }, [selectedDateSales]);

  const dailyExpensesTotal = useMemo(() => {
    return selectedDateExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  }, [selectedDateExpenses]);

  // Lucro líquido do dia = Faturamento do dia - Custo de fabricação das placas vendidas no dia - Despesas do dia
  const dailyNetProfit = dailyRevenue - dailyPlatesCost - dailyExpensesTotal;
  const dailyProfitMargin = dailyRevenue > 0 ? (dailyNetProfit / dailyRevenue) * 100 : 0;
  const dailyAverageTicket = selectedDateSales.length > 0 ? dailyRevenue / selectedDateSales.length : 0;
  const dailyConversionRate = dailyOutreachCount > 0 ? (selectedDateSales.length / dailyOutreachCount) * 100 : 0;

  // Placas aguardando gravação vendidas no dia
  const dailyPendingNfc = selectedDateSales.filter(s => s.nfcStatus === 'aguardando_gravacao');

  // Quick outreach increment for selected date
  const handleDailyOutreachIncrement = (amount: number) => {
    if (selectedDate === todayStr) {
      quickIncrementToday(amount);
    } else {
      const current = selectedDateOutreach ? selectedDateOutreach.count : 0;
      const updated = Math.max(0, current + amount);
      logDailyOutreach(selectedDate, updated, selectedDateOutreach?.notes || '');
    }
  };

  const handleSaveDailyNotes = () => {
    logDailyOutreach(selectedDate, dailyOutreachCount, dailyNotes);
    setIsEditingNotes(false);
  };

  // ==========================================
  // 2. DADOS E MÉTRICAS DA SESSÃO MENSAL
  // ==========================================
  const selectedMonthSales = useMemo(() => {
    return sales.filter(s => s.saleDate && s.saleDate.startsWith(selectedMonth));
  }, [sales, selectedMonth]);

  const selectedMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const selectedMonthOutreachList = useMemo(() => {
    return dailyOutreach.filter(d => d.date && d.date.startsWith(selectedMonth));
  }, [dailyOutreach, selectedMonth]);

  const monthlyOutreachTotal = useMemo(() => {
    return selectedMonthOutreachList.reduce((acc, d) => acc + (d.count || 0), 0);
  }, [selectedMonthOutreachList]);

  const monthlyRevenue = useMemo(() => {
    return selectedMonthSales.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);
  }, [selectedMonthSales]);

  const monthlyPlatesSold = useMemo(() => {
    return selectedMonthSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
  }, [selectedMonthSales]);

  const monthlyPlatesCost = useMemo(() => {
    return selectedMonthSales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  }, [selectedMonthSales]);

  const monthlyExpensesTotal = useMemo(() => {
    return selectedMonthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  }, [selectedMonthExpenses]);

  const monthlyNetProfit = monthlyRevenue - monthlyPlatesCost - monthlyExpensesTotal;
  const monthlyProfitMargin = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : 0;
  const monthlyAverageTicket = selectedMonthSales.length > 0 ? monthlyRevenue / selectedMonthSales.length : 0;
  const monthlyConversionRate = monthlyOutreachTotal > 0 ? (selectedMonthSales.length / monthlyOutreachTotal) * 100 : 0;

  // Monthly goals progress
  const revenueGoal = goals.monthlyRevenueGoal || 5000;
  const platesGoal = goals.monthlyPlatesGoal || 60;
  const outreachGoal = goals.monthlyOutreachGoal || 50;

  const monthlyRevenueProgress = revenueGoal > 0 ? Math.min(100, (monthlyRevenue / revenueGoal) * 100) : 0;
  const monthlyPlatesProgress = platesGoal > 0 ? Math.min(100, (monthlyPlatesSold / platesGoal) * 100) : 0;
  const monthlyOutreachProgress = outreachGoal > 0 ? Math.min(100, (monthlyOutreachTotal / outreachGoal) * 100) : 0;

  // Pending NFC plates in the month
  const monthlyPendingNfc = selectedMonthSales.filter(s => s.nfcStatus === 'aguardando_gravacao');

  // Model breakdown for the month
  const monthlyModelStats = useMemo(() => {
    return selectedMonthSales.reduce((acc, sale) => {
      acc[sale.plateModel] = (acc[sale.plateModel] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedMonthSales]);

  // Expenses breakdown by category for the month
  const monthlyExpensesByCategory = useMemo(() => {
    return selectedMonthExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedMonthExpenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner with Garcia Styling */}
      <div 
        id="dashboard-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#060F22] via-[#0A1A3A] to-[#08152E] border border-[#0066FE]/40 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#0066FE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-[#00D2FF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FE]/20 border border-[#0066FE]/50 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>GARCIA® Design Studio • Placas NFC Google Review</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Painel de Gestão & Faturamento
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Alterne entre a <strong className="text-white">Sessão Diária</strong> (rotina do dia, visitas e vendas de hoje) e a <strong className="text-white">Sessão Mensal</strong> (faturamento consolidado, metas e fechamento do mês).
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-btn-new-sale"
              onClick={onOpenNewSale}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 shadow-[0_0_20px_rgba(0,102,254,0.5)] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Nova Venda NFC (R$ 80)</span>
            </button>
            <button
              id="hero-btn-daily-outreach"
              onClick={onOpenDailyOutreach}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-blue-200 bg-[#0B1A38] border border-[#0066FE]/40 hover:bg-[#0066FE]/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Registrar Abordagens</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Two-Session Switcher (Sessão Diária & Sessão Mensal) */}
      <div 
        id="dashboard-session-selector"
        className="p-1.5 sm:p-2 rounded-2xl bg-[#0A162B] border border-slate-800 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Sessão Diária Tab */}
          <button
            id="tab-sessao-diaria"
            type="button"
            onClick={() => setActiveSection('daily')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'daily'
                ? 'bg-gradient-to-r from-[#0052FF] to-[#0072FF] text-white shadow-[0_0_20px_rgba(0,102,254,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeSection === 'daily' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>Sessão Diária</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeSection === 'daily' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {formatCurrency(dailyRevenue)}
            </span>
          </button>

          {/* Sessão Mensal Tab */}
          <button
            id="tab-sessao-mensal"
            type="button"
            onClick={() => setActiveSection('monthly')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeSection === 'monthly'
                ? 'bg-gradient-to-r from-[#0052FF] to-[#0072FF] text-white shadow-[0_0_20px_rgba(0,102,254,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className={`w-4 h-4 ${activeSection === 'monthly' ? 'text-[#00D2FF]' : 'text-slate-400'}`} />
            <span>Sessão Mensal</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeSection === 'monthly' ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {formatCurrency(monthlyRevenue)}
            </span>
          </button>
        </div>

        {/* View All / Ambas as Sessões button */}
        <button
          id="tab-sessao-ambas"
          type="button"
          onClick={() => setActiveSection('both')}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            activeSection === 'both'
              ? 'bg-[#0066FE]/20 border border-[#0066FE] text-[#00D2FF]'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
          title="Exibir Sessão Diária e Sessão Mensal juntas na mesma página"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Ver Ambas as Sessões</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ======================== 1. SESSÃO DIÁRIA =============================== */}
      {/* ========================================================================= */}
      {(activeSection === 'daily' || activeSection === 'both') && (
        <section 
          id="sessao-diaria-container"
          className="space-y-6 pt-2"
        >
          {/* Header da Sessão Diária com Seletor de Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A162B] border border-blue-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">Sessão Diária</h2>
                  {selectedDate === todayStr ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      HOJE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Histórico
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Desempenho de vendas, faturamento líquido e abordagens em {formatDate(selectedDate)}
                </p>
              </div>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title="Dia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#0066FE] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title="Próximo dia"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedDate !== todayStr && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="px-3 py-2 rounded-xl bg-[#0066FE]/20 hover:bg-[#0066FE]/30 border border-[#0066FE]/40 text-blue-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Voltar para Hoje
                </button>
              )}

              <button
                type="button"
                onClick={onOpenNewSale}
                className="px-3 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0066FE] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Venda</span>
              </button>
            </div>
          </div>

          {/* Grid de 4 KPIs Diários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Diário 1: Faturamento do Dia */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-emerald-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Faturamento do Dia</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {formatCurrency(dailyRevenue)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    {selectedDateSales.length} {selectedDateSales.length === 1 ? 'venda' : 'vendas'}
                  </span>
                  <span>• {dailyPlatesSold} placas</span>
                </div>
              </div>
            </div>

            {/* KPI Diário 2: Lucro Líquido do Dia */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-blue-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Lucro Líquido do Dia</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black tracking-tight ${dailyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(dailyNetProfit)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-blue-300 font-semibold">
                    {formatPercent(dailyProfitMargin)} margem
                  </span>
                  {dailyExpensesTotal > 0 && (
                    <span className="text-rose-400 font-medium">
                      • Despesas: -{formatCurrency(dailyExpensesTotal)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* KPI Diário 3: Placas NFC Vendidas no Dia */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-purple-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Placas Vendidas no Dia</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <SmartphoneNfc className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {dailyPlatesSold} <span className="text-base font-normal text-slate-400">un</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-purple-300 font-semibold">
                    Ticket médio: {formatCurrency(dailyAverageTicket)}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Diário 4: Abordagens do Dia */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-amber-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Abordagens no Dia</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {dailyOutreachCount} <span className="text-base font-normal text-slate-400">visitas</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="text-amber-400 font-semibold">
                      {dailyConversionRate.toFixed(0)}% conversão
                    </span>
                  </div>
                </div>

                {/* Botões rápidos +1 / -1 direto no card diário */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDailyOutreachIncrement(-1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700 active:scale-95"
                    title="Diminuir 1 abordagem"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDailyOutreachIncrement(1)}
                    className="w-8 h-8 rounded-lg bg-[#0052FF] hover:bg-[#0066FE] text-white flex items-center justify-center transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-95"
                    title="Adicionar 1 abordagem"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Principal da Sessão Diária: Vendas do Dia + Widget de Abordagem/Rota */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Vendas do Dia */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alerta de placas do dia aguardando gravação */}
              {dailyPendingNfc.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-300">
                        {dailyPendingNfc.length} placa(s) vendida(s) neste dia aguardando gravação NFC
                      </p>
                      <p className="text-amber-200/80">
                        Grave os links de 5 estrelas do Google Maps antes da entrega ao cliente.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('nfc_tools')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Gravar Agora
                  </button>
                </div>
              )}

              {/* Tabela de Vendas do Dia */}
              <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Vendas Realizadas no Dia ({formatDate(selectedDate)})
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Total: {formatCurrency(dailyRevenue)}
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                        <th className="pb-3 font-semibold">Empresa / Cliente</th>
                        <th className="pb-3 font-semibold">Modelo</th>
                        <th className="pb-3 font-semibold text-center">Qtd</th>
                        <th className="pb-3 font-semibold">Valor</th>
                        <th className="pb-3 font-semibold">Status NFC</th>
                        <th className="pb-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {selectedDateSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <ShoppingBag className="w-8 h-8 text-slate-600" />
                              <p className="text-sm font-semibold text-slate-300">
                                Nenhuma venda registrada em {formatDate(selectedDate)}
                              </p>
                              <p className="text-xs text-slate-500 max-w-sm">
                                Lance as placas NFC comercializadas nesta data para atualizar seu faturamento e relatórios diários.
                              </p>
                              <button
                                type="button"
                                onClick={onOpenNewSale}
                                className="mt-2 px-4 py-2 rounded-xl bg-[#0066FE] hover:bg-[#0052FF] text-xs font-bold text-white shadow-md shadow-blue-500/20 cursor-pointer"
                              >
                                + Lançar Venda em {formatDate(selectedDate)}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        selectedDateSales.map(sale => (
                          <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 font-medium text-white">
                              {sale.companyName}
                              {sale.contactName && (
                                <span className="block text-[10px] text-slate-400">{sale.contactName}</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-300 max-w-[180px] truncate" title={sale.plateModel}>
                              {sale.plateModel.replace(' Google NFC', '')}
                            </td>
                            <td className="py-3 text-center font-bold text-blue-300">
                              {sale.quantity}x
                            </td>
                            <td className="py-3 font-bold text-emerald-400">
                              {formatCurrency(sale.totalRevenue)}
                              {sale.discount && sale.discount > 0 ? (
                                <span className="block text-[10px] text-emerald-300/80">
                                  Desc: -{formatCurrency(sale.discount)}
                                </span>
                              ) : null}
                            </td>
                            <td className="py-3">
                              {sale.nfcStatus === 'entregue_instalado' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Entregue
                                </span>
                              )}
                              {sale.nfcStatus === 'gravado_testado' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Gravado
                                </span>
                              )}
                              {sale.nfcStatus === 'aguardando_gravacao' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Gravar Chip
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {sale.googleReviewUrl && (
                                  <a
                                    href={sale.googleReviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                                    title="Testar Link Google"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {onEditSale && (
                                  <button
                                    type="button"
                                    onClick={() => onEditSale(sale)}
                                    className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Editar Venda"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSaleToDelete(sale)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                  title="Excluir Venda"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coluna 3: Widget de Abordagem do Dia & Despesas do Dia */}
            <div className="space-y-6">
              {/* Widget de Abordagens de Empresas no Dia */}
              <div 
                id="daily-outreach-widget"
                className="p-6 rounded-3xl bg-[#0A162B] border border-blue-500/30 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Abordagens do Dia
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {formatDate(selectedDate)}
                  </span>
                </div>

                {/* 1-tap counter para o dia selecionado */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0C1B33] to-[#060D1A] border border-slate-800 text-center space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Empresas visitadas nesta data:
                  </span>

                  <div className="flex items-center justify-center gap-3 py-1">
                    <button
                      type="button"
                      onClick={() => handleDailyOutreachIncrement(-1)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-transform active:scale-95 border border-slate-700 cursor-pointer"
                      title="Diminuir 1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-24">
                      <span className="text-3xl font-black text-white block">
                        {dailyOutreachCount}
                      </span>
                      <span className="text-[10px] text-slate-400 -mt-1 block">
                        empresas
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDailyOutreachIncrement(1)}
                      className="w-10 h-10 rounded-xl bg-[#0052FF] hover:bg-[#0066FE] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer"
                      title="Aumentar 1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botões rápidos de incremento */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDailyOutreachIncrement(3)}
                      className="px-3 py-1 rounded-lg bg-[#0A162B] hover:bg-[#0066FE]/20 text-blue-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      +3 visitas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDailyOutreachIncrement(5)}
                      className="px-3 py-1 rounded-lg bg-[#0A162B] hover:bg-[#0066FE]/20 text-blue-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      +5 visitas
                    </button>
                  </div>
                </div>

                {/* Resumo do dia: Conversão */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Vendas no Dia</span>
                    <span className="text-base font-black text-emerald-400">{selectedDateSales.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800/80">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Conversão no Dia</span>
                    <span className="text-base font-black text-blue-400">{dailyConversionRate.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Anotação rápida do dia (Bairro, rota) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                    <span>Rota / Bairro visitado no dia:</span>
                    {!isEditingNotes && (
                      <button
                        type="button"
                        onClick={() => {
                          setDailyNotes(selectedDateOutreach?.notes || '');
                          setIsEditingNotes(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        {selectedDateOutreach?.notes ? 'Editar nota' : '+ Adicionar nota'}
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={dailyNotes}
                        onChange={(e) => setDailyNotes(e.target.value)}
                        placeholder="Ex: Lojas do Centro, Bairro Jardins..."
                        className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#0066FE]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingNotes(false)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveDailyNotes}
                          className="px-3 py-1 rounded-lg bg-[#0066FE] text-white text-xs font-bold"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-[#060D1A] rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                      {selectedDateOutreach?.notes || 'Nenhuma anotação de rota registrada para esta data.'}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onOpenDailyOutreach}
                  className="w-full py-2.5 rounded-xl bg-[#0B1A38] hover:bg-[#0066FE]/20 border border-[#0066FE]/40 text-blue-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ver Histórico Completo de Abordagens</span>
                </button>
              </div>

              {/* Despesas Lançadas no Dia */}
              <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Despesas do Dia
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-rose-400">
                    {formatCurrency(dailyExpensesTotal)}
                  </span>
                </div>

                {selectedDateExpenses.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    <p>Nenhuma despesa lançada nesta data.</p>
                    <button
                      type="button"
                      onClick={onOpenNewExpense}
                      className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer block mx-auto"
                    >
                      + Lançar despesa em {formatDate(selectedDate)}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDateExpenses.map(exp => (
                      <div 
                        key={exp.id} 
                        className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate max-w-[170px]">
                          <p className="font-semibold text-white truncate">{exp.description}</p>
                          <p className="text-[10px] text-slate-400 truncate">{exp.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-400">-{formatCurrency(exp.amount)}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={onOpenNewExpense}
                      className="w-full py-1.5 text-xs text-center text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      + Adicionar outra despesa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ======================== 2. SESSÃO MENSAL =============================== */}
      {/* ========================================================================= */}
      {(activeSection === 'monthly' || activeSection === 'both') && (
        <section 
          id="sessao-mensal-container"
          className="space-y-6 pt-2"
        >
          {/* Header da Sessão Mensal com Seletor de Mês */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0A162B] border border-indigo-500/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[#00D2FF] shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">Sessão Mensal</h2>
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0066FE]/20 text-blue-300 border border-[#0066FE]/40">
                    {formattedMonthName}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Visão consolidada de faturamento, metas, margem líquida e produção NFC do mês
                </p>
              </div>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#0066FE] cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {selectedMonth !== currentMonthStr && (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(currentMonthStr)}
                  className="px-3 py-2 rounded-xl bg-[#0066FE]/20 hover:bg-[#0066FE]/30 border border-[#0066FE]/40 text-blue-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Mês Atual
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('goals')}
                className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Metas do Mês</span>
              </button>
            </div>
          </div>

          {/* Grid de 4 KPIs Mensais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Mensal 1: Faturamento do Mês */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-emerald-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Faturamento do Mês</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {formatCurrency(monthlyRevenue)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    {monthlyRevenueProgress.toFixed(0)}% da meta
                  </span>
                  <span>• {selectedMonthSales.length} vendas</span>
                </div>
              </div>
            </div>

            {/* KPI Mensal 2: Lucro Líquido Real do Mês */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-blue-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Lucro Líquido Mensal</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-black tracking-tight ${monthlyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(monthlyNetProfit)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="font-semibold text-blue-300">
                    {formatPercent(monthlyProfitMargin)} margem
                  </span>
                  <span>• Custo R$ 12,80/un</span>
                </div>
              </div>
            </div>

            {/* KPI Mensal 3: Placas NFC Vendidas no Mês */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-purple-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Placas Vendidas no Mês</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <SmartphoneNfc className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {monthlyPlatesSold} <span className="text-base font-normal text-slate-400">/ {platesGoal} un</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-purple-300 font-semibold">
                    Ticket médio: {formatCurrency(monthlyAverageTicket)}
                  </span>
                </div>
              </div>
            </div>

            {/* KPI Mensal 4: Empresas Abordadas no Mês */}
            <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-amber-500/40 transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Abordagens no Mês</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black tracking-tight text-white">
                  {monthlyOutreachTotal} <span className="text-base font-normal text-slate-400">/ {outreachGoal}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-amber-400 font-bold">
                    {monthlyConversionRate.toFixed(1)}% conversão
                  </span>
                  <span>• {monthlyOutreachProgress.toFixed(0)}% da meta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ritmo de Metas do Mês com Barras de Progresso */}
          <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#0066FE]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Progresso das Metas de {formattedMonthName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('goals')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Definir valores de metas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Meta 1: Faturamento Mensal */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-300">Faturamento Mensal</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(monthlyRevenue)} / {formatCurrency(revenueGoal)}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0052FF] via-[#0066FE] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${monthlyRevenueProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{monthlyRevenueProgress.toFixed(1)}% atingido</span>
                  <span>Falta {formatCurrency(Math.max(0, revenueGoal - monthlyRevenue))}</span>
                </div>
              </div>

              {/* Meta 2: Placas Vendidas */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-300">Placas NFC Vendidas</span>
                  <span className="font-bold text-blue-400">
                    {monthlyPlatesSold} / {platesGoal} un
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-[#00D2FF] rounded-full transition-all duration-500"
                    style={{ width: `${monthlyPlatesProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{monthlyPlatesProgress.toFixed(1)}% atingido</span>
                  <span>Falta {Math.max(0, platesGoal - monthlyPlatesSold)} placas</span>
                </div>
              </div>

              {/* Meta 3: Abordagens */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-300">Empresas Abordadas</span>
                  <span className="font-bold text-purple-400">
                    {monthlyOutreachTotal} / {outreachGoal}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full transition-all duration-500"
                    style={{ width: `${monthlyOutreachProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{monthlyOutreachProgress.toFixed(1)}% atingido</span>
                  <span>Falta {Math.max(0, outreachGoal - monthlyOutreachTotal)} abordagens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Principal da Sessão Mensal: Vendas do Mês + Distribuição e Despesas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1 & 2: Vendas do Mês */}
            <div className="lg:col-span-2 space-y-6">
              {/* Alerta de fila de gravação do mês */}
              {monthlyPendingNfc.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-amber-300">
                        {monthlyPendingNfc.length} placa(s) no mês aguardando gravação NFC
                      </p>
                      <p className="text-amber-200/80">
                        Acesse a aba Gravar NFC para programar as tags NTAG213/215 com os links do Google.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('nfc_tools')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Ver Fila NFC
                  </button>
                </div>
              )}

              {/* Tabela de Vendas do Mês */}
              <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Vendas Realizadas em {formattedMonthName} ({selectedMonthSales.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sales')}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver na aba Vendas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                        <th className="pb-3 font-semibold">Data / Empresa</th>
                        <th className="pb-3 font-semibold">Modelo</th>
                        <th className="pb-3 font-semibold text-center">Qtd</th>
                        <th className="pb-3 font-semibold">Faturamento</th>
                        <th className="pb-3 font-semibold">Status NFC</th>
                        <th className="pb-3 font-semibold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {selectedMonthSales.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <ShoppingBag className="w-8 h-8 text-slate-600" />
                              <p className="text-sm font-semibold text-slate-300">
                                Nenhuma venda registrada para o mês de {formattedMonthName}
                              </p>
                              <p className="text-xs text-slate-500 max-w-sm">
                                As vendas efetuadas nas datas deste mês serão exibidas aqui automaticamente.
                              </p>
                              <button
                                type="button"
                                onClick={onOpenNewSale}
                                className="mt-2 px-4 py-2 rounded-xl bg-[#0066FE] hover:bg-[#0052FF] text-xs font-bold text-white shadow-md shadow-blue-500/20 cursor-pointer"
                              >
                                + Lançar Venda
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        selectedMonthSales.slice(0, 10).map(sale => (
                          <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 font-medium text-white">
                              {sale.companyName}
                              <span className="block text-[10px] text-slate-400">{formatDate(sale.saleDate)}</span>
                            </td>
                            <td className="py-3 text-slate-300 max-w-[180px] truncate" title={sale.plateModel}>
                              {sale.plateModel.replace(' Google NFC', '')}
                            </td>
                            <td className="py-3 text-center font-bold text-blue-300">
                              {sale.quantity}x
                            </td>
                            <td className="py-3 font-bold text-emerald-400">
                              {formatCurrency(sale.totalRevenue)}
                            </td>
                            <td className="py-3">
                              {sale.nfcStatus === 'entregue_instalado' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Entregue
                                </span>
                              )}
                              {sale.nfcStatus === 'gravado_testado' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Gravado
                                </span>
                              )}
                              {sale.nfcStatus === 'aguardando_gravacao' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Gravar Chip
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {sale.googleReviewUrl && (
                                  <a
                                    href={sale.googleReviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                                    title="Testar Link Google"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {onEditSale && (
                                  <button
                                    type="button"
                                    onClick={() => onEditSale(sale)}
                                    className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                    title="Editar Venda"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSaleToDelete(sale)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                  title="Excluir Venda"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coluna 3: Modelos Mais Vendidos no Mês & Despesas do Mês */}
            <div className="space-y-6">
              {/* Distribuição de Modelos Mais Vendidos */}
              <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                  <SmartphoneNfc className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Modelos Vendidos no Mês
                  </h3>
                </div>

                <div className="mt-4 space-y-3">
                  {Object.keys(monthlyModelStats).length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Nenhum modelo vendido neste mês.
                    </div>
                  ) : (
                    Object.entries(monthlyModelStats).map(([model, qty]) => {
                      const count = Number(qty) || 0;
                      const percent = monthlyPlatesSold > 0 ? (count / monthlyPlatesSold) * 100 : 0;
                      return (
                        <div key={model} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 truncate max-w-[190px]" title={model}>
                              {model}
                            </span>
                            <span className="font-bold text-white">{count} un ({percent.toFixed(0)}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#0066FE] to-[#00D2FF] rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Despesas Operacionais do Mês por Categoria */}
              <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Despesas de {formattedMonthName}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-rose-400">
                    {formatCurrency(monthlyExpensesTotal)}
                  </span>
                </div>

                {Object.keys(monthlyExpensesByCategory).length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    <p>Nenhuma despesa registrada neste mês.</p>
                    <button
                      type="button"
                      onClick={onOpenNewExpense}
                      className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer block mx-auto"
                    >
                      + Lançar Despesa
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {Object.entries(monthlyExpensesByCategory).map(([cat, val]) => (
                      <div key={cat} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 truncate max-w-[180px]">{cat}</span>
                        <span className="font-bold text-rose-400">-{formatCurrency(Number(val) || 0)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold text-white">
                      <span>Total Despesas:</span>
                      <span className="text-rose-400">-{formatCurrency(monthlyExpensesTotal)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab('finances')}
                  className="w-full py-2.5 rounded-xl bg-[#0B1A38] hover:bg-[#0066FE]/20 border border-[#0066FE]/40 text-blue-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Ver Gestão Financeira Completa</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal In-App de Confirmação para Excluir Venda (Funciona perfeitamente em iframes e celulares sem depender de window.confirm) */}
      {saleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0A162B] border border-rose-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Excluir Registro de Venda?</h3>
                <p className="text-xs text-slate-400">Esta ação removerá a venda imediatamente da lista e do banco.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#060D1A] rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white truncate">{saleToDelete.companyName || 'Cliente Avulso'}</p>
              <p className="text-slate-400">
                {saleToDelete.quantity} {saleToDelete.quantity === 1 ? 'placa' : 'placas'} • {formatCurrency(saleToDelete.totalRevenue)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-sale-dashboard-btn"
                type="button"
                onClick={() => {
                  deleteSale(saleToDelete.id);
                  setSaleToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Apagar Venda</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
