import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
import {
  db,
  SALES_COLLECTION,
  EXPENSES_COLLECTION,
  OUTREACH_COLLECTION,
  SETTINGS_COLLECTION,
  GOALS_DOC,
  syncSaleToFirebase,
  deleteSaleFromFirebase,
  syncExpenseToFirebase,
  deleteExpenseFromFirebase,
  syncOutreachToFirebase,
  deleteOutreachFromFirebase,
  syncGoalsToFirebase
} from '../lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  dailyOutreach: DailyOutreach[];
  sales: Sale[];
  expenses: Expense[];
  goals: SalesGoals;
  stats: SystemStats;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCloudConnected: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
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
  // Pure in-memory state driven entirely by real-time Firestore cloud database
  const [dailyOutreach, setDailyOutreach] = useState<DailyOutreach[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SalesGoals>(INITIAL_GOALS);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  // One-time automatic migration: if this browser had any prior sales/expenses trapped in local cache,
  // push them to Firestore so all devices can see them immediately, then wipe local cache permanently.
  useEffect(() => {
    try {
      const localSales = localStorage.getItem(STORAGE_KEYS.SALES);
      if (localSales) {
        const parsed: Sale[] = JSON.parse(localSales);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(s => syncSaleToFirebase(s).catch(console.error));
        }
      }

      const localExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (localExpenses) {
        const parsed: Expense[] = JSON.parse(localExpenses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(e => syncExpenseToFirebase(e).catch(console.error));
        }
      }

      const localOutreach = localStorage.getItem(STORAGE_KEYS.DAILY_OUTREACH);
      if (localOutreach) {
        const parsed: DailyOutreach[] = JSON.parse(localOutreach);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(o => syncOutreachToFirebase(o).catch(console.error));
        }
      }

      // Purge all browser cache keys so data is NEVER stored per-browser
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.DAILY_OUTREACH);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem('garcia_nfc_daily_outreach_v2');
      localStorage.removeItem('garcia_nfc_sales_v2');
      localStorage.removeItem('garcia_nfc_expenses_v2');
      localStorage.removeItem('garcia_nfc_goals_v2');
      localStorage.removeItem('garcia_nfc_daily_outreach');
      localStorage.removeItem('garcia_nfc_sales');
      localStorage.removeItem('garcia_nfc_expenses');
      localStorage.removeItem('garcia_nfc_goals');
    } catch (e) {
      console.warn('LocalStorage migration notice:', e);
    }
  }, []);

  // Real-time Firestore Synchronizer (Shared central database for all phones and desktops)
  useEffect(() => {
    let unsubs: Array<() => void> = [];

    try {
      // 1. Listen to Sales
      const salesCol = collection(db, SALES_COLLECTION);
      const unsubSales = onSnapshot(salesCol, (snapshot) => {
        setIsCloudConnected(true);
        setSyncStatus('synced');
        const cloudSales: Sale[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Sale;
          cloudSales.push({ ...data, id: docSnap.id });
        });
        cloudSales.sort((a, b) => new Date(b.createdAt || b.saleDate).getTime() - new Date(a.createdAt || a.saleDate).getTime());
        setSales(cloudSales);
      }, (error) => {
        console.warn('Firestore Sales listener status:', error);
        setSyncStatus('offline');
      });
      unsubs.push(unsubSales);

      // 2. Listen to Expenses
      const expensesCol = collection(db, EXPENSES_COLLECTION);
      const unsubExpenses = onSnapshot(expensesCol, (snapshot) => {
        const cloudExpenses: Expense[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Expense;
          cloudExpenses.push({ ...data, id: docSnap.id });
        });
        cloudExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(cloudExpenses);
      }, (error) => {
        console.warn('Firestore Expenses listener status:', error);
      });
      unsubs.push(unsubExpenses);

      // 3. Listen to Daily Outreach
      const outreachCol = collection(db, OUTREACH_COLLECTION);
      const unsubOutreach = onSnapshot(outreachCol, (snapshot) => {
        const cloudOutreach: DailyOutreach[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as DailyOutreach;
          cloudOutreach.push({ ...data, id: docSnap.id });
        });
        cloudOutreach.sort((a, b) => b.date.localeCompare(a.date));
        setDailyOutreach(cloudOutreach);
      }, (error) => {
        console.warn('Firestore Outreach listener status:', error);
      });
      unsubs.push(unsubOutreach);

      // 4. Listen to Goals
      const goalsDocRef = doc(db, SETTINGS_COLLECTION, GOALS_DOC);
      const unsubGoals = onSnapshot(goalsDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SalesGoals;
          setGoals(prev => ({ ...prev, ...data }));
        }
      }, (error) => {
        console.warn('Firestore Goals listener status:', error);
      });
      unsubs.push(unsubGoals);

    } catch (err) {
      console.error('Failed to initialize Firestore real-time listeners:', err);
      setSyncStatus('offline');
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

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
    const existing = dailyOutreach.find(d => d.date === date);
    const entryId = existing?.id || `outreach-${Date.now()}`;
    const entry: DailyOutreach = {
      id: entryId,
      date,
      count: Math.max(0, count),
      notes: notes !== undefined ? notes : (existing?.notes || ''),
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    setDailyOutreach(prev => {
      const existingIndex = prev.findIndex(d => d.date === date);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = entry;
        return updated.sort((a, b) => b.date.localeCompare(a.date));
      } else {
        return [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });

    syncOutreachToFirebase(entry).catch(err => console.error('Error saving outreach to cloud:', err));
  };

  const quickIncrementToday = (amount: number = 1) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = dailyOutreach.find(d => d.date === todayStr);
    const updatedCount = existing ? Math.max(0, existing.count + amount) : Math.max(0, amount);
    const entry: DailyOutreach = {
      id: existing?.id || `outreach-${Date.now()}`,
      date: todayStr,
      count: updatedCount,
      notes: existing?.notes || 'Registrado via botão rápido',
      createdAt: existing?.createdAt || new Date().toISOString()
    };

    setDailyOutreach(prev => {
      if (existing) {
        return prev.map(d => d.date === todayStr ? entry : d);
      } else {
        return [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      }
    });

    syncOutreachToFirebase(entry).catch(err => console.error('Error saving outreach to cloud:', err));
  };

  const deleteDailyOutreach = (id: string) => {
    setDailyOutreach(prev => prev.filter(d => d.id !== id));
    deleteOutreachFromFirebase(id).catch(err => console.error('Error deleting outreach from cloud:', err));
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
    syncSaleToFirebase(newSale).catch(err => console.error('Error saving sale to cloud:', err));
  };

  const updateSale = (id: string, updated: Partial<Sale>) => {
    let updatedSaleObj: Sale | null = null;
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

      updatedSaleObj = {
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
      return updatedSaleObj;
    }));

    if (updatedSaleObj) {
      syncSaleToFirebase(updatedSaleObj).catch(err => console.error('Error updating sale in cloud:', err));
    }
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
    deleteSaleFromFirebase(id).catch(err => console.error('Error deleting sale in cloud:', err));
  };

  // Expense CRUD
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExpense, ...prev]);
    syncExpenseToFirebase(newExpense).catch(err => console.error('Error saving expense to cloud:', err));
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    let updatedExpenseObj: Expense | null = null;
    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        updatedExpenseObj = { ...e, ...updated };
        return updatedExpenseObj;
      }
      return e;
    }));

    if (updatedExpenseObj) {
      syncExpenseToFirebase(updatedExpenseObj).catch(err => console.error('Error updating expense in cloud:', err));
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    deleteExpenseFromFirebase(id).catch(err => console.error('Error deleting expense in cloud:', err));
  };

  // Goals
  const updateGoals = (newGoals: Partial<SalesGoals>) => {
    const mergedGoals = { ...goals, ...newGoals };
    setGoals(mergedGoals);
    syncGoalsToFirebase(mergedGoals).catch(err => console.error('Error saving goals to cloud:', err));
  };

  // Backup & Reset
  const resetToDefaultData = () => {
    sales.forEach(s => deleteSaleFromFirebase(s.id).catch(console.error));
    expenses.forEach(e => deleteExpenseFromFirebase(e.id).catch(console.error));
    dailyOutreach.forEach(o => deleteOutreachFromFirebase(o.id).catch(console.error));
    syncGoalsToFirebase(INITIAL_GOALS).catch(console.error);

    setDailyOutreach([]);
    setSales([]);
    setExpenses([]);
    setGoals(INITIAL_GOALS);
    try {
      localStorage.removeItem(STORAGE_KEYS.DAILY_OUTREACH);
      localStorage.removeItem(STORAGE_KEYS.SALES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.GOALS);
    } catch {}
  };

  const loadDemoData = () => {
    setDailyOutreach(DEMO_DAILY_OUTREACH);
    setSales(DEMO_SALES);
    setExpenses(DEMO_EXPENSES);
    setGoals(INITIAL_GOALS);
    // Sync demo data to cloud as well
    DEMO_SALES.forEach(s => syncSaleToFirebase(s).catch(console.error));
    DEMO_EXPENSES.forEach(e => syncExpenseToFirebase(e).catch(console.error));
    DEMO_DAILY_OUTREACH.forEach(o => syncOutreachToFirebase(o).catch(console.error));
    syncGoalsToFirebase(INITIAL_GOALS).catch(console.error);
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
      if (parsed.sales && Array.isArray(parsed.sales)) {
        setSales(parsed.sales);
        parsed.sales.forEach((s: Sale) => syncSaleToFirebase(s).catch(console.error));
      }
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        setExpenses(parsed.expenses);
        parsed.expenses.forEach((e: Expense) => syncExpenseToFirebase(e).catch(console.error));
      }
      if (parsed.dailyOutreach && Array.isArray(parsed.dailyOutreach)) {
        setDailyOutreach(parsed.dailyOutreach);
        parsed.dailyOutreach.forEach((o: DailyOutreach) => syncOutreachToFirebase(o).catch(console.error));
      }
      if (parsed.goals && typeof parsed.goals === 'object') {
        setGoals(parsed.goals);
        syncGoalsToFirebase(parsed.goals).catch(console.error);
      }
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
        isCloudConnected,
        syncStatus,
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
