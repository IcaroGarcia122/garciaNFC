import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/views/DashboardView';
import { SalesView } from './components/views/SalesView';
import { FinancesView } from './components/views/FinancesView';
import { GoalsView } from './components/views/GoalsView';
import { ReportsView } from './components/views/ReportsView';
import { NfcToolsView } from './components/views/NfcToolsView';

import { SaleModal } from './components/modals/SaleModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { DailyOutreachModal } from './components/modals/DailyOutreachModal';

import { Sale, Expense } from './types';
import { GarciaIcon } from './components/GarciaLogo';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  // Modal States
  const [isDailyOutreachModalOpen, setIsDailyOutreachModalOpen] = useState(false);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>(undefined);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  // Mobile Sidebar Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Handlers
  const handleOpenDailyOutreach = () => {
    setIsDailyOutreachModalOpen(true);
  };

  const handleOpenNewSale = () => {
    setEditingSale(undefined);
    setIsSaleModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsSaleModalOpen(true);
  };

  const handleOpenNewExpense = () => {
    setEditingExpense(undefined);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex font-sans selection:bg-[#0066FE] selection:text-white">
      {/* Left Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenNewSale={handleOpenNewSale}
        onOpenDailyOutreach={handleOpenDailyOutreach}
        onOpenNewExpense={handleOpenNewExpense}
      />

      {/* Main Content Area (offset by left sidebar on desktop) */}
      <div className="flex-1 min-w-0 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header with breadcrumb, live indicators & quick actions */}
        <TopHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNewSale={handleOpenNewSale}
          onOpenDailyOutreach={handleOpenDailyOutreach}
          onOpenNewExpense={handleOpenNewExpense}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewSale={handleOpenNewSale}
              onOpenDailyOutreach={handleOpenDailyOutreach}
              onOpenNewExpense={handleOpenNewExpense}
            />
          )}

          {activeTab === 'sales' && (
            <SalesView
              onOpenNewSale={handleOpenNewSale}
              onEditSale={handleEditSale}
            />
          )}

          {activeTab === 'finances' && (
            <FinancesView
              onOpenNewExpense={handleOpenNewExpense}
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'nfc_tools' && (
            <NfcToolsView />
          )}
        </main>

        {/* Footer with Brand Identity */}
        <footer className="border-t border-slate-800/80 bg-[#050A14] py-6 px-4 sm:px-6 text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <GarciaIcon size={24} />
              <span className="font-semibold text-slate-300">
                GARCIA® Design Studio • Placas de Avaliação Google NFC
              </span>
            </div>
            <p className="text-slate-400 text-center sm:text-right text-[11px]">
              Sistema Especialista de Gestão Financeira, Vendas de Placas NFC & Faturamento Google Maps • Preço Base R$ 80,00 • Custo R$ 12,80
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <DailyOutreachModal
        isOpen={isDailyOutreachModalOpen}
        onClose={() => setIsDailyOutreachModalOpen(false)}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        saleToEdit={editingSale}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseToEdit={editingExpense}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
