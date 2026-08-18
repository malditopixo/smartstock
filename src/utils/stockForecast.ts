import { Product, Movement } from '../types';

export type ForecastStatus = 'normal' | 'atencao' | 'critico';

export interface StockForecast {
  consumoMedioDiario: number | null;
  diasRestantes: number | null;
  status: ForecastStatus;
  textoPrevisao: string;
  possuiDadosDeConsumo: boolean;
  consumoFormatado: string;
  diasFormatado: string;
  statusLabel: string;
  statusMotivo?: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  dotColor: string;
}

export interface ForecastSummary {
  normalCount: number;
  atencaoCount: number;
  criticoCount: number;
  priorityProducts: Array<{
    product: Product;
    forecast: StockForecast;
  }>;
}

/**
 * Calculates stock forecast for a single product based on historical "SAIDA" movements in the last 30 days.
 */
export function calculateStockForecast(
  product: Product,
  movements: Movement[],
  daysWindow: number = 30
): StockForecast {
  const now = Date.now();
  const windowMs = daysWindow * 24 * 60 * 60 * 1000;
  const cutoffTime = now - windowMs;

  // 1. Filter SAIDA movements for this product in the last 30 days
  const productExits = movements.filter((m) => {
    if (m.productId !== product.id || m.type !== 'SAIDA') return false;
    const movTime = new Date(m.timestamp).getTime();
    return !isNaN(movTime) && movTime >= cutoffTime;
  });

  const totalExitsCount = productExits.length;
  const totalRetirado = productExits.reduce((sum, m) => sum + (m.quantity || 0), 0);

  // Check if there are valid exit records
  const possuiDadosDeConsumo = totalExitsCount > 0 && totalRetirado > 0;

  let consumoMedioDiario: number | null = null;
  let diasRestantes: number | null = null;

  if (possuiDadosDeConsumo) {
    // Find the oldest movement date in the window to calculate observed period
    const timestamps = productExits.map((m) => new Date(m.timestamp).getTime());
    const oldestTimestamp = Math.min(...timestamps);
    
    // Elapsed time from oldest exit to now in days (minimum 1 day to prevent division by zero)
    const elapsedDays = Math.max(1, (now - oldestTimestamp) / (24 * 60 * 60 * 1000));
    
    // Average daily consumption
    const rawConsumo = totalRetirado / elapsedDays;
    // Round to max 1 decimal place or integer
    consumoMedioDiario = rawConsumo >= 1 ? Math.round(rawConsumo * 10) / 10 : Math.round(rawConsumo * 100) / 100;
    if (consumoMedioDiario <= 0) consumoMedioDiario = 0.1;

    if (product.currentStock <= 0) {
      diasRestantes = 0;
    } else {
      const rawDias = product.currentStock / consumoMedioDiario;
      diasRestantes = Math.round(rawDias * 10) / 10;
    }
  }

  // Determine Alert Status based on priority rules:
  // Rule 1: Stock is 0 -> CRÍTICO
  // Rule 2: Stock <= minStock -> CRÍTICO (Minimum stock always takes priority)
  // Rule 3: Forecast <= 3 days -> CRÍTICO
  // Rule 4: Forecast > 3 and <= 7 days -> ATENÇÃO
  // Rule 5: Forecast > 7 days or No data (with stock > minStock) -> NORMAL
  let status: ForecastStatus = 'normal';
  let statusMotivo = '';

  if (product.currentStock <= 0) {
    status = 'critico';
    statusMotivo = 'Estoque esgotado (0 unidades)';
  } else if (product.currentStock <= product.minStock) {
    status = 'critico';
    statusMotivo = `Abaixo do mínimo (${product.currentStock}/${product.minStock} ${product.unit})`;
  } else if (diasRestantes !== null && diasRestantes <= 3) {
    status = 'critico';
    statusMotivo = 'Previsão de esgotamento em 3 dias ou menos';
  } else if (diasRestantes !== null && diasRestantes > 3 && diasRestantes <= 7) {
    status = 'atencao';
    statusMotivo = 'Previsão de esgotamento entre 4 e 7 dias';
  } else {
    status = 'normal';
    statusMotivo = possuiDadosDeConsumo
      ? 'Estoque seguro para mais de 7 dias'
      : 'Estoque acima do mínimo (sem dados de consumo)';
  }

  // Formatting helpers for clean presentation
  let consumoFormatado = 'Sem saídas recentes';
  let diasFormatado = 'Dados insuficientes';
  let textoPrevisao = 'DADOS INSUFICIENTES PARA PREVISÃO';

  if (possuiDadosDeConsumo && consumoMedioDiario !== null && diasRestantes !== null) {
    consumoFormatado = `${consumoMedioDiario} ${product.unit}/dia`;
    if (product.currentStock === 0) {
      diasFormatado = 'Esgotado (0 dias)';
      textoPrevisao = 'Estoque zerado';
    } else if (diasRestantes < 1) {
      diasFormatado = 'Menos de 1 dia';
      textoPrevisao = 'Previsão: menos de 1 dia restante';
    } else {
      const diasAprox = Math.round(diasRestantes);
      diasFormatado = `Aprox. ${diasAprox} ${diasAprox === 1 ? 'dia' : 'dias'}`;
      textoPrevisao = `Previsão: aproximadamente ${diasAprox} ${diasAprox === 1 ? 'dia restante' : 'dias restantes'}`;
    }
  }

  // Styling based on status
  let statusLabel = 'NORMAL';
  let badgeClass = 'bg-emerald-400 text-zinc-900';
  let borderClass = 'border-emerald-500';
  let bgClass = 'bg-emerald-50';
  let textClass = 'text-emerald-700';
  let dotColor = 'bg-emerald-500';

  if (status === 'critico') {
    statusLabel = 'CRÍTICO';
    badgeClass = 'bg-red-600 text-white';
    borderClass = 'border-red-600';
    bgClass = 'bg-red-50';
    textClass = 'text-red-600';
    dotColor = 'bg-red-600';
  } else if (status === 'atencao') {
    statusLabel = 'ATENÇÃO';
    badgeClass = 'bg-amber-400 text-zinc-900';
    borderClass = 'border-amber-400';
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-700';
    dotColor = 'bg-amber-500';
  }

  return {
    consumoMedioDiario,
    diasRestantes,
    status,
    textoPrevisao,
    possuiDadosDeConsumo,
    consumoFormatado,
    diasFormatado,
    statusLabel,
    statusMotivo,
    badgeClass,
    borderClass,
    bgClass,
    textClass,
    dotColor
  };
}

