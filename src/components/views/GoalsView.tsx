import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ArrowRight,
  Save,
  PartyPopper
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import confetti from 'canvas-confetti';

export const GoalsView: React.FC = () => {
  const { goals, stats, updateGoals } = useApp();

  const [revenueGoal, setRevenueGoal] = useState(goals.monthlyRevenueGoal);
  const [platesGoal, setPlatesGoal] = useState(goals.monthlyPlatesGoal);
  const [outreachGoal, setOutreachGoal] = useState(goals.monthlyOutreachGoal || 50);
  const [conversionGoal, setConversionGoal] = useState(goals.conversionRateGoal);
  const [selectedMonth, setSelectedMonth] = useState(goals.selectedMonth || '2026-09');
  const [isSaved, setIsSaved] = useState(false);

  // Simulator state: default price R$ 80.00 and cost R$ 12.80
  const [simulatedPlates, setSimulatedPlates] = useState(20);
  const [simulatedPrice, setSimulatedPrice] = useState(80.00);
  const [simulatedUnitCost, setSimulatedUnitCost] = useState(12.80);

  // Calculate percentages
  const revPct = goals.monthlyRevenueGoal > 0 ? (stats.totalRevenue / goals.monthlyRevenueGoal) * 100 : 0;
  const platePct = goals.monthlyPlatesGoal > 0 ? (stats.platesSold / goals.monthlyPlatesGoal) * 100 : 0;
  const outreachTarget = goals.monthlyOutreachGoal || 50;
  const leadPct = outreachTarget > 0 ? (stats.companiesApproached / outreachTarget) * 100 : 0;
  const convPct = goals.conversionRateGoal > 0 ? (stats.conversionRate / goals.conversionRateGoal) * 100 : 0;

  // Days in month calculation
  const today = new Date();
  const daysInMonth = 30; // standard month reference
  const currentDay = Math.min(today.getDate(), 30);
  const daysRemaining = Math.max(1, daysInMonth - currentDay);

  const remainingRevenue = Math.max(0, goals.monthlyRevenueGoal - stats.totalRevenue);
  const requiredRevenuePerDay = remainingRevenue / daysRemaining;
  const remainingPlates = Math.max(0, goals.monthlyPlatesGoal - stats.platesSold);
  const requiredPlatesPerDay = Math.ceil(remainingPlates / daysRemaining);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals({
      monthlyRevenueGoal: Number(revenueGoal) || 0,
      monthlyPlatesGoal: Number(platesGoal) || 0,
      monthlyOutreachGoal: Number(outreachGoal) || 0,
      conversionRateGoal: Number(conversionGoal) || 0,
      selectedMonth
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    // Fire celebration confetti if any goal is already completed!
    if (revPct >= 100 || platePct >= 100) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      colors: ['#0066FE', '#00D2FF', '#FFFFFF', '#38BDF8'],
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Metas de Vendas & Desempenho Comercial
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Planejamento de faturamento, quantidade de placas NFC vendidas e ritmo de prospecção.
          </p>
        </div>

        <button
          id="btn-celebrate-goals"
          onClick={triggerCelebration}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0066FE]/20 hover:bg-[#0066FE]/30 border border-[#0066FE]/50 text-blue-300 transition-all self-start sm:self-auto"
        >
          <PartyPopper className="w-4 h-4 text-[#00D2FF]" />
          <span>Comemorar Conquistas</span>
        </button>
      </div>

      {/* 4 Goals Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Goal 1: Revenue */}
        <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Meta de Faturamento</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              revPct >= 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
            }`}>
              {revPct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta: <span className="font-semibold text-slate-200">{formatCurrency(goals.monthlyRevenueGoal)}</span>
          </p>
          <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0052FF] to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, revPct)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Faltam:</span>
            <span className="font-semibold text-emerald-400">{formatCurrency(remainingRevenue)}</span>
          </div>
        </div>

        {/* Goal 2: Plates */}
        <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Meta de Placas NFC</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              platePct >= 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              {platePct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {stats.platesSold} <span className="text-sm font-normal text-slate-400">placas</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta: <span className="font-semibold text-slate-200">{goals.monthlyPlatesGoal} unidades</span>
          </p>
          <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-[#00D2FF] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, platePct)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Faltam:</span>
            <span className="font-semibold text-blue-300">{remainingPlates} placas</span>
          </div>
        </div>

        {/* Goal 3: Leads */}
        <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Empresas Abordadas</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              leadPct >= 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {leadPct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {stats.companiesApproached} <span className="text-sm font-normal text-slate-400">visitas</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta: <span className="font-semibold text-slate-200">{goals.monthlyLeadsGoal} abordagens</span>
          </p>
          <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, leadPct)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Faltam:</span>
            <span className="font-semibold text-purple-300">
              {Math.max(0, goals.monthlyLeadsGoal - stats.companiesApproached)} abordagens
            </span>
          </div>
        </div>

        {/* Goal 4: Conversion Rate */}
        <div className="p-5 rounded-2xl bg-[#0A162B] border border-slate-800 hover:border-[#0066FE]/40 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-slate-400">Taxa de Conversão</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
              Alvo: {goals.conversionRateGoal}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {formatPercent(stats.conversionRate)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {stats.companiesConverted} fechamentos de {stats.companiesApproached} abordadas
          </p>
          <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, convPct)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Status:</span>
            <span className={`font-semibold ${stats.conversionRate >= goals.conversionRateGoal ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.conversionRate >= goals.conversionRateGoal ? 'Dentro da Meta' : 'Abaixo do Alvo'}
            </span>
          </div>
        </div>
      </div>

      {/* Ritmo Diário & Calculadora de Execução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ritmo Comercial Diário */}
        <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Calendar className="w-5 h-5 text-[#0066FE]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Ritmo Necessário para Bater a Meta
            </h2>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Com base em <strong className="text-white">{daysRemaining} dias restantes</strong> no mês de {goals.selectedMonth}, este é o esforço diário calculado:
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#060D1A] border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Faturamento Diário</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">
                {formatCurrency(requiredRevenuePerDay)} / dia
              </span>
              <span className="text-[10px] text-slate-400">para atingir {formatCurrency(goals.monthlyRevenueGoal)}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#060D1A] border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Venda Diária de Placas</span>
              <span className="text-lg font-black text-blue-400 mt-1 block">
                {requiredPlatesPerDay} placa(s) / dia
              </span>
              <span className="text-[10px] text-slate-400">para atingir {goals.monthlyPlatesGoal} placas</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            💡 <strong>Dica Comercial GARCIA:</strong> Uma abordagem presencial com o celular encostado na placa de teste tem até 60% mais conversão do que mensagens frias!
          </div>
        </div>

        {/* Simulador de Vendas & Lucro */}
        <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Calculator className="w-5 h-5 text-[#00D2FF]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Simulador de Vendas Futuras
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Qtd Placas
              </label>
              <input
                type="number"
                min="1"
                value={simulatedPlates}
                onChange={(e) => setSimulatedPlates(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-[#060D1A] border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Preço Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={simulatedPrice}
                onChange={(e) => setSimulatedPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-[#060D1A] border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Custo Chip+Placa
              </label>
              <input
                type="number"
                step="0.01"
                value={simulatedUnitCost}
                onChange={(e) => setSimulatedUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-[#060D1A] border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#060D1A] border border-[#0066FE]/40 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Receita Estimada:</span>
              <span className="font-bold text-white">{formatCurrency(simulatedPlates * simulatedPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Custo Total de Produção:</span>
              <span className="font-bold text-rose-400">{formatCurrency(simulatedPlates * simulatedUnitCost)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-sm font-bold">
              <span className="text-slate-200">Lucro Bruto Previsto:</span>
              <span className="text-emerald-400">
                {formatCurrency((simulatedPlates * simulatedPrice) - (simulatedPlates * simulatedUnitCost))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor de Metas Form */}
      <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Configurar / Ajustar Metas Mensais
            </h3>
          </div>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Metas salvas com sucesso!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveGoals} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mês de Referência
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Meta de Faturamento (R$)
            </label>
            <input
              type="number"
              step="100"
              value={revenueGoal}
              onChange={(e) => setRevenueGoal(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Meta de Placas Vendidas (un)
            </label>
            <input
              type="number"
              min="1"
              value={platesGoal}
              onChange={(e) => setPlatesGoal(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Empresas Abordadas no Mês
            </label>
            <input
              type="number"
              min="1"
              value={outreachGoal}
              onChange={(e) => setOutreachGoal(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <button
              id="save-goals-btn"
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Metas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
