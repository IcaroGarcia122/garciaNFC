export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);
};

export const formatPercent = (val: number): string => {
  return `${(val || 0).toFixed(1)}%`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const buildWhatsAppUrl = (phone: string, companyName: string, contactName?: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const salutation = contactName ? `Olá ${contactName}` : 'Olá';
  const text = encodeURIComponent(
    `${salutation}! Tudo bem? Sou da GARCIA e gostaria de apresentar nossa Placa NFC de Avaliação do Google para a ${companyName}. ` +
    `Com um simples toque do celular dos seus clientes, eles deixam uma avaliação 5 estrelas instantânea no seu perfil do Google Maps!`
  );
  return `https://wa.me/${number}?text=${text}`;
};

export interface GoogleReviewParseResult {
  reviewUrl: string;
  sourceType: 
    | 'place_id' 
    | 'hex_pair_place_id' 
    | 'direct_writereview' 
    | 'g_page_review'
    | 'maps_url_cid' 
    | 'maps_shortlink' 
    | 'maps_search_query' 
    | 'raw_url';
  label: string;
  isDirect5Star: boolean;
  warning?: string;
  placeId?: string;
  cid?: string;
  businessName?: string;
  googleMapsUrl?: string;
}

/**
 * Converte um par de identificadores hexadecimais do Google Maps (cell_id e fprint)
 * diretamente para o Place ID oficial (ChIJ...) usando a estrutura de Protocol Buffers do Google.
 * Exemplo: 0x94ce59c8da0aa335:0x30623a7e37d1a2b3 -> ChIJNaMK2shZzpQRs6LRN346YjA
 */
export const hexPairToPlaceId = (cellIdHex: string, fprintHex: string): string => {
  const cleanCell = cellIdHex.replace(/^0x/i, '').padStart(16, '0');
  const cleanFprint = fprintHex.replace(/^0x/i, '').padStart(16, '0');

  const cellBytes: number[] = [];
  for (let i = 14; i >= 0; i -= 2) {
    cellBytes.push(parseInt(cleanCell.substring(i, i + 2), 16));
  }

  const fprintBytes: number[] = [];
  for (let i = 14; i >= 0; i -= 2) {
    fprintBytes.push(parseInt(cleanFprint.substring(i, i + 2), 16));
  }

  // Protobuf field 1 (0x0a 0x12 0x09 + 8 bytes cell_id) + field 2 (0x11 + 8 bytes fprint)
  const bytes = new Uint8Array([
    0x0a, 0x12, 0x09,
    ...cellBytes,
    0x11,
    ...fprintBytes
  ]);

  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const parseGoogleMapsInput = (input: string): GoogleReviewParseResult => {
  if (!input || !input.trim()) {
    return {
      reviewUrl: '',
      sourceType: 'raw_url',
      label: 'Aguardando link ou Place ID',
      isDirect5Star: false
    };
  }

  const trimmed = input.trim();

  // 1. Caso crítico: Detectar o link quebrado writereview?cid=... (que dá erro 404 no Google)
  const brokenWritereviewCid = trimmed.match(/search\.google\.com\/local\/writereview.*[?&]cid=([0-9]+)/i);
  if (brokenWritereviewCid) {
    const cid = brokenWritereviewCid[1];
    return {
      reviewUrl: `https://maps.google.com/?cid=${cid}`,
      sourceType: 'maps_url_cid',
      label: 'Atenção: O Google não aceita ?cid= no writereview (Erro 404). Corrigido para perfil Google Maps.',
      isDirect5Star: false,
      warning: 'O Google não aceita o parâmetro "?cid=" no endereço "writereview" (gera erro 404 no servidor do Google). Para abrir direto a tela de 5 estrelas sem erro, o Google exige o Place ID (código ChIJ...) ou o link curto de avaliação.',
      cid,
      googleMapsUrl: `https://maps.google.com/?cid=${cid}`
    };
  }

  // 2. Link direto de avaliação oficial do Google com Place ID
  if (trimmed.includes('search.google.com/local/writereview') && (trimmed.includes('placeid=') || trimmed.includes('place_id='))) {
    const pIdMatch = trimmed.match(/[?&]place(?:_)?id=([a-zA-Z0-9_-]+)/i);
    return {
      reviewUrl: trimmed,
      sourceType: 'direct_writereview',
      label: 'Link Oficial de Avaliação 5★ Direto do Google',
      isDirect5Star: true,
      placeId: pIdMatch ? pIdMatch[1] : undefined
    };
  }

  // 3. Link curto de avaliação do Google Meu Negócio (g.page/r/... ou g.page/r/.../review)
  const gPageMatch = trimmed.match(/g\.page\/r\/([a-zA-Z0-9_-]+)/i);
  if (gPageMatch) {
    const code = gPageMatch[1];
    const directReview = `https://g.page/r/${code}/review`;
    return {
      reviewUrl: directReview,
      sourceType: 'g_page_review',
      label: 'Link 5★ Direto do Google Meu Negócio',
      isDirect5Star: true
    };
  }

  // 4. Place ID inserido diretamente (inicia com ChIJ...)
  const directPlaceId = trimmed.match(/^(ChIJ[a-zA-Z0-9_-]{15,})$/);
  if (directPlaceId) {
    const placeId = directPlaceId[1];
    return {
      reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      sourceType: 'place_id',
      label: 'Place ID Google Válido (Abre 5 Estrelas Direto)',
      isDirect5Star: true,
      placeId
    };
  }

  // 5. Place ID encontrado em qualquer parte do texto ou query param
  const placeIdMatch = trimmed.match(/(ChIJ[a-zA-Z0-9_-]{15,})/);
  if (placeIdMatch) {
    const placeId = placeIdMatch[1];
    return {
      reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      sourceType: 'place_id',
      label: 'Place ID Identificado no Texto/Link (5 Estrelas Direto)',
      isDirect5Star: true,
      placeId
    };
  }

  // 6. Query param placeid= ou place_id=
  const placeIdParam = trimmed.match(/[?&]place(?:_)?id=([a-zA-Z0-9_-]+)/i);
  if (placeIdParam) {
    const placeId = placeIdParam[1];
    return {
      reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      sourceType: 'place_id',
      label: 'Place ID Identificado no Link (5 Estrelas Direto)',
      isDirect5Star: true,
      placeId
    };
  }

  // 7. Extração de Hex Pair (cell_id e fprint) do Google Maps URL (ex: 0x94ce59c8da0aa335:0x30623a7e37d1a2b3)
  // Converte automaticamente para o Place ID ChIJ... e gera o link direto de 5 estrelas!
  const hexPairMatch = trimmed.match(/(0x[0-9a-fA-F]{8,16}):(0x[0-9a-fA-F]{8,16})/);
  if (hexPairMatch) {
    const cellIdHex = hexPairMatch[1];
    const fprintHex = hexPairMatch[2];
    const cleanCellNoZeros = cellIdHex.replace(/^0x/i, '').replace(/^0+$/, '');
    
    if (cleanCellNoZeros.length > 0) {
      try {
        const placeId = hexPairToPlaceId(cellIdHex, fprintHex);
        const nameMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/);
        const businessName = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : undefined;
        return {
          reviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
          sourceType: 'hex_pair_place_id',
          label: 'Link 5★ Direto Gerado Automaticamente (Place ID Extraído)',
          isDirect5Star: true,
          placeId,
          businessName,
          googleMapsUrl: trimmed
        };
      } catch {
        // Continua para outras checagens
      }
    }
  }

  // 8. Link com parâmetro CID (ex: https://maps.google.com/?cid=7297196570716563649)
  // NUNCA gerar search.google.com/local/writereview?cid= porque gera 404 no Google!
  const cidParam = trimmed.match(/[?&]cid=([0-9]+)/i);
  if (cidParam) {
    const cid = cidParam[1];
    return {
      reviewUrl: `https://maps.google.com/?cid=${cid}`,
      sourceType: 'maps_url_cid',
      label: 'Link de Perfil da Empresa no Google Maps (CID)',
      isDirect5Star: false,
      cid,
      googleMapsUrl: `https://maps.google.com/?cid=${cid}`,
      warning: 'Para o Google abrir a caixinha de 5 estrelas direto ao encostar o celular, use o Place ID oficial (ChIJ...) ou o link curto "g.page/r/.../review".'
    };
  }

  // 9. Links móveis curtos (maps.app.goo.gl/xxx ou goo.gl/maps/xxx)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    return {
      reviewUrl: trimmed,
      sourceType: 'maps_shortlink',
      label: 'Link de Compartilhamento do Google Maps',
      isDirect5Star: false,
      googleMapsUrl: trimmed
    };
  }

  // 10. Nome da empresa extraído de /maps/place/Nome+Da+Empresa
  const placeNameMatch = trimmed.match(/\/maps\/place\/([^/@?]+)/);
  if (placeNameMatch) {
    const rawName = decodeURIComponent(placeNameMatch[1].replace(/\+/g, ' '));
    return {
      reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawName)}`,
      sourceType: 'maps_search_query',
      label: `Perfil Identificado: ${rawName}`,
      businessName: rawName,
      isDirect5Star: false,
      googleMapsUrl: trimmed
    };
  }

  // 11. Links HTTP genéricos
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      reviewUrl: trimmed,
      sourceType: 'raw_url',
      label: 'Link Personalizado para Gravação no NFC',
      isDirect5Star: false
    };
  }

  // 12. Se for somente texto alfanumérico (tentativa de Place ID ou nome)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) {
    return {
      reviewUrl: `https://search.google.com/local/writereview?placeid=${trimmed}`,
      sourceType: 'place_id',
      label: 'Formatado como Place ID (5 Estrelas Direto)',
      isDirect5Star: true,
      placeId: trimmed
    };
  }

  // 13. Texto com nome da empresa
  return {
    reviewUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`,
    sourceType: 'maps_search_query',
    label: `Busca no Google Maps: ${trimmed}`,
    businessName: trimmed,
    isDirect5Star: false
  };
};

export const generateGoogleReviewLink = (placeIdOrUrl: string): string => {
  return parseGoogleMapsInput(placeIdOrUrl).reviewUrl;
};
