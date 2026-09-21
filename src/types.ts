export type SegmentType = 
  | 'Restaurante / Bar'
  | 'Clínica / Saúde'
  | 'Barbearia / Salão'
  | 'Automotivo / Oficina'
  | 'Varejo / Loja'
  | 'Hotel / Pousada'
  | 'Academia / Fitness'
  | 'Serviços Profissionais'
  | 'Outros';

export type PaymentMethod = 
  | 'PIX'
  | 'Cartão de Crédito'
  | 'Cartão de Débito'
  | 'Dinheiro'
  | 'Boleto';

export type PaymentStatus = 'pago' | 'pendente' | 'parcelado';

export type NfcPlateModel = 
  | 'Placa Acrílico Balcão Google NFC + QR'
  | 'Placa Minimalista Slim Google NFC'
  | 'Mini Totem de Mesa Google NFC'
  | 'Cartão de Bolso Google NFC'
  | 'Kit 2 Placas Google NFC';

export type NfcProductionStatus = 
  | 'aguardando_gravacao'
  | 'gravado_testado'
  | 'entregue_instalado';

export interface DailyOutreach {
  id: string;
  date: string; // YYYY-MM-DD
  count: number; // Quantas empresas abordadas no dia
  notes?: string; // Bairro, rua, detalhes do dia
  createdAt: string;
}

export interface Sale {
  id: string;
  companyName: string;
  segment: SegmentType;
  contactName: string;
  phone: string;
  plateModel: NfcPlateModel;
  quantity: number;
  unitPrice: number; // Padrão R$ 80,00
  discount?: number; // Desconto em R$ (opcional)
  unitCost: number; // Custo de fabricação: R$ 12,80 por plaquinha
  totalRevenue: number; // (quantity * unitPrice) - (discount || 0)
  totalCost: number; // quantity * unitCost (12.80)
  grossProfit: number; // totalRevenue - totalCost
  profitMarginPercent: number; // (grossProfit / totalRevenue) * 100
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  installments?: number;
  saleDate: string; // YYYY-MM-DD
  createdAt?: string;
  nfcStatus: NfcProductionStatus;
  googleReviewUrl: string;
  notes?: string;
}

export type ExpenseCategory = 
  | 'Matéria-Prima (Chips NFC / Acrílicos)'
  | 'Transporte / Combustível'
  | 'Embalagens & Etiquetas'
  | 'Marketing & Prospecção'
  | 'Ferramentas & Softwares'
  | 'Outras Despesas';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  status: 'pago' | 'pendente';
  notes?: string;
}

export interface SalesGoals {
  monthlyRevenueGoal: number;
  monthlyPlatesGoal: number;
  monthlyOutreachGoal: number; // Meta de abordagens diárias acumuladas
  conversionRateGoal: number; // percentual, ex: 35
  selectedMonth: string; // YYYY-MM
}

export interface SystemStats {
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  platesSold: number;
  companiesApproached: number; // Total de abordagens acumuladas
  todayApproached: number; // Abordagens registradas hoje
  companiesConverted: number; // Total de vendas realizadas
  conversionRate: number;
  averageTicket: number;
  averagePlatePrice: number;
  pendingReceivables: number;
  platesPendingNfc: number;
}

export type TabType = 
  | 'dashboard'
  | 'sales'
  | 'finances'
  | 'goals'
  | 'reports'
  | 'nfc_tools';
