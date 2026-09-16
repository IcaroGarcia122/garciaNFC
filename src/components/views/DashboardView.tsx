import React from 'react';
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
  MessageSquare,
  AlertCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  MapPin
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenNewSale: () => void;
  onOpenDailyOutreach: () => void;
  onOpenNewExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewSale,
  onOpenDailyOutreach,
  onOpenNewExpense
}) => {
  const { stats, goals, sales, dailyOutreach, quickIncrementToday, setActiveTab } = useApp();

  // Monthly progress
  const revenueProgress = goals.monthlyRevenueGoal > 0 
    ? Math.min(100, (stats.totalRevenue / goals.monthlyRevenueGoal) * 100) 
    : 0;

  const platesProgress = goals.monthlyPlatesGoal > 0 
    ? Math.min(100, (stats.platesSold / goals.monthlyPlatesGoal) * 100) 
    : 0;

  const outreachGoal = goals.monthlyOutreachGoal || 50;
  const outreachProgress = outreachGoal > 0 
    ? Math.min(100, (stats.companiesApproached / outreachGoal) * 100) 
    : 0;

  // Pending NFC plates to engrave
  const pendingPlatesSales = sales.filter(s => s.nfcStatus === 'aguardando_gravacao');

  // Recent 5 sales
  const recentSales = [...sales].slice(0, 5);

  // Group sales by model for chart
  const modelStats = sales.reduce((acc, sale) => {
    acc[sale.plateModel] = (acc[sale.plateModel] || 0) + sale.quantity;
    return acc;
  }, {} as Record<string, number>);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner with Garcia Styling */}
      <div 
        id="dashboard-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#060F22] via-[#0A1A3A] to-[#08152E] border border-[#0066FE]/40 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        {/* Ambient lighting glow */}
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
              Monitore abordagens diárias, vendas de placas NFC a R$ 80,00, faturamento bruto, margem líquida e o status de gravação dos chips para o Google Maps.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-btn-new-sale"
              onClick={onOpenNewSale}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 shadow-[0_0_20px_rgba(0,102,254,0.5)] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Nova Venda NFC (R$ 80)</span>
            </button>
            <button
              id="hero-btn-daily-outreach"
              onClick={onOpenDailyOutreach}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-blue-200 bg-[#0B1A38] border border-[#0066FE]/40 hover:bg-[#0066FE]/20 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Registrar Abordagens do Dia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Faturamento Bruto */}
        <div 
          id="kpi-total-revenue"
          className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Bruto</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {stats.platesSold} placas
              </span>
              <span>• R$ 80 padrão</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Lucro Líquido Real */}
        <div 
          id="kpi-net-profit"
          className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Lucro Líquido Real</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-emerald-400 group-hover:text-emerald-300 transition-colors">
              {formatCurrency(stats.netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="font-semibold text-blue-300">
                {formatPercent(stats.profitMargin)} de margem
              </span>
              <span>• Custo R$ 12,80/un</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Placas NFC Vendidas */}
        <div 
          id="kpi-plates-sold"
          className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/50 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Placas Vendidas</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <SmartphoneNfc className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
              {stats.platesSold} <span className="text-base font-normal text-slate-400">un</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-purple-300 font-semibold">
                Ticket médio: {formatCurrency(stats.averageTicket)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Empresas Abordadas */}
        <div 
          id="kpi-companies-approached"
          className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/50 transition-all duration-200 group cursor-pointer"
          onClick={onOpenDailyOutreach}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Empresas Abordadas</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
              {stats.companiesApproached} <span className="text-base font-normal text-slate-400">total</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-amber-400 font-bold">
                {stats.todayApproached} hoje
              </span>
              <span>• {stats.conversionRate.toFixed(1)}% conversão</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress towards Monthly Goals */}
      <div 
        id="goals-overview-card"
        className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Target className="w-5 h-5 text-[#0066FE]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Ritmo de Vendas & Metas do Mês
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('goals')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Ver detalhes de metas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Meta 1: Faturamento */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-300">Faturamento Mensal</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(stats.totalRevenue)} / {formatCurrency(goals.monthlyRevenueGoal)}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#0052FF] via-[#0066FE] to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${revenueProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{revenueProgress.toFixed(1)}% atingido</span>
              <span>Falta {formatCurrency(Math.max(0, goals.monthlyRevenueGoal - stats.totalRevenue))}</span>
            </div>
          </div>

          {/* Meta 2: Placas Vendidas */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-300">Placas NFC Vendidas</span>
              <span className="font-bold text-blue-400">
                {stats.platesSold} / {goals.monthlyPlatesGoal} un
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-[#00D2FF] rounded-full transition-all duration-500"
                style={{ width: `${platesProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{platesProgress.toFixed(1)}% atingido</span>
              <span>Falta {Math.max(0, goals.monthlyPlatesGoal - stats.platesSold)} placas</span>
            </div>
          </div>

          {/* Meta 3: Abordagens */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-300">Empresas Abordadas</span>
              <span className="font-bold text-purple-400">
                {stats.companiesApproached} / {outreachGoal}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-400 rounded-full transition-all duration-500"
                style={{ width: `${outreachProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{outreachProgress.toFixed(1)}% atingido</span>
              <span>Falta {Math.max(0, outreachGoal - stats.companiesApproached)} abordagens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Sales Table & Daily Outreach Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Sales & Production Tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* NFC Production Queue Alert */}
          {pendingPlatesSales.length > 0 && (
            <div 
              id="nfc-queue-alert-box"
              className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    {pendingPlatesSales.length} Pedido(s) aguardando gravação NFC
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Grave os links das avaliações do Google nos chips NTAG das placas vendidas antes da entrega.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                Ver Fila de Gravação
              </button>
            </div>
          )}

          {/* Vendas Recentes Table */}
          <div 
            id="recent-sales-card"
            className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Últimas Vendas de Placas NFC (R$ 80 padrão)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('sales')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Ver todas ({sales.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                    <th className="pb-3 font-semibold">Empresa</th>
                    <th className="pb-3 font-semibold">Modelo</th>
                    <th className="pb-3 font-semibold text-center">Qtd</th>
                    <th className="pb-3 font-semibold">Valor Final</th>
                    <th className="pb-3 font-semibold">Status NFC</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <ShoppingBag className="w-8 h-8 text-slate-600" />
                          <p className="text-sm font-semibold text-slate-300">Nenhuma venda registrada ainda</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Seu painel está limpo e zerado. Clique no botão abaixo para lançar sua primeira venda de placa NFC.
                          </p>
                          <button
                            type="button"
                            onClick={onOpenNewSale}
                            className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#0066FE] hover:bg-[#0052FF] text-xs font-bold text-white shadow-md shadow-blue-500/20"
                          >
                            + Lançar Primeira Venda (R$ 80)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentSales.map(sale => (
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
                              Gravado & Pronto
                            </span>
                          )}
                          {sale.nfcStatus === 'aguardando_gravacao' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Gravar Chip
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {sale.googleReviewUrl && (
                            <a
                              href={sale.googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                              title="Testar Link Google"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Outreach Tracker & Model Distribution */}
        <div className="space-y-6">
          {/* Daily Outreach Widget requested by user */}
          <div 
            id="daily-outreach-widget"
            className="p-6 rounded-3xl bg-[#0A162B] border border-[#0066FE]/40 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Abordagens de Empresas
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Hoje
              </span>
            </div>

            {/* Quick 1-tap counter for today */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0C1B33] to-[#060D1A] border border-slate-800 text-center space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                Quantas empresas você abordou hoje?
              </span>

              <div className="flex items-center justify-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() => quickIncrementToday(-1)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-transform active:scale-95 border border-slate-700"
                  title="Diminuir 1"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="w-20">
                  <span className="text-3xl font-black text-white block">
                    {stats.todayApproached}
                  </span>
                  <span className="text-[10px] text-slate-400 -mt-1 block">
                    hoje
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => quickIncrementToday(1)}
                  className="w-9 h-9 rounded-xl bg-[#0052FF] hover:bg-[#0066FE] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-blue-500/20"
                  title="Aumentar 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Add buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => quickIncrementToday(3)}
                  className="px-2.5 py-1 rounded-lg bg-[#0A162B] hover:bg-[#0066FE]/20 text-blue-300 border border-slate-700 text-xs font-semibold"
                >
                  +3 visitas
                </button>
                <button
                  type="button"
                  onClick={() => quickIncrementToday(5)}
                  className="px-2.5 py-1 rounded-lg bg-[#0A162B] hover:bg-[#0066FE]/20 text-blue-300 border border-slate-700 text-xs font-semibold"
                >
                  +5 visitas
                </button>
              </div>
            </div>

            {/* Outreach Summary Stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Total no Mês</span>
                <span className="text-base font-black text-white">{stats.companiesApproached}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060D1A] border border-slate-800/80">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Conversão em Venda</span>
                <span className="text-base font-black text-emerald-400">{stats.conversionRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* Recent records snippet */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Últimos Dias Registrados:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                {dailyOutreach.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 bg-[#060D1A] rounded-xl border border-slate-800/80">
                    Nenhuma abordagem lançada ainda. Use os botões acima (+1, +3, +5) para registrar as empresas visitadas hoje.
                  </div>
                ) : (
                  dailyOutreach.slice(0, 4).map(rec => (
                    <div 
                      key={rec.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#060D1A] border border-slate-800/80 text-[11px]"
                    >
                      <span className="text-slate-300">
                        {formatDate(rec.date)} {rec.date === todayStr ? '(Hoje)' : ''}
                      </span>
                      <span className="font-bold text-blue-400">{rec.count} empresas</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Button to open full modal */}
            <button
              id="btn-open-outreach-modal"
              onClick={onOpenDailyOutreach}
              className="w-full py-2.5 rounded-xl bg-[#0B1A38] hover:bg-[#0066FE]/20 border border-[#0066FE]/40 text-blue-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ver Histórico Completo & Outras Datas</span>
            </button>
          </div>

          {/* Model Breakdown */}
          <div 
            id="models-distribution-card"
            className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl"
          >
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <SmartphoneNfc className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Modelos Mais Vendidos
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {Object.keys(modelStats).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Nenhum modelo vendido ainda.
                </div>
              ) : (
                Object.entries(modelStats).map(([model, qty]) => {
                  const count = Number(qty) || 0;
                  const percent = stats.platesSold > 0 ? (count / stats.platesSold) * 100 : 0;
                  return (
                    <div key={model} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[200px]" title={model}>
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
        </div>
      </div>
    </div>
  );
};
