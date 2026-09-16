import { DailyOutreach, Sale, Expense, SalesGoals } from '../types';

// Default empty data for a clean fresh slate
export const INITIAL_DAILY_OUTREACH: DailyOutreach[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_GOALS: SalesGoals = {
  monthlyRevenueGoal: 4800.00, // 60 placas x R$ 80
  monthlyPlatesGoal: 60,
  monthlyOutreachGoal: 50, // 50 empresas abordadas no mês
  conversionRateGoal: 30, // 30% de conversão
  selectedMonth: '2026-09'
};

export const STORAGE_KEYS = {
  DAILY_OUTREACH: 'garcia_nfc_daily_outreach_v3',
  SALES: 'garcia_nfc_sales_v3',
  EXPENSES: 'garcia_nfc_expenses_v3',
  GOALS: 'garcia_nfc_goals_v3'
};

// Optional Demo data if the user wants to load sample records
export const DEMO_DAILY_OUTREACH: DailyOutreach[] = [
  {
    id: 'outreach-1',
    date: '2026-09-14',
    count: 6,
    notes: 'Visitas presenciais a restaurantes e barbearias no Centro e Bairro Gonzaga',
    createdAt: '2026-09-14T17:30:00Z'
  },
  {
    id: 'outreach-2',
    date: '2026-09-13',
    count: 8,
    notes: 'Comércio de rua e clínicas na região dos Jardins e Av. Paulista',
    createdAt: '2026-09-13T18:00:00Z'
  },
  {
    id: 'outreach-3',
    date: '2026-09-12',
    count: 5,
    notes: 'Salões de beleza e estética em Santo André',
    createdAt: '2026-09-12T16:45:00Z'
  }
];

export const DEMO_SALES: Sale[] = [
  {
    id: 'sale-1',
    companyName: 'Restaurante & Grill Brasa Viva',
    segment: 'Restaurante / Bar',
    contactName: 'Carlos Mendonça',
    phone: '11987654321',
    plateModel: 'Placa Acrílico Balcão Google NFC + QR',
    quantity: 4,
    unitPrice: 80.00,
    discount: 20.00,
    unitCost: 12.80,
    totalRevenue: 300.00,
    totalCost: 51.20,
    grossProfit: 248.80,
    profitMarginPercent: 82.9,
    paymentMethod: 'PIX',
    paymentStatus: 'pago',
    saleDate: '2026-09-03',
    nfcStatus: 'entregue_instalado',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ0_BrasaViva123',
    notes: 'Configurado com chip NTAG215 e link direto de 5 estrelas do Google Maps.'
  },
  {
    id: 'sale-2',
    companyName: 'Barbearia Dom Garcia',
    segment: 'Barbearia / Salão',
    contactName: 'Matheus Garcia',
    phone: '11976543210',
    plateModel: 'Placa Minimalista Slim Google NFC',
    quantity: 2,
    unitPrice: 80.00,
    discount: 0,
    unitCost: 12.80,
    totalRevenue: 160.00,
    totalCost: 25.60,
    grossProfit: 134.40,
    profitMarginPercent: 84.0,
    paymentMethod: 'PIX',
    paymentStatus: 'pago',
    saleDate: '2026-09-05',
    nfcStatus: 'entregue_instalado',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJM_DomGarcia456',
    notes: 'Duas placas para bancadas de corte. Entregue e testado com celular Samsung e iPhone.'
  }
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    description: 'Lote de 100 Chips NFC NTAG215 regraváveis 504 bytes',
    category: 'Matéria-Prima (Chips NFC / Acrílicos)',
    amount: 195.00,
    date: '2026-09-01',
    paymentMethod: 'PIX',
    status: 'pago',
    notes: 'Fornecedor atacado. Custo unitário R$ 1,95 por chip.'
  },
  {
    id: 'exp-2',
    description: '50 Displays em Acrílico Cristal 2mm dobrado formato L (10x15cm)',
    category: 'Matéria-Prima (Chips NFC / Acrílicos)',
    amount: 340.00,
    date: '2026-09-02',
    paymentMethod: 'Boleto',
    status: 'pago',
    notes: 'Lote sob medida para balcão de atendimento.'
  }
];