/**
 * Calculates global forecast metrics and prioritizes the top 3 most urgent products for replenishment.
 */
export function calculateForecastSummary(
  products: Product[],
  movements: Movement[]
): ForecastSummary {
  let normalCount = 0;
  let atencaoCount = 0;
  let criticoCount = 0;

  const analyzed = products.map((product) => {
    const forecast = calculateStockForecast(product, movements);
    if (forecast.status === 'critico') {
      criticoCount++;
    } else if (forecast.status === 'atencao') {
      atencaoCount++;
    } else {
      normalCount++;
    }
    return { product, forecast };
  });

  // Sort by priority order specified in requirements:
  // 1. Products with 0 stock (currentStock === 0)
  // 2. Critical products with fewest days remaining
  // 3. Products below minimum stock
  // 4. Products in attention status
  const sorted = [...analyzed].sort((a, b) => {
    // 1. Zero stock first
    const aZero = a.product.currentStock === 0 ? 1 : 0;
    const bZero = b.product.currentStock === 0 ? 1 : 0;
    if (aZero !== bZero) return bZero - aZero;

    // Status priority weight: critico = 3, atencao = 2, normal = 1
    const statusWeight = (s: ForecastStatus) => (s === 'critico' ? 3 : s === 'atencao' ? 2 : 1);
    const weightA = statusWeight(a.forecast.status);
    const weightB = statusWeight(b.forecast.status);
    if (weightA !== weightB) return weightB - weightA;

    // Days remaining (fewer days is more urgent)
    const aDays = a.forecast.diasRestantes !== null ? a.forecast.diasRestantes : 9999;
    const bDays = b.forecast.diasRestantes !== null ? b.forecast.diasRestantes : 9999;
    if (aDays !== bDays) return aDays - bDays;

    // Stock ratio to minimum (lower ratio is more urgent)
    const aRatio = a.product.currentStock / Math.max(1, a.product.minStock);
    const bRatio = b.product.currentStock / Math.max(1, b.product.minStock);
    return aRatio - bRatio;
  });

  // Filter out healthy/normal products unless no urgent ones exist, take top 3
  const urgentList = sorted.filter((item) => item.forecast.status !== 'normal');
  const priorityProducts = (urgentList.length > 0 ? urgentList : sorted).slice(0, 3);

  return {
    normalCount,
    atencaoCount,
    criticoCount,
    priorityProducts
  };
}
