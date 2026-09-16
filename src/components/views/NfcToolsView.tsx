import React, { useState } from 'react';
import { 
  SmartphoneNfc, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Info, 
  Zap, 
  CheckCircle2,
  ClipboardPaste,
  Star,
  AlertTriangle,
  Search,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { formatCurrency, parseGoogleMapsInput, GoogleReviewParseResult } from '../../utils/formatters';

export const NfcToolsView: React.FC = () => {
  // Review Link Generator State
  const [googleMapsInput, setGoogleMapsInput] = useState('');
  const [parseResult, setParseResult] = useState<GoogleReviewParseResult>({
    reviewUrl: '',
    sourceType: 'raw_url',
    label: '',
    isDirect5Star: false
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [placeIdInput, setPlaceIdInput] = useState('');

  // Proposal Calculator State
  const [proposalClient, setProposalClient] = useState('');
  const [proposalQty, setProposalQty] = useState(1);
  const [proposalUnitPrice, setProposalUnitPrice] = useState(80.00);
  const [proposalDiscount, setProposalDiscount] = useState(0);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Instant link generation on input change
  const handleInputChange = (value: string) => {
    setGoogleMapsInput(value);
    if (value.trim()) {
      const result = parseGoogleMapsInput(value);
      setParseResult(result);
    } else {
      setParseResult({ reviewUrl: '', sourceType: 'raw_url', label: '', isDirect5Star: false });
    }
  };

  // Direct Place ID application
  const handleApplyPlaceId = (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;
    setGoogleMapsInput(cleanId);
    const result = parseGoogleMapsInput(cleanId);
    setParseResult(result);
    setPlaceIdInput('');
  };

  // Paste from clipboard button
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInputChange(text);
      }
    } catch {
      // Fallback if browser permission is restricted
      const promptVal = prompt('Cole o link do Google Maps aqui:');
      if (promptVal) handleInputChange(promptVal);
    }
  };

  const handleCopyLink = () => {
    if (!parseResult.reviewUrl) return;
    navigator.clipboard.writeText(parseResult.reviewUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Proposal calculations: R$ 80 standard price, R$ 12.80 standard cost
  const grossSubtotal = proposalQty * proposalUnitPrice;
  const finalTotal = Math.max(0, grossSubtotal - proposalDiscount);
  const estimatedCost = proposalQty * 12.80;
  const estimatedProfit = finalTotal - estimatedCost;

  const handleCopyProposal = () => {
    const text = 
      `*PROPOSTA COMERCIAL - PLACAS NFC DE AVALIAÇÃO GOOGLE*\n` +
      `*GARCIA® Design Studio*\n\n` +
      `Olá ${proposalClient || 'Cliente'}! Conforme conversamos, segue a proposta para modernizar e multiplicar as avaliações 5 estrelas do seu negócio:\n\n` +
      `📦 *Item:* Placa Acrílica Premium NFC + QR Code Integrado\n` +
      `🔢 *Quantidade:* ${proposalQty} ${proposalQty === 1 ? 'unidade' : 'unidades'}\n` +
      `💰 *Valor Unitário:* ${formatCurrency(proposalUnitPrice)}\n` +
      (proposalDiscount > 0 ? `🎁 *Desconto Especial:* -${formatCurrency(proposalDiscount)}\n` : '') +
      `⭐ *INVESTIMENTO TOTAL:* ${formatCurrency(finalTotal)}\n\n` +
      `🚀 *Benefícios Inclusos:*\n` +
      `• Gravação do chip NFC com link direto de 5 estrelas no seu Google Maps\n` +
      `• O cliente só aproxima o celular e a tela de avaliação já abre na hora\n` +
      `• QR Code de redundância com design refinado para celulares sem NFC\n` +
      `• Teste de funcionamento no ato da entrega\n\n` +
      `Podemos fechar o pedido e iniciar a produção agora?`;

    navigator.clipboard.writeText(text);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Ferramentas NFC & Gravação de Chips
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Gere links diretos de 5 estrelas para gravação de placas NFC e monte propostas comerciais rápidas para WhatsApp.
        </p>
      </div>

      {/* 2 Column Layout: Google Review Link Generator & Proposal Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Col 1: Google Review URL Instant Builder */}
        <div className="p-6 rounded-3xl bg-[#0A162B] border border-[#0066FE]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0066FE]/20 border border-[#0066FE]/40 flex items-center justify-center text-[#0066FE]">
                <SmartphoneNfc className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Gerador de Link Google 5★
                </h2>
                <p className="text-[11px] text-slate-400">
                  Gera o link que abre direto o formulário de 5 estrelas ao encostar o celular
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showGuide ? 'Ocultar Dicas' : 'Como Pegar Link 5★'}</span>
            </button>
          </div>

          {/* Collapsible Guide */}
          {showGuide && (
            <div className="p-4 rounded-2xl bg-[#060D1A] border border-blue-500/30 text-xs space-y-2.5 animate-in fade-in">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Como obter o link de 5 estrelas direto da empresa:
              </span>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-bold text-white">Opção 1 (Mais fácil — Pelo Google Meu Negócio do cliente):</p>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Peça para o proprietário abrir o perfil no Google e clicar no botão azul <strong>"Solicitar avaliações"</strong>. Ele copia o link (ex: <code>g.page/r/.../review</code>). Ao colar aqui, ele abre direto a janela de 5 estrelas!
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <p className="font-bold text-white">Opção 2 (Copiar o link do Google Maps no computador):</p>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Ao abrir a empresa no Google Maps no navegador e copiar a URL completa da barra de endereços (com <code>/place/...</code>), nosso sistema extrai o Place ID automaticamente e gera o link direto de 5 estrelas!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Link ou Place ID do Estabelecimento
                </label>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#0066FE] hover:text-blue-300 transition-colors"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Colar Link Copiado</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="google-maps-instant-input"
                  type="text"
                  placeholder="Cole aqui o link do Google Maps (ex: google.com/maps/place/..., maps.app.goo.gl ou Place ID ChIJ...)"
                  value={googleMapsInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full px-3 py-3 bg-[#060D1A] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE] focus:ring-1 focus:ring-[#0066FE]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
                <span>Aceita link completo do Maps, Place ID (ChIJ...), link curto ou CID.</span>
                {parseResult.label && (
                  <span className={`font-semibold flex items-center gap-1 ${parseResult.isDirect5Star ? 'text-emerald-400' : 'text-blue-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {parseResult.label}
                  </span>
                )}
              </div>
            </div>

            {/* Warning if broken writereview?cid= was entered */}
            {parseResult.warning && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Atenção sobre o link do Google:</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {parseResult.warning}
                </p>
                {parseResult.googleMapsUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={parseResult.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border border-amber-500/40 font-semibold transition-colors"
                    >
                      <span>Abrir Perfil no Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Instant Generated Output */}
            {parseResult.reviewUrl ? (
              <div className={`p-4 rounded-2xl bg-gradient-to-b from-[#0C1E3C] to-[#060D1A] border space-y-3 animate-in fade-in ${parseResult.isDirect5Star ? 'border-emerald-500/60' : 'border-blue-500/40'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Link para Gravar no Chip NFC:
                  </span>
                  {parseResult.isDirect5Star ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      Abre 5 Estrelas Direto
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                      Abre Perfil no Google Maps
                    </span>
                  )}
                </div>

                <p className="text-xs text-white break-all bg-[#050A14] p-3 rounded-xl border border-slate-800 font-mono select-all">
                  {parseResult.reviewUrl}
                </p>

                {parseResult.placeId && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-400">Place ID Oficial:</span>
                    <code className="text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 font-mono font-bold">
                      {parseResult.placeId}
                    </code>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id="btn-copy-instant-url"
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copiado para o Celular!' : 'Copiar Link para o App NFC Tools'}</span>
                  </button>

                  <a
                    id="btn-test-instant-url"
                    href={parseResult.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700 text-xs font-semibold"
                    title="Testar se abre as 5 estrelas no navegador"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar Link</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#060D1A] border border-dashed border-slate-800 text-center py-6 text-slate-400 text-xs">
                <SmartphoneNfc className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-semibold text-slate-300">Aguardando o link do estabelecimento</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cole o link do Google Maps acima para gerar o link direto de avaliação.
                </p>
              </div>
            )}

            {/* Assistant to find Place ID if user wants guaranteed 5-star direct link */}
            <div className="p-3.5 rounded-2xl bg-[#060D1A] border border-slate-800 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  Localizador de Place ID Oficial do Google
                </span>
                <a
                  href={`https://developers.google.com/maps/documentation/places/web-service/place-id`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                >
                  <span>Abrir Place ID Finder Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Se você tiver o código do Place ID (começa com <code>ChIJ...</code>), cole abaixo para gerar o link 5 estrelas definitivo:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cole aqui o Place ID (ex: ChIJN1t_tDeuEmsRUsoyG83frY4)"
                  value={placeIdInput}
                  onChange={(e) => setPlaceIdInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0A162B] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPlaceId(placeIdInput)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Aplicar 5★
                </button>
              </div>
            </div>

            {/* Quick NFC Tutorial */}
            <div className="p-4 rounded-2xl bg-[#060D1A] border border-slate-800/80 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Passo a Passo para Gravar no App NFC Tools:
              </span>
              <ol className="text-[11px] text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Abra o aplicativo gratuito <strong>NFC Tools</strong> (Android / iOS).</li>
                <li>Clique na aba <strong>Escrever</strong> e depois em <strong>Adicionar um Registro</strong>.</li>
                <li>Escolha a opção <strong>URL / Link</strong> e cole o link gerado acima.</li>
                <li>Toque em <strong>Escrever / [X Bytes]</strong> e encoste a placa NFC na traseira do celular.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Col 2: Gerador de Orçamento WhatsApp com Desconto e Preço R$ 80 */}
        <div className="p-6 rounded-3xl bg-[#0A162B] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Gerador de Proposta para WhatsApp
              </h2>
              <p className="text-[11px] text-slate-400">
                Preço Padrão: R$ 80,00 por plaquinha • Personalize com desconto
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Nome do Cliente / Empresa
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos (Barbearia Dom Garcia)"
                value={proposalClient}
                onChange={(e) => setProposalClient(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FE]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={proposalQty}
                  onChange={(e) => setProposalQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-sm font-bold text-center text-white focus:outline-none focus:border-[#0066FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Preço/Placa (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={proposalUnitPrice}
                  onChange={(e) => setProposalUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-[#060D1A] border border-slate-700/80 rounded-xl text-sm font-bold text-center text-white focus:outline-none focus:border-[#0066FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={proposalDiscount === 0 ? '' : proposalDiscount}
                  placeholder="0.00"
                  onChange={(e) => setProposalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-[#060D1A] border border-emerald-500/40 rounded-xl text-sm font-bold text-center text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Discount chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Atalhos de Desconto:</span>
              <button
                type="button"
                onClick={() => setProposalDiscount(0)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Sem desc.
              </button>
              <button
                type="button"
                onClick={() => setProposalDiscount(10)}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
              >
                R$ 10 off
              </button>
              <button
                type="button"
                onClick={() => setProposalDiscount(20)}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
              >
                R$ 20 off
              </button>
              <button
                type="button"
                onClick={() => setProposalDiscount(Math.round(grossSubtotal * 0.1))}
                className="text-[10px] px-2 py-0.5 rounded bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-700/50"
              >
                10% off
              </button>
            </div>

            {/* Total Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0C1B33] to-[#060D1A] border border-[#0066FE]/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total a Cobrar</span>
                  <span className="text-2xl font-black text-emerald-400">{formatCurrency(finalTotal)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Seu Lucro Estimado</span>
                  <span className="text-base font-bold text-blue-300">{formatCurrency(estimatedProfit)}</span>
                  <span className="text-[10px] text-slate-400 block">Custo: {formatCurrency(estimatedCost)}</span>
                </div>
              </div>

              <button
                id="btn-copy-proposal-text"
                onClick={handleCopyProposal}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-lg shadow-emerald-600/20 transition-all"
              >
                {copiedProposal ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedProposal ? 'Texto Copiado com Sucesso!' : 'Copiar Proposta Comercial para WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
