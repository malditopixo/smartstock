export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDateShort(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDateTimeParts(isoString: string): { date: string; time: string; full: string } {
  if (!isoString) return { date: '--/--/----', time: '--:--', full: '' };
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: isoString, time: '', full: isoString };
    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
    return { date, time, full: `${date} • ${time}` };
  } catch {
    return { date: isoString, time: '', full: isoString };
  }
}

export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function getStockStatus(currentStock: number, minStock: number) {
  if (currentStock <= 0) {
    return {
      label: 'Sem Estoque',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      status: 'out_of_stock' as const,
      color: 'text-red-600',
    };
  }
  if (currentStock <= minStock) {
    return {
      label: 'Estoque Baixo',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      status: 'low_stock' as const,
      color: 'text-amber-600',
    };
  }
  return {
    label: 'Em Estoque',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    status: 'in_stock' as const,
    color: 'text-emerald-600',
  };
}
