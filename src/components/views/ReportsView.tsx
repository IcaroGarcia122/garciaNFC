import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  PieChart, 
  Building2, 
  SmartphoneNfc, 
  CreditCard, 
  DollarSign, 
  FileSpreadsheet,
  TrendingUp,
  Layers
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { GarciaLogo } from '../GarciaLogo';

export const ReportsView: React.FC = () => {
  const { sales, expenses, stats } = useApp();

  // Segment Performance Analysis
  const segmentStats = React.useMemo(() => {
    const data: Record<string, { count: number; plates: number; revenue: number; profit: number }> = {};
    sales.forEach(sale => {
      if (!data[sale.segment]) {
        data[sale.segment] = { count: 0, plates: 0, revenue: 0, profit: 0 };
      }
      data[sale.segment].count += 1;
      data[sale.segment].plates += sale.quantity;
      data[sale.segment].revenue += sale.totalRevenue;
      data[sale.segment].profit += sale.grossProfit;
    });
    return Object.entries(data).map(([segment, item]) => ({
      segment,
      ...item,
      avgTicket: item.count > 0 ? item.revenue / item.count : 0,
      margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  // Plate Model Analysis
  const modelStats = React.useMemo(() => {
    const data: Record<string, { count: number; plates: number; revenue: number; cost: number; profit: number }> = {};
    sales.forEach(sale => {
      if (!data[sale.plateModel]) {
        data[sale.plateModel] = { count: 0, plates: 0, revenue: 0, cost: 0, profit: 0 };
      }
      data[sale.plateModel].count += 1;
      data[sale.plateModel].plates += sale.quantity;
      data[sale.plateModel].revenue += sale.totalRevenue;
      data[sale.plateModel].cost += sale.totalCost;
      data[sale.plateModel].profit += sale.grossProfit;
    });
    return Object.entries(data).map(([model, item]) => ({
      model,
      ...item,
      margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
    })).sort((a, b) => b.plates - a.plates);
  }, [sales]);

  // Payment Method Analysis
  const paymentStats = React.useMemo(() => {
    const data: Record<string, { count: number; revenue: number }> = {};
    sales.forEach(sale => {
      data[sale.paymentMethod] = data[sale.paymentMethod] || { count: 0, revenue: 0 };
      data[sale.paymentMethod].count += 1;
      data[sale.paymentMethod].revenue += sale.totalRevenue;
    });
    return Object.entries(data).map(([method, item]) => ({
      method,
      ...item,
      share: stats.totalRevenue > 0 ? (item.revenue / stats.totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [sales, stats.totalRevenue]);

  const handlePrint = () => {
    window.print();
  };

  const exportFullReportCsv = () => {
    const rows = [
      ['RELATORIO GERENCIAL GARCIA DESIGN - PLACAS NFC GOOGLE'],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [''],
      ['RESUMO FINANCEIRO'],
      ['Faturamento Bruto', stats.totalRevenue.toFixed(2)],
      ['Custo de Fabricacao das Placas', stats.totalCost.toFixed(2)],
      ['Despesas Operacionais', stats.totalExpenses.toFixed(2)],
      ['Lucro Liquido Real', stats.netProfit.toFixed(2)],
      ['Margem Operacional (%)', stats.profitMargin.toFixed(2)],
      ['Total de Placas Vendidas', stats.platesSold],
      ['Empresas Abordadas', stats.companiesApproached],
      ['Taxa de Conversao (%)', stats.conversionRate.toFixed(2)],
      [''],
      ['DESEMPENHO POR SEGMENTO'],
      ['Segmento', 'Pedidos', 'Placas Vendidas', 'Faturamento (R$)', 'Lucro Bruto (R$)', 'Margem (%)'],
      ...segmentStats.map(s => [
        `"${s.segment}"`,
        s.count,
        s.plates,
        s.revenue.toFixed(2),
        s.profit.toFixed(2),
        s.margin.toFixed(1)
      ]),
      [''],
      ['DESEMPENHO POR MODELO DE PLACA NFC'],
      ['Modelo', 'Placas Vendidas', 'Faturamento (R$)', 'Custo (R$)', 'Lucro (R$)', 'Margem (%)'],
      ...modelStats.map(m => [
        `"${m.model}"`,
        m.plates,
        m.revenue.toFixed(2),
        m.cost.toFixed(2),
        m.profit.toFixed(2),
        m.margin.toFixed(1)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-garcia-financeiro-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Relatórios Analíticos & Indicadores
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Análise aprofundada de vendas por nicho de negócio, modelos de placa e canais de pagamento.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#0A162B] border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Imprimir / PDF</span>
          </button>
          <button
            id="btn-export-full-report-csv"
            onClick={exportFullReportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Relatório Completo</span>
          </button>
        </div>
      </div>

      {/* Printable Brand Header (visible on print) */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h2 className="text-xl font-bold">GARCIA® Design Studio • Relatório de Gestão Financeira</h2>
        <p className="text-xs text-gray-600">Vendas de Placas NFC de Avaliação Google • Emitido em: {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      {/* Relatório 1: Segmentos */}
      <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4 print:border-gray-300 print:bg-white print:text-black">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 print:border-gray-200">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-white tracking-wide print:text-black">
            Desempenho por Segmento de Negócio
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2 print:text-gray-600 print:border-gray-300">
                <th className="pb-3 font-semibold">Segmento</th>
                <th className="pb-3 font-semibold text-center">Pedidos</th>
                <th className="pb-3 font-semibold text-center">Placas Vendidas</th>
                <th className="pb-3 font-semibold">Faturamento Total</th>
                <th className="pb-3 font-semibold">Lucro Bruto</th>
                <th className="pb-3 font-semibold text-right">Margem de Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {segmentStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">Sem dados suficientes.</td>
                </tr>
              ) : (
                segmentStats.map(s => (
                  <tr key={s.segment} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-white print:text-black">{s.segment}</td>
                    <td className="py-3 text-center text-slate-300 print:text-black">{s.count}</td>
                    <td className="py-3 text-center font-bold text-blue-300 print:text-blue-700">{s.plates} un</td>
                    <td className="py-3 font-bold text-emerald-400 print:text-emerald-700">{formatCurrency(s.revenue)}</td>
                    <td className="py-3 font-bold text-slate-200 print:text-black">{formatCurrency(s.profit)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 print:border-gray-400 print:text-black">
                        {formatPercent(s.margin)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatório 2: Modelos de Placas NFC */}
      <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4 print:border-gray-300 print:bg-white print:text-black">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 print:border-gray-200">
          <SmartphoneNfc className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide print:text-black">
            Rentabilidade por Modelo de Placa NFC
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2 print:text-gray-600 print:border-gray-300">
                <th className="pb-3 font-semibold">Modelo da Placa</th>
                <th className="pb-3 font-semibold text-center">Unidades</th>
                <th className="pb-3 font-semibold">Faturamento</th>
                <th className="pb-3 font-semibold">Custo Total</th>
                <th className="pb-3 font-semibold">Lucro Líquido</th>
                <th className="pb-3 font-semibold text-right">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {modelStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">Sem dados suficientes.</td>
                </tr>
              ) : (
                modelStats.map(m => (
                  <tr key={m.model} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-white print:text-black">{m.model}</td>
                    <td className="py-3 text-center font-black text-blue-400 print:text-blue-700">{m.plates}x</td>
                    <td className="py-3 font-bold text-emerald-400 print:text-emerald-700">{formatCurrency(m.revenue)}</td>
                    <td className="py-3 text-rose-400 print:text-rose-700">{formatCurrency(m.cost)}</td>
                    <td className="py-3 font-black text-emerald-300 print:text-black">{formatCurrency(m.profit)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded font-bold bg-[#0066FE]/20 text-blue-300 print:text-black">
                        {formatPercent(m.margin)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatório 3: Formas de Pagamento */}
      <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4 print:border-gray-300 print:bg-white print:text-black">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 print:border-gray-200">
          <CreditCard className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white tracking-wide print:text-black">
            Distribuição por Meio de Pagamento
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paymentStats.map(p => (
            <div key={p.method} className="p-4 rounded-2xl bg-[#060D1A] border border-slate-800 space-y-1 print:bg-gray-50 print:border-gray-300">
              <span className="text-xs text-slate-400 font-semibold block">{p.method}</span>
              <div className="text-lg font-black text-white print:text-black">{formatCurrency(p.revenue)}</div>
              <div className="text-[11px] text-slate-400">
                {p.count} transações ({formatPercent(p.share)} do total)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
