export type MovementType = 'ENTRADA' | 'SAIDA';

export interface Product {
  id: string;
  code: string;           // Ex: "PROD-101"
  name: string;           // Ex: "Caderno Espiral A4"
  category: string;       // Ex: "Papelaria", "Eletrônicos", "Informática"
  currentStock: number;   // Estoque atual
  minStock: number;       // Estoque mínimo para alerta
  unit: string;           // Ex: "un", "cx", "kg", "pct"
  price?: number;         // Preço unitário em R$
  location?: string;      // Ex: "Corredor 2 - Prateleira B"
  description?: string;   // Descrição do item
  createdAt: string;      // ISO string
  updatedAt: string;      // ISO string
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  finalStock: number;
  timestamp: string;      // ISO string
  note?: string;          // Observação
  operator?: string;      // Nome de quem realizou a movimentação
}

export type ActiveTab = 'home' | 'inventory' | 'dashboard' | 'ai' | 'history' | 'new_product';

export type DashboardPeriod = 'today' | '7days' | '30days' | 'all';
export type DashboardChartType = 'pie' | 'bar' | 'line';
export type DashboardAnalysis =
  | 'status'
  | 'in_out'
  | 'top_products'
  | 'categories'
  | 'timeline';

export interface Operator {
  name: string;
  role?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
