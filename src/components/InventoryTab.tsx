import React, { useState, useMemo } from 'react';
import { Product, Movement } from '../types';
import { getStockStatus, formatCurrency } from '../utils/formatters';
import { calculateStockForecast } from '../utils/stockForecast';
import {
  Search,
  Filter,
  QrCode,
  Plus,
  Trash2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Tag,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface InventoryTabProps {
  products: Product[];
  movements: Movement[];
  onSelectProduct: (product: Product) => void;
  onViewQRCode: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onNavigateToNewProduct: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  movements = [],
  onSelectProduct,
  onViewQRCode,
  onDeleteProduct,
  onNavigateToNewProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      // Status
      const status = getStockStatus(p.currentStock, p.minStock).status;
      const matchesStatus =
        statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, statusFilter]);

  return (
    <div className="space-y-4 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
      <div className="bg-white p-3.5 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-900 stroke-[3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PRODUTO OU CÓDIGO..."
            className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl pl-9 pr-3 py-2.5 text-xs font-black uppercase text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-600 font-black uppercase"
            >
              LIMPAR
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider whitespace-nowrap border-2 border-zinc-900 transition-all ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white shadow-[2px_2px_0px_rgba(220,38,38,1)]'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            TODOS ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider whitespace-nowrap border-2 border-zinc-900 transition-all ${
              statusFilter === 'low_stock'
                ? 'bg-amber-400 text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-amber-700 hover:bg-amber-50'
            }`}
          >
            BAIXO ESTOQUE
          </button>
          <button
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider whitespace-nowrap border-2 border-zinc-900 transition-all ${
              statusFilter === 'out_of_stock'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-red-600 hover:bg-red-50'
            }`}
          >
            SEM ESTOQUE
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-wider whitespace-nowrap border-2 border-zinc-900 transition-all ${
              statusFilter === 'in_stock'
                ? 'bg-emerald-400 text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            OK
          </button>
        </div>

        {/* Category Selector if categories exist */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t-2 border-zinc-900">
            <Tag className="w-4 h-4 text-zinc-900 stroke-[2.5] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-100 border-2 border-zinc-900 text-zinc-900 text-xs font-black uppercase tracking-wider rounded-xl px-2.5 py-1.5 focus:outline-none w-full"
            >
              <option value="all">TODAS AS CATEGORIAS</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Header Info & Add button */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">
          EXIBINDO {filteredProducts.length} DE {products.length} ITENS
        </span>
        <button
          onClick={onNavigateToNewProduct}
          className="text-xs font-black uppercase tracking-wider text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NOVO ITEM</span>
        </button>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center space-y-3">
          <Package className="w-12 h-12 text-zinc-300 mx-auto stroke-[2]" />
          <div className="space-y-1">
            <h3 className="font-display font-black text-zinc-900 text-base uppercase">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-zinc-500 font-bold uppercase">
              Tente alterar os termos de busca ou filtros selecionados.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setStatusFilter('all');
            }}
            className="text-xs font-black uppercase tracking-wider text-red-600 hover:underline"
          >
            LIMPAR FILTROS
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const stockInfo = getStockStatus(p.currentStock, p.minStock);

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-black text-white bg-zinc-900 border border-zinc-900 px-2 py-0.5 rounded-md uppercase">
                        {p.code}
                      </span>
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {p.category}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-zinc-900 text-base uppercase leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  {/* QR Code Action Button */}
                  <button
                    onClick={() => onViewQRCode(p)}
                    className="p-2 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
                    title="Ver/Imprimir QR Code"
                  >
                    <QrCode className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Stock Counter & Status */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-zinc-900">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-black text-2xl text-zinc-900">
                      {p.currentStock}
                    </span>
                    <span className="text-xs font-black text-zinc-500 uppercase">
                      {p.unit} EM ESTOQUE
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-zinc-900 ${
                      p.currentStock === 0
                        ? 'bg-red-600 text-white'
                        : p.currentStock <= p.minStock
                        ? 'bg-amber-400 text-zinc-900'
                        : 'bg-emerald-400 text-zinc-900'
                    }`}
                  >
                    {stockInfo.label.toUpperCase()}
                  </span>
                </div>

                {/* Smart Stock Forecast Box */}
                {(() => {
                  const forecast = calculateStockForecast(p, movements);
                  return (
                    <div className="bg-zinc-50 border-2 border-zinc-900 rounded-xl p-2.5 space-y-1.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-red-600 stroke-[2.5]" />
                          PREVISÃO INTELIGENTE:
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-zinc-900 ${forecast.badgeClass}`}
                        >
                          {forecast.status === 'normal' && '🟢 NORMAL'}
                          {forecast.status === 'atencao' && '🟡 ATENÇÃO'}
                          {forecast.status === 'critico' && '🔴 CRÍTICO'}
                        </span>
                      </div>

                      {forecast.possuiDadosDeConsumo ? (
                        <div className="text-[11px] font-bold text-zinc-800 space-y-0.5 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 uppercase text-[10px] font-bold">Consumo médio:</span>
                            <span className="font-black text-zinc-900 uppercase">{forecast.consumoFormatado}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 uppercase text-[10px] font-bold">Previsão:</span>
                            <span className="font-black text-zinc-900 uppercase">{forecast.textoPrevisao.replace('Previsão: ', '')}</span>
                          </div>
                          {p.currentStock <= p.minStock && p.currentStock > 0 && (
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-tight pt-0.5">
                              ⚠️ Estoque abaixo do mínimo definido ({p.minStock} {p.unit})
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] font-bold text-zinc-600 space-y-0.5 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 uppercase text-[10px] font-bold">Previsão:</span>
                            <span className="font-black text-zinc-500 uppercase">Dados insuficientes</span>
                          </div>
                          {p.currentStock <= p.minStock && p.currentStock > 0 && (
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-tight pt-0.5">
                              ⚠️ Estoque abaixo do mínimo definido ({p.minStock} {p.unit})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Actions: Entrada/Saída & Delete */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onSelectProduct(p)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    <span>Movimentar</span>
                  </button>

                  <button
                    onClick={() => setProductToDelete(p)}
                    className="w-10 h-10 rounded-xl border-2 border-zinc-900 bg-white hover:bg-red-50 text-zinc-900 hover:text-red-600 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center transition-all shrink-0"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clean Confirmation Modal for Deletion */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 space-y-4 text-center">
            <div className="w-12 h-12 bg-red-600 rounded-2xl text-white flex items-center justify-center mx-auto border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-black text-zinc-900 text-lg uppercase">
                EXCLUIR PRODUTO?
              </h3>
              <p className="text-xs text-zinc-600 font-bold uppercase">
                Tem certeza que deseja remover <strong className="text-zinc-900">{productToDelete.name}</strong> ({productToDelete.code})? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-xs uppercase tracking-wider py-2.5 rounded-xl border-2 border-zinc-900 transition-all"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
              >
                SIM, EXCLUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
