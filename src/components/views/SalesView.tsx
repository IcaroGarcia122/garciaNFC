import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale, NfcProductionStatus, PaymentStatus } from '../../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  SmartphoneNfc, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Truck,
  Edit,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate, formatPhone } from '../../utils/formatters';

interface SalesViewProps {
  onOpenNewSale: () => void;
  onEditSale: (sale: Sale) => void;
}

const NFC_STATUS_BADGES: Record<NfcProductionStatus, { label: string; class: string; icon: any }> = {
  aguardando_gravacao: {
    label: 'Aguardando Gravação NFC',
    class: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Clock
  },
  gravado_testado: {
    label: 'Gravado & Testado',
    class: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: SmartphoneNfc
  },
  entregue_instalado: {
    label: 'Entregue & Instalado',
    class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: CheckCircle2
  }
};

export const SalesView: React.FC<SalesViewProps> = ({
  onOpenNewSale,
  onEditSale
}) => {
  const { sales, deleteSale, updateSale, stats } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [nfcFilter, setNfcFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch = 
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plateModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contactName && s.contactName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesNfc = nfcFilter === 'all' || s.nfcStatus === nfcFilter;
      const matchesPayment = paymentFilter === 'all' || s.paymentStatus === paymentFilter;

      return matchesSearch && matchesNfc && matchesPayment;
    });
  }, [sales, searchTerm, nfcFilter, paymentFilter]);

  const handleCopyUrl = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCycleNfcStatus = (sale: Sale) => {
    const nextStatus: Record<NfcProductionStatus, NfcProductionStatus> = {
      aguardando_gravacao: 'gravado_testado',
      gravado_testado: 'entregue_instalado',
      entregue_instalado: 'aguardando_gravacao'
    };
    updateSale(sale.id, { nfcStatus: nextStatus[sale.nfcStatus] });
  };

  const handleDelete = (sale: Sale) => {
    if (confirm(`Deseja excluir a venda para "${sale.companyName}"?`)) {
      deleteSale(sale.id);
    }
  };

  const exportSalesCsv = () => {
    const headers = ['Data', 'Empresa', 'Segmento', 'Modelo Placa', 'Quantidade', 'Preço Unitário', 'Faturamento', 'Custo Total', 'Lucro Bruto', 'Forma Pagamento', 'Status Pagamento', 'Status NFC', 'Link Google'];
    const rows = sales.map(s => [
      s.saleDate,
      `"${s.companyName}"`,
      `"${s.segment}"`,
      `"${s.plateModel}"`,
      s.quantity,
      s.unitPrice.toFixed(2),
      s.totalRevenue.toFixed(2),
      s.totalCost.toFixed(2),
      s.grossProfit.toFixed(2),
      `"${s.paymentMethod}"`,
      `"${s.paymentStatus}"`,
      `"${s.nfcStatus}"`,
      `"${s.googleReviewUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `garcia-vendas-nfc-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Vendas de Placas NFC & Pedidos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {filteredSales.length} pedidos
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Gestão de faturamento, custos de produção dos chips e status de gravação NFC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-sales-csv"
            onClick={exportSalesCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#0A162B] border border-slate-700 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
          <button
            id="btn-add-new-sale-page"
            onClick={onOpenNewSale}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 shadow-[0_0_20px_rgba(0,102,254,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Venda NFC (R$ 80)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Faturado</span>
          <div className="text-xl font-black text-emerald-400 mt-1">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Placas NFC Vendidas</span>
          <div className="text-xl font-black text-white mt-1">{stats.platesSold} unidades</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custo Total (R$ 12,80/un)</span>
          <div className="text-xl font-black text-rose-400 mt-1">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lucro Bruto Médio</span>
          <div className="text-xl font-black text-[#00D2FF] mt-1">
            {stats.totalRevenue > 0 
              ? `${(((stats.totalRevenue - stats.totalCost) / stats.totalRevenue) * 100).toFixed(1)}%` 
              : '0%'}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="sales-search-input"
            type="text"
            placeholder="Buscar por empresa, modelo da placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            id="sales-nfc-status-filter"
            value={nfcFilter}
            onChange={(e) => setNfcFilter(e.target.value)}
            className="px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#0066FE]"
          >
            <option value="all">Todos os Status NFC</option>
            <option value="aguardando_gravacao">Aguardando Gravação</option>
            <option value="gravado_testado">Gravado & Testado</option>
            <option value="entregue_instalado">Entregue & Instalado</option>
          </select>

          <select
            id="sales-payment-filter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-[#060D1A] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#0066FE]"
          >
            <option value="all">Todos os Pagamentos</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="parcelado">Parcelado</option>
          </select>
        </div>
      </div>

      {/* Sales List: Responsive Mobile Cards (md:hidden) + Desktop Table (hidden md:block) */}
      <div className="md:hidden space-y-3">
        {filteredSales.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0A162B] border border-slate-800 text-center text-slate-400 text-xs">
            Nenhuma venda encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredSales.map(sale => {
            const nfcBadge = NFC_STATUS_BADGES[sale.nfcStatus];
            const Icon = nfcBadge.icon;
            return (
              <div 
                key={sale.id}
                className="p-4 rounded-2xl bg-[#0A162B] border border-slate-800 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight">{sale.companyName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {sale.contactName ? `${sale.contactName} • ` : ''}{formatDate(sale.saleDate)}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#0066FE]/20 text-[#00D2FF] font-black text-xs shrink-0">
                    {sale.quantity}x placa{sale.quantity > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-[#060D1A] p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Modelo</span>
                    <span className="font-medium text-slate-200">{sale.plateModel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Valor Total</span>
                    <span className="font-bold text-emerald-400 text-sm">{formatCurrency(sale.totalRevenue)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#060D1A]/60 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Lucro Líquido</span>
                    <span className="font-bold text-emerald-300">{formatCurrency(sale.grossProfit)}</span>
                    <span className="text-[10px] text-emerald-400/80 ml-1">({sale.profitMarginPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#060D1A]/60 border border-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Pagamento</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                      sale.paymentStatus === 'pago' 
                        ? 'text-emerald-400 bg-emerald-500/15' 
                        : 'text-amber-400 bg-amber-500/15'
                    }`}>
                      {sale.paymentStatus === 'pago' ? 'Pago' : sale.paymentStatus === 'pendente' ? 'Pendente' : 'Parcelado'}
                    </span>
                    <span className="text-slate-400 ml-1 text-[10px]">({sale.paymentMethod})</span>
                  </div>
                </div>

                {/* NFC Status pill & Action buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCycleNfcStatus(sale)}
                    title="Toque para alternar status do chip NFC"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${nfcBadge.class}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{nfcBadge.label}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {sale.googleReviewUrl && (
                      <button
                        onClick={() => handleCopyUrl(sale.googleReviewUrl, sale.id)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Copiar URL para gravar"
                      >
                        {copiedId === sale.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {sale.googleReviewUrl && (
                      <a
                        href={sale.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-[#00D2FF] hover:bg-slate-800 rounded-lg transition-colors"
                        title="Abrir Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => onEditSale(sale)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(sale)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sales Table (hidden on mobile, visible on desktop) */}
      <div className="hidden md:block p-4 rounded-3xl bg-[#0A162B] border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-3">
              <th className="pb-3 font-semibold">Empresa & Contato</th>
              <th className="pb-3 font-semibold">Modelo de Placa NFC</th>
              <th className="pb-3 font-semibold text-center">Qtd</th>
              <th className="pb-3 font-semibold">Faturamento</th>
              <th className="pb-3 font-semibold">Lucro Líquido</th>
              <th className="pb-3 font-semibold">Pagamento</th>
              <th className="pb-3 font-semibold">Status do Chip NFC</th>
              <th className="pb-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400">
                  Nenhuma venda encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredSales.map(sale => {
                const nfcBadge = NFC_STATUS_BADGES[sale.nfcStatus];
                const Icon = nfcBadge.icon;
                return (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-medium text-white">
                      <div className="font-bold text-white">{sale.companyName}</div>
                      <div className="text-[10px] text-slate-400">
                        {sale.contactName ? `${sale.contactName} • ` : ''}{formatDate(sale.saleDate)}
                      </div>
                    </td>

                    <td className="py-3 text-slate-200">
                      <div className="font-medium text-slate-300 max-w-[200px] truncate" title={sale.plateModel}>
                        {sale.plateModel}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Unit: {formatCurrency(sale.unitPrice)} | Custo: {formatCurrency(sale.unitCost)}
                      </div>
                    </td>

                    <td className="py-3 text-center font-bold text-blue-300">
                      <span className="px-2 py-0.5 rounded-md bg-[#0066FE]/20 text-[#00D2FF] font-black">
                        {sale.quantity}x
                      </span>
                    </td>

                    <td className="py-3 font-black text-emerald-400 text-sm">
                      {formatCurrency(sale.totalRevenue)}
                      {sale.discount && sale.discount > 0 ? (
                        <div className="text-[10px] text-emerald-300 font-normal">
                          Desc: -{formatCurrency(sale.discount)}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3">
                      <div className="font-bold text-emerald-300">
                        {formatCurrency(sale.grossProfit)}
                      </div>
                      <span className="text-[10px] text-emerald-400/80">
                        ({sale.profitMarginPercent.toFixed(0)}% margem)
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="text-slate-200 font-medium">{sale.paymentMethod}</div>
                      <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        sale.paymentStatus === 'pago' 
                          ? 'text-emerald-400 bg-emerald-500/15' 
                          : 'text-amber-400 bg-amber-500/15'
                      }`}>
                        {sale.paymentStatus === 'pago' ? 'Pago' : sale.paymentStatus === 'pendente' ? 'A receber' : 'Parcelado'}
                      </span>
                    </td>

                    {/* Interactive NFC Status Pill */}
                    <td className="py-3">
                      <button
                        onClick={() => handleCycleNfcStatus(sale)}
                        title="Clique para alternar o status do Chip NFC (Aguardando -> Gravado -> Entregue)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all hover:scale-105 cursor-pointer ${nfcBadge.class}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{nfcBadge.label}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Copy Review URL */}
                        {sale.googleReviewUrl && (
                          <button
                            onClick={() => handleCopyUrl(sale.googleReviewUrl, sale.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="Copiar URL de Avaliação para gravar no Chip NFC"
                          >
                            {copiedId === sale.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {sale.googleReviewUrl && (
                          <a
                            href={sale.googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-[#00D2FF] hover:bg-slate-800 rounded transition-colors"
                            title="Abrir Link da Avaliação"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onEditSale(sale)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(sale)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
