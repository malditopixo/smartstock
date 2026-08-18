import { Product, Movement, Operator } from '../types';
import { INITIAL_PRODUCTS, INITIAL_MOVEMENTS } from '../data/initialData';

const PRODUCTS_KEY = 'estoque_qr_products_v1';
const MOVEMENTS_KEY = 'estoque_qr_movements_v1';
const OPERATOR_KEY = 'estoque_qr_operator_v1';

export const DEFAULT_OPERATOR: Operator = {
  name: 'Renan',
  role: 'Operador',
};

export function getStoredOperator(): Operator | null {
  try {
    const raw = localStorage.getItem(OPERATOR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
      return {
        name: parsed.name.trim(),
        role: parsed.role ? parsed.role.trim() : 'Operador',
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading operator from localStorage:', error);
    return null;
  }
}

export function saveStoredOperator(operator: Operator): void {
  try {
    localStorage.setItem(OPERATOR_KEY, JSON.stringify(operator));
  } catch (error) {
    console.error('Error saving operator to localStorage:', error);
  }
}

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (error) {
    console.error('Error loading products from localStorage:', error);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
}

export function getStoredMovements(): Movement[] {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MOVEMENTS;
  } catch (error) {
    console.error('Error loading movements from localStorage:', error);
    return INITIAL_MOVEMENTS;
  }
}

export function saveMovements(movements: Movement[]): void {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (error) {
    console.error('Error saving movements to localStorage:', error);
  }
}

export function resetToDemoData(): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(INITIAL_MOVEMENTS));
}
