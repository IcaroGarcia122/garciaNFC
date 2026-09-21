import React, { useState, useEffect } from 'react';
import { Sale, NfcPlateModel, PaymentMethod, PaymentStatus, NfcProductionStatus, SegmentType } from '../../types';
import { 
  X, 
  ShoppingBag, 
  DollarSign, 
  SmartphoneNfc, 
  CheckCircle2, 
  Link as LinkIcon, 
  Building2, 
  Tag, 
  Calculator,
  Percent,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatPercent, parseGoogleMapsInput } from '../../utils/formatters';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, 'id' | 'grossProfit' | 'profitMarginPercent' | 'totalRevenue' | 'totalCost'>) => void;
  saleToEdit?: Sale | null;
}

const PLATE_MODELS: { model: NfcPlateModel; defaultPrice: number; defaultCost: number }[] = [
  { model: 'Placa Acrílico Balcão Google NFC + QR', defaultPrice: 80.00, defaultCost: 12.80 },
  { model: 'Placa Minimalista Slim Google NFC', defaultPrice: 80.00, defaultCost: 12.80 },
  { model: 'Mini Totem de Mesa Google NFC', defaultPrice: 80.00, defaultCost: 12.80 },
  { model: 'Cartão de Bolso Google NFC', defaultPrice: 80.00, defaultCost: 12.80 },
  { model: 'Kit 2 Placas Google NFC', defaultPrice: 160.00, defaultCost: 25.60 }
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'Boleto'
];

