import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  DailyOutreach, 
  Sale, 
  Expense, 
  SalesGoals, 
  SystemStats,
  TabType
} from '../types';
import { 
  INITIAL_DAILY_OUTREACH, 
  INITIAL_SALES, 
  INITIAL_EXPENSES, 
  INITIAL_GOALS, 
  DEMO_DAILY_OUTREACH,
  DEMO_SALES,
  DEMO_EXPENSES,
  STORAGE_KEYS 
} from '../data/initialData';

interface AppContextType {
  dailyOutreach: DailyOutreach[];
  sales: Sale[];
  expenses: Expense[];
  goals: SalesGoals;
  stats: SystemStats;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Daily Outreach actions
  logDailyOutreach: (date: string, count: number, notes?: string) => void;
  quickIncrementToday: (amount?: number) => void;
  deleteDailyOutreach: (id: string) => void;
  // Sale actions
  addSale: (sale: Omit<Sale, 'id' | 'grossProfit' | 'profitMarginPercent' | 'totalRevenue' | 'totalCost'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  // Goals
  updateGoals: (goals: Partial<SalesGoals>) => void;
  // Data management
  resetToDefaultData: () => void;
  loadDemoData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonData: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean up legacy keys once if present
  useEffect(() => {
    try {
      localStorage.removeItem('garcia_nfc_daily_outreach_v2');
      localStorage.removeItem('garcia_nfc_sales_v2');
      localStorage.removeItem('garcia_nfc_expenses_v2');
      localStorage.removeItem('garcia_nfc_goals_v2');
      localStorage.removeItem('garcia_nfc_daily_outreach');
      localStorage.removeItem('garcia_nfc_sales');
      localStorage.removeItem('garcia_nfc_expenses');
      localStorage.removeItem('garcia_nfc_goals');
    } catch {}
  }, []);
  // Initialize state with localStorage fallback
  const [dailyOutreach, setDailyOutreach] = useState<DailyOutreach[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY_OUTREACH);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_OUTREACH;
    } catch {
      return INITIAL_DAILY_OUTREACH;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [goals, setGoals] = useState<SalesGoals>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_OUTREACH, JSON.stringify(dailyOutreach));
    } catch (e) {
      console.error('Failed saving daily outreach to localStorage', e);
    }
  }, [dailyOutreach]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error('Failed saving sales to localStorage', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed saving expenses to localStorage', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed saving goals to localStorage', e);
    }
  }, [goals]);

  // Comprehensive System Statistics calculation
  const stats: SystemStats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + (s.totalRevenue || 0), 0);
    const totalCost = sales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalCost - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const platesSold = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    
    const companiesApproached = dailyOutreach.reduce((acc, d) => acc + (d.count || 0), 0);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = dailyOutreach.find(d => d.date === todayStr);
    const todayApproached = todayEntry ? todayEntry.count : 0;

    const companiesConverted = sales.length;
    const conversionRate = companiesApproached > 0 
      ? (companiesConverted / companiesApproached) * 100 
      : 0;
    
    const averageTicket = sales.length > 0 ? totalRevenue / sales.length : 0;
    const averagePlatePrice = platesSold > 0 ? totalRevenue / platesSold : 0;

    const pendingReceivables = sales
      .filter(s => s.paymentStatus !== 'pago')
      .reduce((acc, s) => acc + (s.totalRevenue || 0), 0);

    const platesPendingNfc = sales
      .filter(s => s.nfcStatus === 'aguardando_gravacao')
      .reduce((acc, s) => acc + (s.quantity || 0), 0);

    return {
      totalRevenue,
      totalCost,
      totalExpenses,
      netProfit,
      profitMargin,
      platesSold,
      companiesApproached,
      todayApproached,
      companiesConverted,
      conversionRate,
      averageTicket,
      averagePlatePrice,
      pendingReceivables,
      platesPendingNfc
    };
  }, [sales, expenses, dailyOutreach]);

  // Daily Outreach Actions
  const logDailyOutreach = (date: string, count: number, notes?: string) => {
    setDailyOutreach(prev => {
      const existingIndex = prev.findIndex(d => d.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          count: Math.max(0, count),
          notes: notes !== undefined ? notes : updated[existingIndex].notes
        };
        return updated.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        const newEntry: DailyOutreach = {
          id: `outreach-${Date.now()}`,
          date,
          count: Math.max(0, count),
          notes: notes || '',
          createdAt: new Date().toISOString()
        };
        return [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });
  };

  const quickIncrementToday = (amount: number = 1) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyOutreach(prev => {
      const existing = prev.find(d => d.date === todayStr);
      if (existing) {
        return prev.map(d => d.date === todayStr ? { ...d, count: Math.max(0, d.count + amount) } : d);
      } else {
        const newEntry: DailyOutreach = {
          id: `outreach-${Date.now()}`,
          date: todayStr,
          count: Math.max(0, amount),
          notes: 'Registrado via botão rápido',
          createdAt: new Date().toISOString()
        };
        return [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });
  };

  const deleteDailyOutreach = (id: string) => {
    setDailyOutreach(prev => prev.filter(d => d.id !== id));
  };

  // Sale CRUD
  const addSale = (saleData: Omit<Sale, 'id' | 'grossProfit' | 'profitMarginPercent' | 'totalRevenue' | 'totalCost'>) => {
    const qty = Number(saleData.quantity) || 1;
    const uPrice = Number(saleData.unitPrice) || 80.00;
    const disc = Number(saleData.discount) || 0;
    const uCost = Number(saleData.unitCost) || 12.80;

    const totalRevenue = Math.max(0, (qty * uPrice) - disc);
    const totalCost = qty * uCost;
    const grossProfit = totalRevenue - totalCost;
    const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const newSale: Sale = {
      ...saleData,
      quantity: qty,
      unitPrice: uPrice,
      discount: disc,
      unitCost: uCost,
      id: `sale-${Date.now()}`,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMarginPercent
    };
    setSales(prev => [newSale, ...prev]);
  };

  const updateSale = (id: string, updated: Partial<Sale>) => {
    setSales(prev => prev.map(s => {
      if (s.id !== id) return s;
      const merged = { ...s, ...updated };
      const qty = Number(merged.quantity) || 1;
      const uPrice = Number(merged.unitPrice) || 80.00;
      const disc = Number(merged.discount) || 0;
      const uCost = Number(merged.unitCost) || 12.80;

      const totalRevenue = Math.max(0, (qty * uPrice) - disc);
      const totalCost = qty * uCost;
      const grossProfit = totalRevenue - totalCost;
      const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return {
        ...merged,
        quantity: qty,
        unitPrice: uPrice,
        discount: disc,
        unitCost: uCost,
        totalRevenue,
        totalCost,
        grossProfit,
        profitMarginPercent
      };
    }));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // Expense CRUD
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Goals
  const updateGoals = (newGoals: Partial<SalesGoals>) => {
    setGoals(prev => ({ ...prev, ...newGoals }));
  };

  // Backup & Reset
  const resetToDefaultData = () => {
    setDailyOutreach([]);
    setSales([]);
    setExpenses([]);
    setGoals(INITIAL_GOALS);
    try {
      localStorage.removeItem(STORAGE_KEYS.DAILY_OUTREACH);
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem('garcia_nfc_daily_outreach_v2');
      localStorage.removeItem('garcia_nfc_sales_v2');
      localStorage.removeItem('garcia_nfc_expenses_v2');
      localStorage.removeItem('garcia_nfc_goals_v2');
    } catch {}
  };

  const loadDemoData = () => {
    setDailyOutreach(DEMO_DAILY_OUTREACH);
    setSales(DEMO_SALES);
    setExpenses(DEMO_EXPENSES);
    setGoals(INITIAL_GOALS);
  };

  const exportDataJson = () => {
    const data = {
      dailyOutreach,
      sales,
      expenses,
      goals,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.dailyOutreach && Array.isArray(parsed.dailyOutreach)) setDailyOutreach(parsed.dailyOutreach);
      if (parsed.sales && Array.isArray(parsed.sales)) setSales(parsed.sales);
      if (parsed.expenses && Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (parsed.goals && typeof parsed.goals === 'object') setGoals(parsed.goals);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        dailyOutreach,
        sales,
        expenses,
        goals,
        stats,
        activeTab,
        setActiveTab,
        logDailyOutreach,
        quickIncrementToday,
        deleteDailyOutreach,
        addSale,
        updateSale,
        deleteSale,
        addExpense,
        updateExpense,
        deleteExpense,
        updateGoals,
        resetToDefaultData,
        loadDemoData,
        exportDataJson,
        importDataJson
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
