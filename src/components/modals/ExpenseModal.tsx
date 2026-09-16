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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        id="expense-modal-card"
        className="w-full max-w-lg bg-[#0A162B] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#060D1A]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {initialData ? 'Editar Despesa' : 'Lançar Nova Despesa Operacional'}
              </h2>
              <p className="text-xs text-slate-400">
                Custos com Chips NFC, Acrílicos, Transporte e Operação
              </p>
            </div>
          </div>
          <button
            id="close-expense-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="cancel-expense-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="save-expense-btn"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Atualizar Despesa' : 'Salvar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
