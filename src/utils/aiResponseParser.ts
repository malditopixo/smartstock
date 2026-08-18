export interface AIProductCard {
  name: string;
  code?: string;
  currentStock?: string;
  minStock?: string;
  status?: string;
  recommendation?: string;
  location?: string;
  category?: string;
  priority?: string;
  severity: 'critical' | 'warning' | 'normal' | 'neutral';
}

export interface AIMetricItem {
  label: string;
  value: string;
  badge?: string;
  severity?: 'critical' | 'warning' | 'normal' | 'neutral';
}

export interface AIMovementItem {
  type: 'ENTRADA' | 'SAIDA';
  quantity: string;
  productName: string;
  productCode?: string;
  date?: string;
}

export interface AISection {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'normal' | 'neutral';
  productCards: AIProductCard[];
  metrics: AIMetricItem[];
  movements: AIMovementItem[];
  paragraphs: string[];
  recommendation?: {
    title: string;
    text: string;
    severity: 'critical' | 'warning' | 'normal' | 'neutral';
  };
}

export interface AIParsedResponse {
  intro: string | null;
  sections: AISection[];
  cleanPlainText: string;
}

/**
 * Strips all raw markdown markers (###, **, *, `, ---, etc.) from a given string.
 */
export function stripMarkdown(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^#+\s+/gm, '')           // Remove #, ##, ### at start of line
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold **text**
    .replace(/\*([^*]+)\*/g, '$1')      // Remove italic *text*
    .replace(/__([^_]+)__/g, '$1')      // Remove bold __text__
    .replace(/_([^_]+)_/g, '$1')        // Remove italic _text_
    .replace(/`([^`]+)`/g, '$1')        // Remove inline code `text`
    .replace(/^[-*•]\s+/gm, '')         // Remove list bullets
    .replace(/^\d+\.\s+/gm, '')         // Remove numbered lists (1. 2. 3.)
    .replace(/^>\s+/gm, '')             // Remove blockquotes
    .replace(/^-{3,}$/gm, '')           // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n')         // Normalize newlines
    .trim();
}

/**
 * Detects severity based on text content keywords.
 */
function detectSeverity(text: string): 'critical' | 'warning' | 'normal' | 'neutral' {
  const lower = text.toLowerCase();
  if (
    lower.includes('crítico') ||
    lower.includes('critico') ||
    lower.includes('zerado') ||
    lower.includes('esgotado') ||
    lower.includes('urgente') ||
    lower.includes('máxima') ||
    lower.includes('maxima') ||
    lower.includes('0 un') ||
    lower.includes('🔴') ||
    lower.includes('🚨')
  ) {
    return 'critical';
  }
  if (
    lower.includes('baixo') ||
    lower.includes('alerta') ||
    lower.includes('atenção') ||
    lower.includes('atencao') ||
    lower.includes('mínimo') ||
    lower.includes('minimo') ||
    lower.includes('alta prioridade') ||
    lower.includes('⚠️') ||
    lower.includes('🟡')
  ) {
    return 'warning';
  }
  if (
    lower.includes('normal') ||
    lower.includes('seguro') ||
    lower.includes('adequado') ||
    lower.includes('otimizado') ||
    lower.includes('abastecido') ||
    lower.includes('nenhum item crítico') ||
    lower.includes('🟢') ||
    lower.includes('✅')
  ) {
    return 'normal';
  }
  return 'neutral';
}

/**
 * Intelligent parser that converts AI markdown output into structured visual sections and cards.
 */
export function parseAIResponse(rawText: string): AIParsedResponse {
  if (!rawText) {
    return { intro: null, sections: [], cleanPlainText: '' };
  }

  // Pre-clean line ends
  const lines = rawText.split('\n').map((l) => l.trimEnd());
  
  let introLines: string[] = [];
  const sections: AISection[] = [];
  let currentSection: AISection | null = null;
  let currentProductCard: Partial<AIProductCard> | null = null;

  const ensureSection = (title = 'Resultado da Análise', severity?: 'critical' | 'warning' | 'normal' | 'neutral') => {
    if (!currentSection) {
      currentSection = {
        id: `sec-${sections.length}`,
        title: stripMarkdown(title),
        severity: severity || detectSeverity(title),
        productCards: [],
        metrics: [],
        movements: [],
        paragraphs: []
      };
      sections.push(currentSection);
    }
    return currentSection;
  };

  const flushProductCard = () => {
    if (currentProductCard && currentProductCard.name && currentSection) {
      currentSection.productCards.push({
        name: currentProductCard.name,
        code: currentProductCard.code,
        currentStock: currentProductCard.currentStock,
        minStock: currentProductCard.minStock,
        status: currentProductCard.status,
        recommendation: currentProductCard.recommendation,
        location: currentProductCard.location,
        category: currentProductCard.category,
        priority: currentProductCard.priority,
        severity: currentProductCard.severity || detectSeverity(`${currentProductCard.status || ''} ${currentProductCard.currentStock || ''} ${currentProductCard.priority || ''}`)
      });
      currentProductCard = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleanLine = stripMarkdown(rawLine);

    if (!rawLine.trim()) {
      continue;
    }

    // Horizontal rule divider
    if (/^-{3,}$/.test(rawLine.trim())) {
      flushProductCard();
      continue;
    }

    // 1. Heading check (e.g. ### Título, ## Título, **Título com emoji:**)
    const isHeading =
      /^#{1,4}\s+/.test(rawLine) ||
      (/^(\*\*|)([🚨📦📊📉📋✅⚠️🔴🟡🟢]|)(\s*)(ITENS|SUGESTÃO|RESUMO|ANÁLISE|PRODUTO|STATUS|RECOMENDAÇÃO)/i.test(rawLine) &&
        (rawLine.includes(':') || rawLine.startsWith('**') || rawLine.startsWith('#')));

    if (isHeading) {
      flushProductCard();
      const headingTitle = cleanLine.replace(/[:]$/, '');
      const severity = detectSeverity(rawLine);
      currentSection = {
        id: `sec-${sections.length}`,
        title: headingTitle,
        severity,
        productCards: [],
        metrics: [],
        movements: [],
        paragraphs: []
      };
      sections.push(currentSection);
      continue;
    }

    // 2. Sub-headings for groups like "🔴 Estoque Zerado (2):" or "⚠️ Estoque Baixo (3):"
    if (/^[🔴⚠️🟡🟢✅📦]\s*\*\*?/.test(rawLine) && rawLine.includes(':')) {
      flushProductCard();
      const sec = ensureSection();
      const title = cleanLine;
      const severity = detectSeverity(rawLine);
      currentSection = {
        id: `sec-${sections.length}`,
        title,
        severity,
        productCards: [],
        metrics: [],
        movements: [],
        paragraphs: []
      };
      sections.push(currentSection);
      continue;
    }

    // 3. Movement line check (e.g. - **📥 ENTRADA**: 10x **Caderno** (PROD-101) em 18/08)
    if (/📥\s*ENTRADA|📤\s*SA[ÍI]DA/i.test(rawLine)) {
      flushProductCard();
      const sec = ensureSection('Movimentações');
      const isEntrada = /ENTRADA/i.test(rawLine);
      
      // Extract qty and product name
      const qtyMatch = cleanLine.match(/(\d+)\s*x/i) || cleanLine.match(/(\d+)\s*(un|cx|kg|pct)/i);
      const qty = qtyMatch ? qtyMatch[1] : '';
      
      const codeMatch = rawLine.match(/\(([^)]+)\)/) || rawLine.match(/`([^`]+)`/);
      const code = codeMatch ? codeMatch[1] : undefined;

      const dateMatch = cleanLine.match(/em\s+(.+)$/i);
      const date = dateMatch ? dateMatch[1] : undefined;

      // Extract cleaned name
      let name = cleanLine
        .replace(/^[📥📤]?\s*(ENTRADA|SAÍDA):?\s*/i, '')
        .replace(/^\d+x\s*/i, '')
        .replace(/\([^)]+\)/g, '')
        .replace(/em\s+.+$/i, '')
        .trim();

      sec.movements.push({
        type: isEntrada ? 'ENTRADA' : 'SAIDA',
        quantity: qty ? `${qty} un` : '1 un',
        productName: name || 'Produto',
        productCode: code,
        date
      });
      continue;
    }

    // 4. Recommendation banner check (e.g. **Recomendação Imediata:** ... or **Status Operacional:** ...)
    if (/^\*?\*?(Recomendaç[ãa]o|Status Operacional|Ação Recomendada|Conclusão)\*?\*?:/i.test(rawLine)) {
      flushProductCard();
      const sec = ensureSection();
      const parts = cleanLine.split(':');
      const recTitle = parts[0]?.trim() || 'Recomendação';
      const recText = parts.slice(1).join(':').trim();
      sec.recommendation = {
        title: recTitle,
        text: recText,
        severity: detectSeverity(recText || recTitle)
      };
      continue;
    }

    // 5. Product Item check (Numbered format: **1. Nome do Produto** (`COD-123`) or list bullet format)
    const isNumberedProduct = /^\*?\*?\d+\.\s+([^*`(\n]+)/.test(rawLine);
    const isBulletedProduct = /^[-*•]\s+\*\*([^*`(\n]+)\*\*/.test(rawLine) && (rawLine.includes('`') || rawLine.includes('un') || rawLine.includes('Mínimo'));

    if (isNumberedProduct || isBulletedProduct) {
      flushProductCard();
      const sec = ensureSection();

      // Extract Name
      let name = '';
      const nameMatch = rawLine.match(/^\*?\*?\d+\.\s+([^*`(\n]+)/) || rawLine.match(/^[-*•]\s+\*\*([^*`(\n]+)\*\*/);
      if (nameMatch) {
        name = nameMatch[1].trim();
      }

      // Extract Code
      const codeMatch = rawLine.match(/`([^`]+)`/) || rawLine.match(/\((PROD-[^)]+|EST-[^)]+|[A-Z0-9_-]{4,})\)/);
      const code = codeMatch ? codeMatch[1].trim() : undefined;

      // Extract Current Stock
      let currentStock: string | undefined;
      const stockMatch = rawLine.match(/:\s*\*?\*?(\d+\s*(?:un|cx|kg|pct)?)\*?\*?/i) || rawLine.match(/(\d+)\s*(?:un|cx|kg|pct)/i);
      if (stockMatch) {
        currentStock = stockMatch[1].trim();
      }

      // Extract Min Stock
      let minStock: string | undefined;
      const minMatch = rawLine.match(/M[íi]nimo(?:\s*exigido|\s*configurado)?:\s*\*?\*?(\d+\s*(?:un|cx|kg|pct)?)\*?\*?/i);
      if (minMatch) {
        minStock = minMatch[1].trim();
      }

      // Extract Location / Category
      let location: string | undefined;
      const locMatch = rawLine.match(/Local(?:\s*físico)?:\s*([^\n-]+)/i);
      if (locMatch) {
        location = stripMarkdown(locMatch[1]).trim();
      }

      let category: string | undefined;
      const catMatch = rawLine.match(/Categoria:\s*([^\n-]+)/i);
      if (catMatch) {
        category = stripMarkdown(catMatch[1]).trim();
      }

      // Determine default status / recommendation for inline item
      let status = '';
      let recommendation = '';
      if (currentStock === '0' || currentStock === '0 un' || currentStock?.startsWith('0')) {
        status = 'Estoque Zerado / Esgotado';
        recommendation = 'Reposição Urgente Necessária';
      } else if (minStock && parseInt(currentStock || '0', 10) <= parseInt(minStock, 10)) {
        status = 'Abaixo do Estoque Mínimo';
        recommendation = 'Repor em breve para evitar ruptura';
      } else {
        status = 'Estoque Regular';
        recommendation = 'Nível de segurança estável';
      }

      currentProductCard = {
        name: name || cleanLine,
        code,
        currentStock,
        minStock,
        location,
        category,
        status,
        recommendation,
        severity: detectSeverity(rawLine)
      };

      // If it was a single bullet that contained everything, flush immediately if next lines aren't sub-bullets
      if (isBulletedProduct) {
        flushProductCard();
      }
      continue;
    }

    // 6. Sub-fields for a multi-line product card (e.g. - **Prioridade:** ..., - **Estoque Atual:** ..., - **Sugestão:** ...)
    if (currentProductCard && /^[-*•]\s+\*\*([^*]+)\*\*:/i.test(rawLine)) {
      const fieldMatch = rawLine.match(/^[-*•]\s+\*\*([^*]+)\*\*:\s*(.+)$/i);
      if (fieldMatch) {
        const fieldKey = fieldMatch[1].toLowerCase();
        const fieldVal = stripMarkdown(fieldMatch[2]).trim();

        if (fieldKey.includes('prioridade')) {
          currentProductCard.priority = fieldVal;
          if (fieldVal.toLowerCase().includes('máxima') || fieldVal.toLowerCase().includes('zerado')) {
            currentProductCard.severity = 'critical';
            currentProductCard.status = 'Estoque Crítico / Zerado';
          } else if (fieldVal.toLowerCase().includes('alta') || fieldVal.toLowerCase().includes('alerta')) {
            currentProductCard.severity = 'warning';
            currentProductCard.status = 'Estoque Baixo / Alerta';
          }
        } else if (fieldKey.includes('estoque atual') || fieldKey.includes('quantidade')) {
          // Could be: "0 un | Mínimo: 5 un"
          if (fieldVal.includes('|')) {
            const splitted = fieldVal.split('|');
            currentProductCard.currentStock = splitted[0].trim();
            const minPart = splitted[1].replace(/M[íi]nimo:/i, '').trim();
            currentProductCard.minStock = minPart;
          } else {
            currentProductCard.currentStock = fieldVal;
          }
        } else if (fieldKey.includes('mínimo') || fieldKey.includes('minimo')) {
          currentProductCard.minStock = fieldVal;
        } else if (fieldKey.includes('sugestão') || fieldKey.includes('compra') || fieldKey.includes('recomendação')) {
          currentProductCard.recommendation = fieldVal;
        } else if (fieldKey.includes('situação') || fieldKey.includes('status')) {
          currentProductCard.status = fieldVal;
        } else if (fieldKey.includes('local')) {
          currentProductCard.location = fieldVal;
        } else if (fieldKey.includes('categoria')) {
          currentProductCard.category = fieldVal;
        }
        continue;
      }
    }

    // 7. General Metric Item (e.g. - **Total de Produtos:** 12 itens, - **Volume Total:** 150 un)
    if (/^[-*•]\s+\*\*([^*]+)\*\*:\s*(.+)$/.test(rawLine) && !currentProductCard) {
      const metricMatch = rawLine.match(/^[-*•]\s+\*\*([^*]+)\*\*:\s*(.+)$/);
      if (metricMatch) {
        const sec = ensureSection();
        const label = stripMarkdown(metricMatch[1]).trim();
        const val = stripMarkdown(metricMatch[2]).trim();
        sec.metrics.push({
          label,
          value: val,
          severity: detectSeverity(`${label} ${val}`)
        });
        continue;
      }
    }

    // 8. Regular text line / paragraph
    flushProductCard();
    if (sections.length === 0) {
      // It's part of the intro before any section
      introLines.push(cleanLine);
    } else {
      currentSection?.paragraphs.push(cleanLine);
    }
  }

  flushProductCard();

  // If no sections were identified, create a fallback section with paragraphs
  if (sections.length === 0 && introLines.length > 0) {
    sections.push({
      id: 'sec-0',
      title: 'Resumo da Análise',
      severity: detectSeverity(introLines.join(' ')),
      productCards: [],
      metrics: [],
      movements: [],
      paragraphs: introLines
    });
    introLines = [];
  }

  // Generate ultra clean plain text for the clipboard "Copiar" action
  let cleanPlainText = '';
  if (introLines.length > 0) {
    cleanPlainText += introLines.join('\n') + '\n\n';
  }
  sections.forEach((sec) => {
    cleanPlainText += `=== ${sec.title.toUpperCase()} ===\n`;
    sec.metrics.forEach((m) => {
      cleanPlainText += `• ${m.label}: ${m.value}\n`;
    });
    sec.productCards.forEach((pc) => {
      cleanPlainText += `\n[${pc.name}]`;
      if (pc.code) cleanPlainText += ` (${pc.code})`;
      cleanPlainText += `\n- Estoque Atual: ${pc.currentStock || 'N/A'}`;
      if (pc.minStock) cleanPlainText += ` | Mínimo: ${pc.minStock}`;
      if (pc.status) cleanPlainText += `\n- Status: ${pc.status}`;
      if (pc.recommendation) cleanPlainText += `\n- Recomendação: ${pc.recommendation}`;
      if (pc.location) cleanPlainText += `\n- Local: ${pc.location}`;
      cleanPlainText += '\n';
    });
    sec.movements.forEach((mv) => {
      cleanPlainText += `• [${mv.type}] ${mv.quantity} - ${mv.productName} ${mv.productCode ? `(${mv.productCode})` : ''} ${mv.date ? `- ${mv.date}` : ''}\n`;
    });
    sec.paragraphs.forEach((p) => {
      cleanPlainText += `${p}\n`;
    });
    if (sec.recommendation) {
      cleanPlainText += `\n>> ${sec.recommendation.title}: ${sec.recommendation.text}\n`;
    }
    cleanPlainText += '\n';
  });

  return {
    intro: introLines.length > 0 ? introLines.join(' ') : null,
    sections,
    cleanPlainText: cleanPlainText.trim()
  };
}