const SEGMENTS: SegmentType[] = [
  'Restaurante / Bar',
  'Clínica / Saúde',
  'Barbearia / Salão',
  'Automotivo / Oficina',
  'Varejo / Loja',
  'Hotel / Pousada',
  'Academia / Fitness',
  'Serviços Profissionais',
  'Outros'
];

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saleToEdit
}) => {
  const [companyName, setCompanyName] = useState('');
  const [segment, setSegment] = useState<SegmentType>('Restaurante / Bar');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [plateModel, setPlateModel] = useState<NfcPlateModel>('Placa Acrílico Balcão Google NFC + QR');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(80.00);
  const [discount, setDiscount] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(12.80);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');
  const [installments, setInstallments] = useState<number>(1);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nfcStatus, setNfcStatus] = useState<NfcProductionStatus>('aguardando_gravacao');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [detectedUrlLabel, setDetectedUrlLabel] = useState('');
  const [notes, setNotes] = useState('');

  // Synchronize initial data
  useEffect(() => {
    if (saleToEdit) {
      setCompanyName(saleToEdit.companyName || '');
      setSegment(saleToEdit.segment || 'Restaurante / Bar');
      setContactName(saleToEdit.contactName || '');
      setPhone(saleToEdit.phone || '');
      setPlateModel(saleToEdit.plateModel || 'Placa Acrílico Balcão Google NFC + QR');
      setQuantity(saleToEdit.quantity || 1);
      setUnitPrice(saleToEdit.unitPrice !== undefined ? saleToEdit.unitPrice : 80.00);
      setDiscount(saleToEdit.discount || 0);
      setUnitCost(saleToEdit.unitCost !== undefined ? saleToEdit.unitCost : 12.80);
      setPaymentMethod(saleToEdit.paymentMethod || 'PIX');
      setPaymentStatus(saleToEdit.paymentStatus || 'pago');
      setInstallments(saleToEdit.installments || 1);
      setSaleDate(saleToEdit.saleDate || new Date().toISOString().split('T')[0]);
      setNfcStatus(saleToEdit.nfcStatus || 'aguardando_gravacao');
      setGoogleReviewUrl(saleToEdit.googleReviewUrl || '');
      setNotes(saleToEdit.notes || '');
    } else {
      setCompanyName('');
      setSegment('Restaurante / Bar');
      setContactName('');
      setPhone('');
      setPlateModel('Placa Acrílico Balcão Google NFC + QR');
      setQuantity(1);
      setUnitPrice(80.00);
      setDiscount(0);
      setUnitCost(12.80);
      setPaymentMethod('PIX');
      setPaymentStatus('pago');
      setInstallments(1);
      setSaleDate(new Date().toISOString().split('T')[0]);
      setNfcStatus('aguardando_gravacao');
      setGoogleReviewUrl('');
      setDetectedUrlLabel('');
      setNotes('');
    }
  }, [saleToEdit, isOpen]);

  const handleModelChange = (modelName: NfcPlateModel) => {
    setPlateModel(modelName);
    const found = PLATE_MODELS.find(m => m.model === modelName);
    if (found) {
      setUnitPrice(found.defaultPrice);
      setUnitCost(found.defaultCost);
    }
  };

  const [validationError, setValidationError] = useState<string | null>(null);

  // Smart Google Maps link conversion on paste or change
  const handleGoogleUrlInput = (rawVal: string) => {
    setGoogleReviewUrl(rawVal);
    if (rawVal.trim()) {
      const parsed = parseGoogleMapsInput(rawVal);
      if (parsed.reviewUrl && parsed.reviewUrl !== rawVal) {
        setGoogleReviewUrl(parsed.reviewUrl);
      }
      setDetectedUrlLabel(parsed.label);
      if (parsed.businessName && !companyName.trim()) {
        setCompanyName(parsed.businessName);
      }
    } else {
      setDetectedUrlLabel('');
    }
  };

  // Calculations
  const subtotal = quantity * unitPrice;
  const calculatedRevenue = Math.max(0, subtotal - discount);
  const calculatedCost = quantity * unitCost;
  const calculatedProfit = calculatedRevenue - calculatedCost;
  const calculatedMargin = calculatedRevenue > 0 ? (calculatedProfit / calculatedRevenue) * 100 : 0;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setValidationError('Por favor, informe o nome da empresa compradora.');
      const el = document.getElementById('sale-company-input');
      if (el) el.focus();
      return;
    }
    setValidationError(null);

    onSave({
      companyName: companyName.trim(),
      segment,
      contactName: contactName.trim(),
      phone: phone.trim(),
      plateModel,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 80.00,
      discount: Number(discount) || 0,
      unitCost: Number(unitCost) || 12.80,
      paymentMethod,
      paymentStatus,
      installments: paymentStatus === 'parcelado' ? installments : undefined,
      saleDate,
      nfcStatus,
      googleReviewUrl: googleReviewUrl.trim(),
      notes: notes.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto overscroll-none animate-in fade-in duration-200">
      <div 
        id="sale-modal-card"
        className="w-full max-w-2xl bg-[#0A162B] border border-[#0066FE]/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 flex flex-col max-h-[calc(100dvh-16px)] sm:max-h-[90vh] text-slate-100"
      >
        {/* Header - Always visible at top */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-[#060D1A]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0066FE]/20 border border-[#0066FE]/50 flex items-center justify-center text-[#0066FE] shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight">
                {saleToEdit ? 'Editar Venda de Placa NFC' : 'Registrar Nova Venda de Placas NFC'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Preço Padrão: R$ 80,00 • Custo de Fabricação: R$ 12,80
              </p>
            </div>
          </div>
          <button
            id="close-sale-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Wrapping both inputs and sticky actions */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable inputs */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
            {validationError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Empresa Nome */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nome da Empresa Compradora *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 sm:top-3" />
                  <input
                    id="sale-company-input"
                    type="text"
                    required
                    placeholder="Nome da loja, restaurante, barbearia, clínica..."
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
                  />
                </div>
              </div>

            {/* Segmento */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Segmento / Nicho
              </label>
              <select
                id="sale-segment-select"
                value={segment}
                onChange={(e) => setSegment(e.target.value as SegmentType)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
              >
                {SEGMENTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Modelo da Placa NFC */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Modelo da Placa NFC
              </label>
              <select
                id="sale-plate-model-select"
                value={plateModel}
                onChange={(e) => handleModelChange(e.target.value as NfcPlateModel)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-[#0066FE]/40 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
              >
                {PLATE_MODELS.map(m => (
                  <option key={m.model} value={m.model}>
                    {m.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Quantidade de Placas
              </label>
              <input
                id="sale-quantity-input"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white font-bold text-center focus:outline-none focus:border-[#0066FE]"
              />
            </div>

            {/* Preço Unitário (Padrão R$ 80,00) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Preço por Placa (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 sm:top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  id="sale-unit-price-input"
                  type="number"
                  step="0.01"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white font-bold focus:outline-none focus:border-[#0066FE]"
                />
              </div>
              <span className="text-[11px] text-blue-400">Preço padrão: R$ 80,00</span>
            </div>

            {/* Desconto (R$) - Solicitado pelo usuário */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Desconto Concedido (R$)
                </label>
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                    -{formatCurrency(discount)}
                  </span>
                )}
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5 sm:top-3" />
                <input
                  id="sale-discount-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#060D1A] border border-emerald-500/40 rounded-xl text-base sm:text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              {/* Quick Discount chips */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Atalhos:</span>
                <button
                  type="button"
                  onClick={() => setDiscount(0)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Sem desc.
                </button>
                <button
                  type="button"
                  onClick={() => setDiscount(10)}
                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                >
                  R$ 10 off
                </button>
                <button
                  type="button"
                  onClick={() => setDiscount(20)}
                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                >
                  R$ 20 off
                </button>
                <button
                  type="button"
                  onClick={() => setDiscount(Math.round(subtotal * 0.1))}
                  className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50"
                >
                  10% off
                </button>
              </div>
            </div>

            {/* Custo de Fabricação por Placa (Padrão R$ 12,80) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Custo de Fabricação por Placa (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 sm:top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  id="sale-unit-cost-input"
                  type="number"
                  step="0.01"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white font-bold focus:outline-none focus:border-[#0066FE]"
                />
              </div>
              <span className="text-[11px] text-slate-400">Gasto padrão: R$ 12,80 (chip + acrílico + adesivo)</span>
            </div>
          </div>

          {/* Real-time Profit Preview Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#060D1A] border border-[#0066FE]/40 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Calculator className="w-3.5 h-3.5" />
                <span>Resumo Financeiro Desta Venda</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {quantity} {quantity === 1 ? 'placa' : 'placas'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Subtotal</span>
                <span className="text-sm font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Desconto</span>
                <span className={`text-sm font-bold ${discount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {discount > 0 ? `- ${formatCurrency(discount)}` : 'R$ 0,00'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Cobrado</span>
                <span className="text-base font-black text-white">{formatCurrency(calculatedRevenue)}</span>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-2 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 block uppercase font-bold">Lucro Líquido</span>
                <span className="text-base font-black text-emerald-400">{formatCurrency(calculatedProfit)}</span>
                <span className="text-[10px] text-emerald-300 font-bold block -mt-0.5">
                  ({formatPercent(calculatedMargin)})
                </span>
              </div>
            </div>
          </div>

          {/* Contato, Telefone e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Contato Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos (Gerente)"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                WhatsApp do Cliente
              </label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Data da Venda
              </label>
              <input
                type="date"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
              />
            </div>
          </div>

          {/* Pagamento e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status do Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
              >
                <option value="pago">Pago (Recebido integralmente)</option>
                <option value="pendente">Pendente (A receber na entrega)</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </div>
          </div>

          {/* Status de Gravação da Placa NFC */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Status de Produção & Gravação do Chip NFC
            </label>
            <select
              value={nfcStatus}
              onChange={(e) => setNfcStatus(e.target.value as NfcProductionStatus)}
              className="w-full px-3 py-2.5 bg-[#060D1A] border border-[#0066FE]/40 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-[#0066FE]"
            >
              <option value="aguardando_gravacao">⏳ Aguardando Gravação do Chip NFC</option>
              <option value="gravado_testado">✅ Chip NFC Gravado & Testado com Celular</option>
              <option value="entregue_instalado">🚀 Placa Entregue & Instalada no Estabelecimento</option>
            </select>
          </div>

          {/* Link do Google Maps com conversão inteligente */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Link do Google Maps / Place ID (Para Chip NFC)
              </label>
              {detectedUrlLabel && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {detectedUrlLabel}
                </span>
              )}
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 sm:top-3" />
              <input
                id="sale-google-url-input"
                type="text"
                placeholder="Cole o link do Google Maps aqui (converte automaticamente)..."
                value={googleReviewUrl}
                onChange={(e) => handleGoogleUrlInput(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE] font-mono"
              />
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-blue-400 rounded transition-colors"
                  title="Testar link no navegador"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block leading-tight">
              Ao colar o link do Google Maps aqui, formatamos a URL direta de 5 estrelas para gravação no chip NFC!
            </span>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Observações Adicionais
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Placa para o balcão principal do caixa. Cliente pediu logo do Google em destaque."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#060D1A] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE] resize-none"
            />
          </div>
        </div>

        {/* Actions - Sticky at bottom of form */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-slate-800 bg-[#060D1A]/95 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="save-sale-submit-btn"
            type="submit"
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0052FF] to-[#0072FF] hover:brightness-110 shadow-lg shadow-blue-500/25 transition-all min-h-[44px] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{saleToEdit ? 'Atualizar Venda' : 'Salvar Venda (R$ 80/placa)'}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};
