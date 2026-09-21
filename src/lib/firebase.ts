import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Sale, Expense, DailyOutreach, SalesGoals } from '../types';

// Initialize Firebase app singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Connect to the specific database configured in firebase-applet-config.json
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Collection References
export const SALES_COLLECTION = 'sales';
export const EXPENSES_COLLECTION = 'expenses';
export const OUTREACH_COLLECTION = 'dailyOutreach';
export const SETTINGS_COLLECTION = 'settings';
export const GOALS_DOC = 'monthly_goals';

// Helper to strip undefined values so Firestore setDoc never fails
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanFirestoreData(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

// Helper functions for real-time Firebase synchronization
export const syncSaleToFirebase = async (sale: Sale) => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, sale.id);
    const cleaned = cleanFirestoreData({
      ...sale,
      updatedAt: new Date().toISOString()
    });
    await setDoc(saleRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar venda no Firebase:', error);
    throw error;
  }
};

export const deleteSaleFromFirebase = async (saleId: string) => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId);
    await deleteDoc(saleRef);
  } catch (error) {
    console.error('Erro ao deletar venda no Firebase:', error);
    throw error;
  }
};

export const syncExpenseToFirebase = async (expense: Expense) => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expense.id);
    const cleaned = cleanFirestoreData({
      ...expense,
      updatedAt: new Date().toISOString()
    });
    await setDoc(expenseRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar despesa no Firebase:', error);
    throw error;
  }
};

export const deleteExpenseFromFirebase = async (expenseId: string) => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Erro ao deletar despesa no Firebase:', error);
    throw error;
  }
};

export const syncOutreachToFirebase = async (outreach: DailyOutreach) => {
  try {
    const outreachRef = doc(db, OUTREACH_COLLECTION, outreach.id);
    const cleaned = cleanFirestoreData({
      ...outreach,
      updatedAt: new Date().toISOString()
    });
    await setDoc(outreachRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar abordagem no Firebase:', error);
    throw error;
  }
};

export const deleteOutreachFromFirebase = async (outreachId: string) => {
  try {
    const outreachRef = doc(db, OUTREACH_COLLECTION, outreachId);
    await deleteDoc(outreachRef);
  } catch (error) {
    console.error('Erro ao deletar abordagem no Firebase:', error);
    throw error;
  }
};

export const syncGoalsToFirebase = async (goals: SalesGoals) => {
  try {
    const goalsRef = doc(db, SETTINGS_COLLECTION, GOALS_DOC);
    const cleaned = cleanFirestoreData({
      ...goals,
      updatedAt: new Date().toISOString()
    });
    await setDoc(goalsRef, cleaned, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar metas no Firebase:', error);
    throw error;
  }
};
