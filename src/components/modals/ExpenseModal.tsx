import React, { useState } from 'react';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { X, Receipt, DollarSign, Tag, CheckCircle2 } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id'>) => void;
  initialData?: Expense | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Matéria-Prima (Chips NFC / Acrílicos)',
  'Transporte / Combustível',
  'Embalagens & Etiquetas',
  'Marketing & Prospecção',
  'Ferramentas & Softwares',
  'Outras Despesas'
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Boleto'
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<ExpenseCategory>(
    initialData?.category || 'Matéria-Prima (Chips NFC / Acrílicos)'
  );
  const [amount, setAmount] = useState<number>(initialData?.amount || 0);
  const [date, setDate] = useState<string>(
    initialData?.date || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'PIX');
  const [status, setStatus] = useState<'pago' | 'pendente'>(initialData?.status || 'pago');
  const [notes, setNotes] = useState(initialData?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    onSave({
      description: description.trim(),
      category,
      amount: Number(amount) || 0,
      date,
      paymentMethod,
      status,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto overscroll-none animate-in fade-in duration-200">
      <div 
        id="expense-modal-card"
        className="w-full max-w-lg bg-[#0A162B] border border-rose-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[90vh] text-slate-100"
      >
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#060D1A]/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                {initialData ? 'Editar Despesa' : 'Lançar Nova Despesa Operacional'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Custos com Chips NFC, Acrílicos, Transporte e Operação
              </p>
            </div>
          </div>
          <button
            id="close-expense-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Descrição da Despesa *
            </label>
            <input
              id="expense-desc-input"
              type="text"
              required
              placeholder="Ex: Lote de 50 tags NFC, Combustível, Embalagens..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                id="expense-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Valor (R$) *
              </label>
              <input
                id="expense-amount-input"
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="0,00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Data do Pagamento
              </label>
              <input
                id="expense-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                id="expense-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <select
                id="expense-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente / Agendado</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Observações (Opcional)
              </label>
              <input
                id="expense-notes-input"
                type="text"
                placeholder="Fornecedor, nota fiscal, observação..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

        </form>

        <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-[#060D1A]/95 backdrop-blur-md">
          <button
            id="cancel-expense-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Cancelar
          </button>
          <button
            id="save-expense-btn"
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{initialData ? 'Atualizar Despesa' : 'Salvar Despesa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
