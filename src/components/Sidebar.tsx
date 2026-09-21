import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';
import { GarciaLogo } from './GarciaLogo';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Target, 
  BarChart3, 
  Wrench, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  X,
  ChevronRight,
  TrendingUp,
  SmartphoneNfc,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SidebarProps {
  onOpenNewSale: () => void;
  onOpenDailyOutreach: () => void;
  onOpenNewExpense: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavGroup {
  title: string;
  items: {
    id: TabType;
    label: string;
    description: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewSale,
  onOpenDailyOutreach,
  onOpenNewExpense,
  mobileOpen,
  onCloseMobile
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    stats, 
    resetToDefaultData, 
    loadDemoData,
    exportDataJson, 
    importDataJson 
  } = useApp();

  const [showDataMenu, setShowDataMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navGroups: NavGroup[] = [
    {
      title: 'Operação & Vendas',
      items: [
        { 
          id: 'dashboard', 
          label: 'Visão Geral', 
          description: 'Métricas, faturamento e resumo',
          icon: LayoutDashboard 
        },
        { 
          id: 'sales', 
          label: 'Vendas de Placas NFC', 
          description: 'Pedidos a R$ 80, descontos e chips',
          icon: ShoppingBag, 
          badge: stats.platesSold,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }
      ]
    },
    {
      title: 'Financeiro & Resultados',
      items: [
        { 
          id: 'finances', 
          label: 'Financeiro & Custos', 
          description: 'DRE, custo R$ 12,80 e margens',
          icon: DollarSign 
        },
        { 
          id: 'goals', 
          label: 'Metas & Progresso', 
          description: 'Metas de faturamento e ritmo diário',
          icon: Target 
        },
        { 
          id: 'reports', 
          label: 'Relatórios Executivos', 
          description: 'Rentabilidade, gráficos e análises',
          icon: BarChart3 
        }
      ]
    },
    {
      title: 'Engenharia & Produção',
      items: [
        { 
          id: 'nfc_tools', 
          label: 'Ferramentas NFC', 
          description: 'Gerador instantâneo Google 5★',
          icon: Wrench 
        }
      ]
    }
  ];

  const handleExport = () => {
    const data = exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garcia-gestao-nfc-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setShowDataMenu(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (importDataJson(content)) {
            setShowDataMenu(false);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    setShowDataMenu(false);
    setShowResetConfirm(true);
  };

  const handleLoadDemo = () => {
    loadDemoData();
    setShowDataMenu(false);
  };

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Left Sidebar */}
      <aside 
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#060D1A] border-r border-[#0066FE]/30 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-[4px_0_24px_rgba(0,0,0,0.5)]`}
      >
        {/* Brand & Logo Header */}
        <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-[#08152E] to-[#060D1A] flex items-center justify-between">
          <button 
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center text-left group focus:outline-none"
          >
            <GarciaLogo size="sm" showSubtitle={true} />
          </button>

          {/* Close button on mobile */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Operational Actions */}
        <div className="p-3.5 border-b border-slate-800/80 bg-[#081224] space-y-2">
          <button
            id="sidebar-btn-new-sale"
            onClick={() => { onOpenNewSale(); onCloseMobile(); }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0052FF] via-[#0066FE] to-[#0080FF] hover:brightness-110 shadow-[0_4px_16px_rgba(0,102,254,0.35)] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-white/20">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Nova Venda NFC (R$ 80)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="sidebar-btn-daily-outreach"
              onClick={() => { onOpenDailyOutreach(); onCloseMobile(); }}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-blue-300 bg-[#0C1B33] border border-[#0066FE]/30 hover:bg-[#0066FE]/20 hover:text-white transition-all cursor-pointer"
            >
              <Users className="w-3 h-3 text-blue-400" />
              <span>+ Abordagens</span>
            </button>

            <button
              id="sidebar-btn-new-expense"
              onClick={() => { onOpenNewExpense(); onCloseMobile(); }}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-rose-300 bg-[#1F101A] border border-rose-500/30 hover:bg-rose-500/20 hover:text-white transition-all cursor-pointer"
            >
              <DollarSign className="w-3 h-3 text-rose-400" />
              <span>+ Despesa</span>
            </button>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>{group.title}</span>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-[#0066FE] text-white shadow-[0_0_16px_rgba(0,102,254,0.45)]'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-[#0B162B] text-blue-400 group-hover:text-white group-hover:bg-slate-800 border border-slate-800'
                        }`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate leading-tight">
                            {item.label}
                          </div>
                          <div className={`text-[10px] truncate ${
                            isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-300'
                          }`}>
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`shrink-0 ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive 
                            ? 'bg-white/25 text-white border-white/40' 
                            : (item.badgeColor || 'bg-slate-800 text-blue-300 border-blue-500/30')
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Mini Operational Card: NFC Pending Plates */}
          <div className="pt-2">
            <div className="rounded-2xl p-3 bg-gradient-to-br from-[#0B1936] to-[#081224] border border-[#0066FE]/30 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
                  <SmartphoneNfc className="w-3.5 h-3.5 text-[#0066FE]" />
                  <span>Fila de Produção NFC</span>
                </div>
                {stats.platesPendingNfc > 0 ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {stats.platesPendingNfc} pendente{stats.platesPendingNfc > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    100% gravadas
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/80">
                <div>
                  <div className="text-slate-400">Faturamento</div>
                  <div className="font-bold text-emerald-400 text-[11px] truncate">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Lucro Líquido</div>
                  <div className="font-bold text-blue-400 text-[11px] truncate">
                    {formatCurrency(stats.netProfit)}
                  </div>
                </div>
              </div>

              {stats.platesPendingNfc > 0 && (
                <button
                  onClick={() => handleSelectTab('sales')}
                  className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Gravar chips no celular</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer & Backup Tools in Sidebar */}
        <div className="p-3 border-t border-slate-800/80 bg-[#050A14] space-y-2">
          <div className="relative">
            <button
              id="sidebar-btn-backup-tools"
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Backup & Dados</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDataMenu ? 'rotate-90' : ''}`} />
            </button>

            {showDataMenu && (
              <div 
                id="sidebar-data-dropdown"
                className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-[#0B1528] border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
              >
                <div className="px-3 py-1.5 border-b border-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Gerenciamento Local
                </div>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Exportar Backup (JSON)</span>
                </button>
                <button
                  onClick={handleImport}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800/60 transition-colors text-left"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Restaurar Backup</span>
                </button>
                <div className="my-1 border-t border-slate-800/80" />
                <button
                  onClick={handleLoadDemo}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-blue-300 hover:bg-blue-500/10 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Carregar Exemplo Demo</span>
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Zerar Tudo (Resetar Página)</span>
                </button>
              </div>
            )}
          </div>

          <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span className="font-semibold text-slate-300">GARCIA® NFC Studio</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">v2.5</span>
          </div>
        </div>
      </aside>

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
    </>
  );
};
