import React, { useMemo } from 'react';
import { Product, Movement, ActiveTab } from '../types';
import { formatDateShort } from '../utils/formatters';
import { calculateForecastSummary } from '../utils/stockForecast';
import {
  QrCode,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  History,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';

interface HomeTabProps {
  products: Product[];
  movements: Movement[];
  onOpenScanner: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  products,
  movements,
  onOpenScanner,
  onNavigateTab,
  onSelectProduct
}) => {
  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.minStock
  );

  const totalItemsCount = products.reduce((acc, p) => acc + p.currentStock, 0);
  const recentMovements = movements.slice(0, 4);

  // Calculate live forecast summary and prioritized replenishment list
  const forecastSummary = useMemo(() => {
    return calculateForecastSummary(products, movements);
  }, [products, movements]);

  return (
    <div className="space-y-5 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Hero CTA - Giant "Escanear QR Code" Button */}
      <div className="bg-red-600 rounded-3xl p-6 text-white border-4 border-zinc-900 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Decorative background watermark */}
        <div className="absolute right-2 top-2 text-black/10 pointer-events-none">
          <QrCode className="w-36 h-36" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white border border-zinc-900">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" />
            Scanner QR Câmera Mobile
          </div>

          <div>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight leading-none text-white">
              LEITOR RÁPIDO DE QR CODE
            </h2>
            <p className="text-xs text-red-100 font-bold uppercase tracking-wide mt-1.5">
              Aponte a câmera para dar entrada ou saída no estoque sem complicação.
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="w-full bg-white text-zinc-900 hover:bg-zinc-100 active:translate-y-1 active:shadow-none font-display font-black text-lg uppercase tracking-tight py-4 rounded-2xl border-3 border-zinc-900 shadow-[5px_5px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span>ESCANEAR QR CODE</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Products Card */}
        <button
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 active:translate-y-0.5 active:shadow-none text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-900 stroke-[3]" />
          </div>
          <div className="mt-3">
            <span className="font-display font-black text-3xl text-zinc-900 leading-none tracking-tighter">
              {products.length}
            </span>
            <span className="text-[10px] text-zinc-600 block font-black uppercase tracking-wider mt-1">
              PRODUTOS ({totalItemsCount} UNID)
            </span>
          </div>
        </button>

        {/* Low Stock Alert Card */}
        <button
          onClick={() => onNavigateTab('inventory')}
          className={`p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-left transition-all group ${
            lowStockProducts.length > 0
              ? 'bg-red-500 text-white'
              : 'bg-white text-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                lowStockProducts.length > 0
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-900'
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <ChevronRight className={`w-5 h-5 stroke-[3] ${lowStockProducts.length > 0 ? 'text-white' : 'text-zinc-900'}`} />
          </div>
          <div className="mt-3">
            <span
              className={`font-display font-black text-3xl leading-none tracking-tighter ${
                lowStockProducts.length > 0 ? 'text-white' : 'text-zinc-900'
              }`}
            >
              {lowStockProducts.length}
            </span>
            <span className={`text-[10px] block font-black uppercase tracking-wider mt-1 ${lowStockProducts.length > 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>
              ESTOQUE CRÍTICO
            </span>
          </div>
        </button>
      </div>

      {/* Previsão de Estoque - Smart Forecast Section */}
      <div className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
            </div>
            <h3 className="font-display text-xs font-black uppercase tracking-widest text-zinc-900">
              PREVISÃO DE ESTOQUE
            </h3>
          </div>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">
            Últimos 30 dias
          </span>
        </div>

        {/* 3 Status Counters: NORMAL, ATENÇÃO, CRÍTICO */}
        <div className="grid grid-cols-3 gap-2">
          {/* Normal */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="bg-emerald-50 border-2 border-zinc-900 p-2.5 rounded-xl text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-emerald-100 transition-colors"
          >
            <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center justify-center gap-1">
              <span>🟢 NORMAL</span>
            </div>
            <span className="font-display font-black text-2xl text-zinc-900 block mt-1 leading-none">
              {forecastSummary.normalCount}
            </span>
            <span className="text-[9px] font-bold uppercase text-zinc-500 block mt-0.5">
              Itens seguros
            </span>
          </button>

          {/* Atenção */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="bg-amber-50 border-2 border-zinc-900 p-2.5 rounded-xl text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-100 transition-colors"
          >
            <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center justify-center gap-1">
              <span>🟡 ATENÇÃO</span>
            </div>
            <span className="font-display font-black text-2xl text-zinc-900 block mt-1 leading-none">
              {forecastSummary.atencaoCount}
            </span>
            <span className="text-[9px] font-bold uppercase text-zinc-500 block mt-0.5">
              4 a 7 dias
            </span>
          </button>

          {/* Crítico */}
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="bg-red-50 border-2 border-zinc-900 p-2.5 rounded-xl text-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-red-100 transition-colors"
          >
            <div className="text-[10px] font-black uppercase text-red-800 tracking-wider flex items-center justify-center gap-1">
              <span>🔴 CRÍTICO</span>
            </div>
            <span className="font-display font-black text-2xl text-red-600 block mt-1 leading-none">
              {forecastSummary.criticoCount}
            </span>
            <span className="text-[9px] font-bold uppercase text-zinc-500 block mt-0.5">
              ≤ 3 dias / mín.
            </span>
          </button>
        </div>

        {/* Reposição Prioritária Sub-section */}
        <div className="pt-2 border-t-2 border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-red-600 stroke-[3]" />
              REPOSIÇÃO PRIORITÁRIA
            </h4>
            <span className="text-[9px] font-black uppercase text-zinc-400">
              Top {forecastSummary.priorityProducts.length} itens urgentes
            </span>
          </div>

          {forecastSummary.priorityProducts.length === 0 ? (
            <p className="text-xs font-bold text-zinc-400 py-2 text-center uppercase tracking-wide">
              Nenhum item requer reposição urgente no momento.
            </p>
          ) : (
            <div className="space-y-2">
              {forecastSummary.priorityProducts.map(({ product: p, forecast }) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="w-full bg-zinc-50 hover:bg-zinc-100 p-3 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none text-left transition-all flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-xs text-zinc-900 uppercase truncate">
                        {p.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-900 ${forecast.badgeClass}`}
                      >
                        {forecast.status === 'normal' && '🟢 NORMAL'}
                        {forecast.status === 'atencao' && '🟡 ATENÇÃO'}
                        {forecast.status === 'critico' && '🔴 CRÍTICO'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase">
                      <span className="font-black text-zinc-900">
                        {p.currentStock} {p.unit} restantes
                      </span>
                      <span>•</span>
                      <span className={forecast.status === 'critico' ? 'text-red-600 font-black' : 'text-zinc-700 font-bold'}>
                        {forecast.possuiDadosDeConsumo
                          ? forecast.textoPrevisao
                          : 'Previsão: dados insuficientes'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-red-600 font-black text-[10px] uppercase">
                    <span>Repor</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-400 border-3 border-zinc-900 p-4 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-zinc-900 stroke-[3]" />
              ATENÇÃO: ESTOQUE BAIXO
            </span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-[10px] font-black uppercase underline tracking-wider text-zinc-900"
            >
              VER TODOS
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {lowStockProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="bg-white px-3 py-2 rounded-xl border-2 border-zinc-900 text-left shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition-colors"
              >
                <div className="text-xs font-black text-zinc-900 uppercase truncate max-w-[140px]">
                  {p.name}
                </div>
                <div className="text-[10px] font-black text-red-600 uppercase">
                  APENAS {p.currentStock} {p.unit}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-black uppercase tracking-widest text-zinc-900">
            AÇÕES RÁPIDAS
          </h3>
          <button
            onClick={() => onNavigateTab('ai')}
            className="text-[10px] font-black uppercase text-red-600 flex items-center gap-1 hover:underline"
          >
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
            <span>ASSISTENTE IA</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onNavigateTab('new_product')}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar</span>
          </button>
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(220,38,38,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <BarChart3 className="w-4 h-4 text-red-400 stroke-[2.5]" />
            <span>Gráficos</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai')}
            className="p-2 bg-zinc-100 hover:bg-red-50 text-zinc-900 rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Sparkles className="w-4 h-4 text-red-600 stroke-[2.5]" />
            <span>IA</span>
          </button>
          <button
            onClick={() => onNavigateTab('history')}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <History className="w-4 h-4 stroke-[2.5]" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      {/* Recent Movements Timeline */}
      <div className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            ÚLTIMAS MOVIMENTAÇÕES
          </h3>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-black text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-0.5"
          >
            <span>VER TUDO</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {recentMovements.length === 0 ? (
          <p className="text-xs font-bold text-zinc-400 py-4 text-center uppercase tracking-wide">
            Nenhuma movimentação registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {recentMovements.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black border-2 border-zinc-900 shrink-0 ${
                      m.type === 'ENTRADA'
                        ? 'bg-emerald-400 text-zinc-900'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {m.type === 'ENTRADA' ? (
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-zinc-900 uppercase truncate max-w-[150px]">
                      {m.productName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                      {formatDateShort(m.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black uppercase block ${
                      m.type === 'ENTRADA' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {m.type === 'ENTRADA' ? '+' : '-'}{m.quantity}
                  </span>
                  <span className="text-[10px] font-mono font-black text-zinc-600 uppercase">
                    FIM: {m.finalStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
