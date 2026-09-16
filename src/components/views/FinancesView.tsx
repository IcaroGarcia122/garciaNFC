import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Plus, 
  Tag, 
  Calendar, 
  Edit, 
  Trash2, 
  PieChart, 
  Wallet,
  ShieldCheck,
  SmartphoneNfc
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

interface FinancesViewProps {
  onOpenNewExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  onOpenNewExpense,
  onEditExpense
}) => {
  const { expenses, sales, stats, deleteExpense, updateExpense } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredExpenses = expenses.filter(e => 
    categoryFilter === 'all' || e.category === categoryFilter
  );

  // Group expenses by category
  const expenseByCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = (exp: Expense) => {
    if (confirm(`Deseja excluir a despesa "${exp.description}"?`)) {
      deleteExpense(exp.id);
    }
  };

  const grossProfit = stats.totalRevenue - stats.totalCost;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gestão Financeira & Demonstrativo de Lucro
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Fluxo de caixa completo: faturamento bruto de placas, custos diretos de chips e acrílicos, e despesas operacionais.
          </p>
        </div>

        <button
          id="btn-add-expense-page"
          onClick={onOpenNewExpense}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Nova Despesa</span>
        </button>
      </div>

      {/* DRE - Demonstrativo de Resultado */}
      <div 
        id="financial-statement-card"
        className="p-6 rounded-3xl bg-[#0A162B] border border-[#0066FE]/30 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-[#0066FE]" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Demonstrativo Financeiro Consolidado (DRE)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">Valores acumulados em tempo real</span>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          {/* Receita Bruta */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                (+)
              </div>
              <div>
                <span className="font-bold text-white block">Receita Bruta com Venda de Placas NFC</span>
                <span className="text-xs text-slate-400">{stats.platesSold} placas vendidas em {sales.length} pedidos</span>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-400">{formatCurrency(stats.totalRevenue)}</span>
          </div>

          {/* Custo Direto */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                (-)
              </div>
              <div>
                <span className="font-bold text-white block">Custo dos Produtos Vendidos (Chips NFC + Acrílicos)</span>
                <span className="text-xs text-slate-400">Custos diretos calculados a R$ 12,80 por placa vendida</span>
              </div>
            </div>
            <span className="text-lg font-bold text-rose-400">{formatCurrency(stats.totalCost)}</span>
          </div>

          {/* Lucro Bruto Subtotal */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-300 font-medium border-y border-slate-800/80">
            <span>(=) LUCRO BRUTO OPERACIONAL:</span>
            <span className="font-bold text-slate-200">{formatCurrency(grossProfit)}</span>
          </div>

          {/* Despesas Operacionais */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                (-)
              </div>
              <div>
                <span className="font-bold text-white block">Despesas Operacionais & Logística</span>
                <span className="text-xs text-slate-400">Combustível, embalagens, adesivos, softwares e ferramentas</span>
              </div>
            </div>
            <span className="text-lg font-bold text-amber-400">{formatCurrency(stats.totalExpenses)}</span>
          </div>

          {/* Lucro Líquido Final */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0C1E3F] via-[#0D2550] to-[#0A162B] border-2 border-[#0066FE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,102,254,0.25)]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D2FF]">
                (=) LUCRO LÍQUIDO REAL NO BOLSO
              </span>
              <div className="text-3xl font-black text-white mt-1">
                {formatCurrency(stats.netProfit)}
              </div>
            </div>
            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-3 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-xs text-slate-400 block">Margem Líquida</span>
                <span className="text-xl font-black text-emerald-400">
                  {formatPercent(stats.profitMargin)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">A Receber</span>
                <span className="text-xl font-bold text-amber-300">
                  {formatCurrency(stats.pendingReceivables)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Expenses Breakdown & Expenses Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Category Breakdown */}
        <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <PieChart className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Despesas por Categoria
            </h3>
          </div>

          <div className="space-y-3">
            {Object.keys(expenseByCategory).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma despesa lançada.</p>
            ) : (
              Object.entries(expenseByCategory).map(([category, amount]) => {
                const totalAmount = Number(amount) || 0;
                const percent = stats.totalExpenses > 0 ? (totalAmount / stats.totalExpenses) * 100 : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[170px]" title={category}>
                        {category}
                      </span>
                      <span className="font-bold text-rose-300">{formatCurrency(totalAmount)} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Expenses Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Lançamentos de Despesas
              </h3>
            </div>

            <select
              id="expense-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Matéria-Prima (Chips NFC / Acrílicos)">Matéria-Prima</option>
              <option value="Transporte / Combustível">Transporte / Combustível</option>
              <option value="Embalagens & Etiquetas">Embalagens & Etiquetas</option>
              <option value="Marketing & Prospecção">Marketing & Prospecção</option>
              <option value="Ferramentas & Softwares">Ferramentas & Softwares</option>
              <option value="Outras Despesas">Outras Despesas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 pb-2">
                  <th className="pb-3 font-semibold">Descrição</th>
                  <th className="pb-3 font-semibold">Categoria</th>
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Nenhuma despesa encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-white">
                        {exp.description}
                        {exp.notes && <span className="block text-[10px] text-slate-400 italic">{exp.notes}</span>}
                      </td>
                      <td className="py-3 text-slate-300 max-w-[150px] truncate" title={exp.category}>
                        {exp.category}
                      </td>
                      <td className="py-3 text-slate-400">{formatDate(exp.date)}</td>
                      <td className="py-3 font-bold text-rose-400">{formatCurrency(exp.amount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          exp.status === 'pago' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {exp.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
