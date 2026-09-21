import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { 
  Menu, 
  Plus, 
  Users, 
  DollarSign, 
  Sparkles, 
  Download, 
  Upload, 
  RotateCcw, 
  SmartphoneNfc,
  LayoutDashboard,
  ShoppingBag,
  Target,
  BarChart3,
  Wrench,
  Calendar,
  Cloud
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { GarciaIcon } from './GarciaLogo';

interface TopHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenNewSale: () => void;
  onOpenDailyOutreach: () => void;
  onOpenNewExpense: () => void;
}

const TAB_METADATA: Partial<Record<TabType, { title: string; subtitle: string; icon: React.ElementType }>> = {
  dashboard: {
    title: 'Visão Geral Executiva',
    subtitle: 'Métricas em tempo real, faturamento, abordagens e ritmo de vendas',
    icon: LayoutDashboard
  },
  sales: {
    title: 'Vendas de Placas NFC',
    subtitle: 'Preço base R$ 80,00, descontos comerciais, controle de custos e gravação NFC',
    icon: ShoppingBag
  },
  finances: {
    title: 'Gestão Financeira & DRE',
    subtitle: 'Demonstrativo de receitas, custo de produção R$ 12,80 e margem líquida real',
    icon: DollarSign
  },
  goals: {
    title: 'Metas Comerciais & Ritmo',
    subtitle: 'Acompanhamento de metas do mês e cálculo do ritmo diário necessário',
    icon: Target
  },
  reports: {
    title: 'Relatórios & Inteligência',
    subtitle: 'Rentabilidade por modelo, conversão de visitas e exportação de planilhas',
    icon: BarChart3
  },
  nfc_tools: {
    title: 'Ferramentas & Engenharia NFC',
    subtitle: 'Gerador instantâneo de Link Google 5★ via URL do Maps e scripts comerciais',
    icon: Wrench
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileSidebar,
  onOpenNewSale,
  onOpenDailyOutreach,
  onOpenNewExpense
}) => {
  const { activeTab, stats, isCloudConnected, exportDataJson, importDataJson, resetToDefaultData, loadDemoData } = useApp();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentTab = TAB_METADATA[activeTab] || TAB_METADATA.dashboard!;
  const TabIcon = currentTab.icon;

  const handleExport = () => {
    const data = exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garcia-gestao-nfc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setShowSettingsMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            importDataJson(content);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setShowSettingsMenu(false);
  };

  const handleReset = () => {
    setShowSettingsMenu(false);
    setShowResetConfirm(true);
  };

  const handleLoadDemo = () => {
    loadDemoData();
    setShowSettingsMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#060D1A]/95 backdrop-blur-md border-b border-[#0066FE]/20 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Active Section Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger button */}
          <button
            id="topheader-mobile-toggle"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-[#0B162B] border border-slate-800 hover:border-[#0066FE]/50 transition-colors shrink-0"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5 text-blue-400" />
          </button>

          {/* Logo on small screens where sidebar is hidden */}
          <div className="lg:hidden shrink-0">
            <GarciaIcon size={32} />
          </div>

          {/* Section Breadcrumb & Heading */}
          <div className="min-w-0">
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              <span className="text-[#0066FE] font-bold">GARCIA® NFC Studio</span>
              <span>/</span>
              <span className="text-slate-300 font-semibold">{currentTab.title}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                {currentTab.title}
              </h1>
              <div 
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isCloudConnected 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                }`}
                title={isCloudConnected ? "Banco de dados Firebase conectado: Celular e Computador sincronizados em tempo real" : "Conectando ao banco de dados na nuvem..."}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
                <Cloud className="w-3 h-3" />
                <span className="hidden sm:inline">{isCloudConnected ? 'Nuvem Conectada' : 'Sincronizando...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right: Live Metric Indicators */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B162B] border border-blue-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Faturamento:</span>
            <span className="font-bold text-emerald-400">{formatCurrency(stats.totalRevenue)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B162B] border border-blue-500/20 shadow-sm">
            <span className="text-slate-400">Lucro Líquido:</span>
            <span className="font-bold text-blue-400">{formatCurrency(stats.netProfit)}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B162B] border border-blue-500/20 shadow-sm">
            <span className="text-slate-400">Placas Vendidas:</span>
            <span className="font-bold text-slate-200">{stats.platesSold} un</span>
          </div>

          <div 
            onClick={onOpenDailyOutreach}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B162B] border border-amber-500/30 shadow-sm cursor-pointer hover:border-amber-500/60 transition-colors"
            title="Clique para registrar abordagens de empresas"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Abordadas hoje:</span>
            <span className="font-bold text-amber-300">{stats.todayApproached}</span>
          </div>

          {stats.platesPendingNfc > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <SmartphoneNfc className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{stats.platesPendingNfc} p/ gravar</span>
            </div>
          )}
        </div>

        {/* Right Side: Fast Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="topheader-btn-new-sale"
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0052FF] via-[#0066FE] to-[#0080FF] hover:brightness-110 shadow-[0_0_16px_rgba(0,102,254,0.4)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova Venda (R$ 80)</span>
            <span className="sm:hidden">Venda</span>
          </button>

          <button
            id="topheader-btn-daily-outreach"
            onClick={onOpenDailyOutreach}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 bg-[#0C1B33] border border-[#0066FE]/40 hover:bg-[#0066FE]/20 hover:text-white transition-all cursor-pointer"
            title="Registrar quantas empresas abordadas hoje"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>+ Abordagens ({stats.todayApproached} hoje)</span>
          </button>

          {/* Quick Settings Dropdown */}
          <div className="relative">
            <button
              id="topheader-btn-settings"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="Gerenciamento de Dados & Backup"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </button>

            {showSettingsMenu && (
              <div 
                id="topheader-settings-menu"
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0B1528] border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
              >
                <div className="px-3 py-1.5 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  GARCIA® Nuvem Central
                </div>
                <button
                  onClick={() => { onOpenDailyOutreach(); setShowSettingsMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Registrar Abordagens do Dia</span>
                </button>
                <button
                  onClick={() => { onOpenNewExpense(); setShowSettingsMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <DollarSign className="w-4 h-4 text-rose-400" />
                  <span>Lançar Despesa</span>
                </button>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Exportar Backup (JSON)</span>
                </button>
                <button
                  onClick={handleImport}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Restaurar Backup</span>
                </button>
                <div className="my-1 border-t border-slate-800/80" />
                <button
                  onClick={handleLoadDemo}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-blue-300 hover:bg-blue-500/10 transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Carregar Exemplo Demo</span>
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Zerar Tudo (Resetar Página)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal In-App de Confirmação para Zerar Dados */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0A162B] border border-rose-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Zerar Página e Todos os Dados?</h3>
                <p className="text-xs text-slate-400">Esta ação limpa o banco de dados e zera as métricas.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Todas as vendas, despesas e métricas de prospecção serão excluídas. Deseja continuar?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sim, Zerar Tudo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
