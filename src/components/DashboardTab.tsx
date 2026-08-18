import React, { useState, useMemo } from 'react';
import { Product, Movement, DashboardPeriod, DashboardChartType, DashboardAnalysis } from '../types';
import { calculateStockForecast } from '../utils/stockForecast';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Percent,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

interface DashboardTabProps {
  products: Product[];
  movements: Movement[];
}

const STATUS_COLORS = {
  normal: '#10b981',   // Emerald / Verde
  atencao: '#f59e0b',  // Amber / Amarelo
  critico: '#dc2626',  // Red / Vermelho
};

const CATEGORY_PALETTE = [
  '#dc2626', // Vermelho
  '#18181b', // Preto / Zinco
  '#2563eb', // Azul
  '#16a34a', // Verde
  '#d97706', // Laranja / Âmbar
  '#7c3aed', // Roxo
  '#0891b2', // Ciano
  '#db2777', // Rosa
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  products,
  movements
}) => {
  const [period, setPeriod] = useState<DashboardPeriod>('30days');
  const [chartType, setChartType] = useState<DashboardChartType>('pie');
  const [analysis, setAnalysis] = useState<DashboardAnalysis>('status');

  // Filter movements by selected period
  const filteredMovements = useMemo(() => {
    if (period === 'all') return movements;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (period === 'today') {
      return movements.filter((m) => {
        const time = new Date(m.timestamp).getTime();
        return !isNaN(time) && time >= startOfToday;
      });
    }

    const days = period === '7days' ? 7 : 30;
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    return movements.filter((m) => {
      const time = new Date(m.timestamp).getTime();
      return !isNaN(time) && time >= cutoffTime;
    });
  }, [movements, period]);

  // Product status breakdown
  const statusAnalysis = useMemo(() => {
    let normal = 0;
    let atencao = 0;
    let critico = 0;

    products.forEach((p) => {
      const forecast = calculateStockForecast(p, movements);
      if (forecast.status === 'critico') critico++;
      else if (forecast.status === 'atencao') atencao++;
      else normal++;
    });

    const total = products.length || 1;
    const normalPct = Math.round((normal / total) * 100);
    const atencaoPct = Math.round((atencao / total) * 100);
    const criticoPct = Math.round((critico / total) * 100);

    return {
      normal,
      atencao,
      critico,
      normalPct,
      atencaoPct,
      criticoPct,
      total: products.length,
      data: [
        { name: 'Normal', value: normal, percentage: normalPct, color: STATUS_COLORS.normal },
        { name: 'Atenção', value: atencao, percentage: atencaoPct, color: STATUS_COLORS.atencao },
        { name: 'Crítico', value: critico, percentage: criticoPct, color: STATUS_COLORS.critico },
      ]
    };
  }, [products, movements]);

  // In / Out Movements in the period
  const inOutAnalysis = useMemo(() => {
    let totalEntradasQty = 0;
    let totalSaidasQty = 0;
    let countEntradas = 0;
    let countSaidas = 0;

    filteredMovements.forEach((m) => {
      if (m.type === 'ENTRADA') {
        countEntradas++;
        totalEntradasQty += m.quantity || 0;
      } else {
        countSaidas++;
        totalSaidasQty += m.quantity || 0;
      }
    });

    const totalQty = totalEntradasQty + totalSaidasQty || 1;
    const totalOps = countEntradas + countSaidas || 1;
    const entradaQtyPct = Math.round((totalEntradasQty / totalQty) * 100);
    const saidaQtyPct = Math.round((totalSaidasQty / totalQty) * 100);

    return {
      totalEntradasQty,
      totalSaidasQty,
      countEntradas,
      countSaidas,
      entradaQtyPct,
      saidaQtyPct,
      data: [
        { name: 'Entradas', value: totalEntradasQty, operacoes: countEntradas, percentage: entradaQtyPct, color: '#10b981' },
        { name: 'Saídas', value: totalSaidasQty, operacoes: countSaidas, percentage: saidaQtyPct, color: '#dc2626' },
      ]
    };
  }, [filteredMovements]);

  // Top Most Active Products
  const topProductsAnalysis = useMemo(() => {
    const map = new Map<string, { product: Product; totalQty: number; entradasQty: number; saidasQty: number }>();

    filteredMovements.forEach((m) => {
      const prod = products.find((p) => p.id === m.productId || p.code === m.productCode);
      const key = m.productId || m.productCode;
      const current = map.get(key) || {
        product: prod || {
          id: key,
          code: m.productCode,
          name: m.productName,
          category: 'Geral',
          currentStock: 0,
          minStock: 0,
          unit: 'un',
          createdAt: '',
          updatedAt: ''
        },
        totalQty: 0,
        entradasQty: 0,
        saidasQty: 0
      };

      current.totalQty += m.quantity || 0;
      if (m.type === 'ENTRADA') {
        current.entradasQty += m.quantity || 0;
      } else {
        current.saidasQty += m.quantity || 0;
      }

      map.set(key, current);
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
    const top5 = sorted.slice(0, 5);
    const totalTopQty = top5.reduce((sum, item) => sum + item.totalQty, 0) || 1;

    const data = top5.map((item, idx) => ({
      name: item.product.name.length > 14 ? item.product.name.substring(0, 12) + '...' : item.product.name,
      fullName: item.product.name,
      code: item.product.code,
      value: item.totalQty,
      entradas: item.entradasQty,
      saidas: item.saidasQty,
      percentage: Math.round((item.totalQty / totalTopQty) * 100),
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
    }));

    return {
      top5,
      data,
      totalVolume: totalTopQty
    };
  }, [filteredMovements, products]);

  // Category Distribution
  const categoryAnalysis = useMemo(() => {
    const map = new Map<string, { count: number; stock: number }>();

    products.forEach((p) => {
      const cat = p.category || 'Outros';
      const cur = map.get(cat) || { count: 0, stock: 0 };
      cur.count += 1;
      cur.stock += p.currentStock || 0;
      map.set(cat, cur);
    });

    const totalStock = products.reduce((acc, p) => acc + (p.currentStock || 0), 0) || 1;
    const sorted = Array.from(map.entries()).sort((a, b) => b[1].stock - a[1].stock);

    const data = sorted.map(([category, info], idx) => ({
      name: category,
      value: info.stock,
      produtos: info.count,
      percentage: Math.round((info.stock / totalStock) * 100),
      color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length]
    }));

    return {
      totalStock,
      categoriesCount: sorted.length,
      data
    };
  }, [products]);

  // Timeline / Evolution analysis
  const timelineAnalysis = useMemo(() => {
    const dayMap = new Map<string, { date: string; displayDate: string; entradas: number; saidas: number; total: number }>();

    // Sort movements chronologically
    const sorted = [...filteredMovements].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    sorted.forEach((m) => {
      const d = new Date(m.timestamp);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

      const cur = dayMap.get(key) || {
        date: key,
        displayDate,
        entradas: 0,
        saidas: 0,
        total: 0
      };

      if (m.type === 'ENTRADA') {
        cur.entradas += m.quantity || 0;
      } else {
        cur.saidas += m.quantity || 0;
      }
      cur.total += m.quantity || 0;

      dayMap.set(key, cur);
    });

    const data = Array.from(dayMap.values());

    return {
      data,
      totalPoints: data.length
    };
  }, [filteredMovements]);

  // Custom Neo-Brutalist Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-zinc-900 text-white p-3 rounded-xl border-2 border-zinc-900 shadow-[4px_4px_0px_rgba(220,38,38,1)] text-xs space-y-1">
        <p className="font-display font-black text-xs uppercase text-zinc-200 border-b border-zinc-700 pb-1">
          {label || payload[0]?.name || payload[0]?.payload?.fullName || 'Dados'}
        </p>
        {payload.map((entry: any, index: number) => {
          const isPercentage = entry.payload?.percentage !== undefined;
          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill || '#fff' }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.fill || '#fff' }} />
                <span className="uppercase">{entry.name || 'Quantidade'}:</span>
              </span>
              <span className="font-black text-white">
                {entry.value} un {isPercentage ? `(${entry.payload.percentage}%)` : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="bg-white p-4 rounded-3xl border-3 border-zinc-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(220,38,38,1)]">
              <BarChart3 className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block">
                ANÁLISE E INDICADORES
              </span>
              <h1 className="font-display font-black text-zinc-900 text-lg uppercase tracking-tight leading-none">
                DASHBOARD INTERATIVO
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 px-2 py-1 rounded-xl border border-zinc-900 text-[10px] font-black text-zinc-800">
            <Sparkles className="w-3 h-3 text-red-600" />
            <span>AO VIVO</span>
          </div>
        </div>

        <p className="text-[11px] font-bold text-zinc-600 leading-snug">
          Acompanhe o desempenho do inventário com gráficos dinâmicos de status, fluxo de entradas e saídas e categorias.
        </p>
      </div>

      {/* 1. RESUMO SUPERIOR - 6 Cards de Indicadores */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
            RESUMO GERAL DO SISTEMA
          </span>
          <span className="text-[9px] font-black text-zinc-500 uppercase">
            {products.length} itens cadastrados
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Total Produtos */}
          <div className="bg-white p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <span className="text-[9px] font-black text-zinc-500 uppercase block tracking-wider">
              TOTAL PROD.
            </span>
            <span className="font-display font-black text-2xl text-zinc-900 leading-none block mt-1">
              {products.length}
            </span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase block mt-0.5">
              100% catalogo
            </span>
          </div>

          {/* Normal */}
          <div className="bg-emerald-50 p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[9px] font-black text-emerald-800 uppercase flex items-center justify-center gap-1 tracking-wider">
              <span>🟢 NORMAL</span>
            </div>
            <span className="font-display font-black text-2xl text-emerald-950 leading-none block mt-1">
              {statusAnalysis.normal}
            </span>
            <span className="text-[9px] font-black text-emerald-700 block mt-0.5">
              {statusAnalysis.normalPct}% do estoque
            </span>
          </div>

          {/* Atenção */}
          <div className="bg-amber-50 p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[9px] font-black text-amber-800 uppercase flex items-center justify-center gap-1 tracking-wider">
              <span>🟡 ATENÇÃO</span>
            </div>
            <span className="font-display font-black text-2xl text-amber-950 leading-none block mt-1">
              {statusAnalysis.atencao}
            </span>
            <span className="text-[9px] font-black text-amber-700 block mt-0.5">
              {statusAnalysis.atencaoPct}% do estoque
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Crítico */}
          <div className="bg-red-50 p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[9px] font-black text-red-700 uppercase flex items-center justify-center gap-1 tracking-wider">
              <span>🔴 CRÍTICO</span>
            </div>
            <span className="font-display font-black text-2xl text-red-600 leading-none block mt-1">
              {statusAnalysis.critico}
            </span>
            <span className="text-[9px] font-black text-red-600 block mt-0.5">
              {statusAnalysis.criticoPct}% do estoque
            </span>
          </div>

          {/* Entradas */}
          <div className="bg-white p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[9px] font-black text-zinc-700 uppercase flex items-center justify-center gap-0.5 tracking-wider">
              <ArrowUpRight className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>ENTRADAS</span>
            </div>
            <span className="font-display font-black text-xl text-zinc-900 leading-none block mt-1">
              {inOutAnalysis.totalEntradasQty}
            </span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase block mt-0.5">
              {inOutAnalysis.countEntradas} registros
            </span>
          </div>

          {/* Saídas */}
          <div className="bg-white p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-[9px] font-black text-zinc-700 uppercase flex items-center justify-center gap-0.5 tracking-wider">
              <ArrowDownRight className="w-3 h-3 text-red-600 stroke-[3]" />
              <span>SAÍDAS</span>
            </div>
            <span className="font-display font-black text-xl text-zinc-900 leading-none block mt-1">
              {inOutAnalysis.totalSaidasQty}
            </span>
            <span className="text-[8px] font-bold text-zinc-500 uppercase block mt-0.5">
              {inOutAnalysis.countSaidas} registros
            </span>
          </div>
        </div>
      </div>

      {/* 2 & 3 & 4 & 5. PAINEL DE CONTROLE DOS GRÁFICOS */}
      <div className="bg-white p-4 rounded-3xl border-3 border-zinc-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
        
        {/* FILTRO DE PERÍODO */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
            Período de Análise
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'today' as DashboardPeriod, label: 'Hoje' },
              { id: '7days' as DashboardPeriod, label: '7 Dias' },
              { id: '30days' as DashboardPeriod, label: '30 Dias' },
              { id: 'all' as DashboardPeriod, label: 'Tudo' },
            ].map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition-all border-2 text-center whitespace-nowrap ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(220,38,38,1)]'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-900'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SELETOR DE ANÁLISE (CONTEÚDO) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
            Conteúdo da Análise
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'status' as DashboardAnalysis, label: 'Status do Estoque', desc: 'Normal x Atenção x Crítico' },
              { id: 'in_out' as DashboardAnalysis, label: 'Entradas x Saídas', desc: 'Volume de operações' },
              { id: 'top_products' as DashboardAnalysis, label: 'Mais Movimentados', desc: 'Top 5 produtos' },
              { id: 'categories' as DashboardAnalysis, label: 'Por Categoria', desc: 'Distribuição em estoque' },
              { id: 'timeline' as DashboardAnalysis, label: 'Linha do Tempo', desc: 'Evolução por data' },
            ].map((a) => {
              const active = analysis === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAnalysis(a.id)}
                  className={`p-2.5 rounded-2xl text-left border-2 transition-all ${
                    active
                      ? 'bg-red-600 text-white border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                      : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-900'
                  } ${a.id === 'timeline' ? 'col-span-2' : ''}`}
                >
                  <span className="font-display font-black text-xs uppercase block leading-tight">
                    {a.label}
                  </span>
                  <span className={`text-[9px] font-bold block mt-0.5 ${active ? 'text-red-100' : 'text-zinc-500'}`}>
                    {a.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELETOR DE TIPO DE GRÁFICO (PIZZA / BARRAS / LINHA) */}
        <div className="space-y-1.5 pt-2 border-t-2 border-zinc-100">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
              Formato de Visualização
            </label>
            <span className="text-[9px] font-bold text-zinc-400 uppercase">
              Tipo do gráfico
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pie' as DashboardChartType, label: 'Pizza / Rosca', icon: PieChartIcon },
              { id: 'bar' as DashboardChartType, label: 'Barras', icon: BarChart3 },
              { id: 'line' as DashboardChartType, label: 'Linha', icon: LineChartIcon },
            ].map((ct) => {
              const Icon = ct.icon;
              const active = chartType === ct.id;
              return (
                <button
                  key={ct.id}
                  onClick={() => setChartType(ct.id)}
                  className={`py-2.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-[3px_3px_0px_rgba(220,38,38,1)]'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:border-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-red-400 stroke-[2.5]' : 'text-zinc-600 stroke-[2]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ÁREA DO GRÁFICO PRINCIPAL INTERATIVO */}
      <div className="bg-white p-4 rounded-3xl border-3 border-zinc-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
        {/* Header do Gráfico */}
        <div className="flex items-center justify-between border-b-2 border-zinc-100 pb-2">
          <div>
            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block">
              VISUALIZAÇÃO EM {chartType === 'pie' ? 'PIZZA' : chartType === 'bar' ? 'BARRAS' : 'LINHA'}
            </span>
            <h3 className="font-display font-black text-zinc-900 text-base uppercase leading-tight">
              {analysis === 'status' && 'Distribuição de Status do Estoque'}
              {analysis === 'in_out' && 'Comparativo: Entradas x Saídas'}
              {analysis === 'top_products' && 'Top 5 Produtos Mais Movimentados'}
              {analysis === 'categories' && 'Volume de Estoque por Categoria'}
              {analysis === 'timeline' && 'Evolução de Movimentações por Período'}
            </h3>
          </div>
        </div>

        {/* Renderização do Gráfico */}
        <div className="w-full h-64 flex items-center justify-center bg-zinc-50 rounded-2xl border-2 border-zinc-900 p-2">
          {/* 1. STATUS DO ESTOQUE */}
          {analysis === 'status' && (
            <>
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(val) => <span className="text-[11px] font-black uppercase text-zinc-900">{val}</span>}
                    />
                    <Pie
                      data={statusAnalysis.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      label={({ name, percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {statusAnalysis.data.map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}

              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusAnalysis.data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#18181b' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Produtos" radius={[6, 6, 0, 0]}>
                      {statusAnalysis.data.map((entry, index) => (
                        <Cell key={`bar-cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statusAnalysis.data} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#18181b' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Quantidade"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {/* 2. ENTRADAS X SAÍDAS */}
          {analysis === 'in_out' && (
            <>
              {inOutAnalysis.totalEntradasQty === 0 && inOutAnalysis.totalSaidasQty === 0 ? (
                <div className="text-center p-4">
                  <AlertOctagon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Nenhuma movimentação registrada neste período.
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                    Altere o filtro para "30 Dias" ou "Tudo".
                  </p>
                </div>
              ) : (
                <>
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(val) => <span className="text-[11px] font-black uppercase text-zinc-900">{val}</span>}
                        />
                        <Pie
                          data={inOutAnalysis.data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={4}
                          label={({ name, percentage }) => `${percentage}%`}
                          labelLine={false}
                        >
                          {inOutAnalysis.data.map((entry, index) => (
                            <Cell key={`inout-cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inOutAnalysis.data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#18181b' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Unidades" radius={[6, 6, 0, 0]}>
                          {inOutAnalysis.data.map((entry, index) => (
                            <Cell key={`bar-inout-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={inOutAnalysis.data} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900, fill: '#18181b' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Volume (un)"
                          stroke="#18181b"
                          strokeWidth={3}
                          dot={{ r: 6, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </>
          )}

          {/* 3. PRODUTOS MAIS MOVIMENTADOS */}
          {analysis === 'top_products' && (
            <>
              {topProductsAnalysis.data.length === 0 ? (
                <div className="text-center p-4">
                  <AlertOctagon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Sem histórico de movimentações no período.
                  </p>
                </div>
              ) : (
                <>
                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(val) => <span className="text-[10px] font-black uppercase text-zinc-900">{val}</span>}
                        />
                        <Pie
                          data={topProductsAnalysis.data}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          paddingAngle={3}
                          label={({ percentage }) => `${percentage}%`}
                          labelLine={false}
                        >
                          {topProductsAnalysis.data.map((entry, index) => (
                            <Cell key={`top-pie-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsAnalysis.data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis type="number" tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fontWeight: 900, fill: '#18181b' }} width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" name="Volume Total" radius={[0, 6, 6, 0]}>
                          {topProductsAnalysis.data.map((entry, index) => (
                            <Cell key={`top-bar-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={topProductsAnalysis.data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 900, fill: '#18181b' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Movimentações"
                          stroke="#dc2626"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </>
          )}

          {/* 4. ESTOQUE POR CATEGORIA */}
          {analysis === 'categories' && (
            <>
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(val) => <span className="text-[10px] font-black uppercase text-zinc-900">{val}</span>}
                    />
                    <Pie
                      data={categoryAnalysis.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      paddingAngle={3}
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {categoryAnalysis.data.map((entry, index) => (
                        <Cell key={`cat-pie-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}

              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryAnalysis.data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 900, fill: '#18181b' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Estoque Total (un)" radius={[6, 6, 0, 0]}>
                      {categoryAnalysis.data.map((entry, index) => (
                        <Cell key={`cat-bar-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryAnalysis.data} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 900, fill: '#18181b' }} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Estoque (un)"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#18181b', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {/* 5. LINHA DO TEMPO / EVOLUÇÃO DAS MOVIMENTAÇÕES */}
          {analysis === 'timeline' && (
            <>
              {timelineAnalysis.data.length === 0 ? (
                <div className="text-center p-4">
                  <AlertOctagon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs font-black uppercase text-zinc-600">
                    Sem registros temporais para o período selecionado.
                  </p>
                </div>
              ) : (
                <>
                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineAnalysis.data} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 10, fontWeight: 900, fill: '#18181b' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(val) => <span className="text-[10px] font-black uppercase text-zinc-900">{val}</span>}
                        />
                        <Line
                          type="monotone"
                          dataKey="entradas"
                          name="Entradas"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#fff' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="saidas"
                          name="Saídas"
                          stroke="#dc2626"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#dc2626', strokeWidth: 1.5, stroke: '#fff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timelineAnalysis.data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 9, fontWeight: 900, fill: '#18181b' }} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#71717a' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(val) => <span className="text-[10px] font-black uppercase text-zinc-900">{val}</span>}
                        />
                        <Bar dataKey="entradas" name="Entradas" fill="#10b981" stroke="#18181b" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="saidas" name="Saídas" fill="#dc2626" stroke="#18181b" strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'pie' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(val) => <span className="text-[10px] font-black uppercase text-zinc-900">{val}</span>}
                        />
                        <Pie
                          data={[
                            { name: 'Entradas no Período', value: inOutAnalysis.totalEntradasQty, percentage: inOutAnalysis.entradaQtyPct, color: '#10b981' },
                            { name: 'Saídas no Período', value: inOutAnalysis.totalSaidasQty, percentage: inOutAnalysis.saidaQtyPct, color: '#dc2626' },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={4}
                          label={({ percentage }) => `${percentage}%`}
                          labelLine={false}
                        >
                          <Cell fill="#10b981" stroke="#18181b" strokeWidth={2} />
                          <Cell fill="#dc2626" stroke="#18181b" strokeWidth={2} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* 7. DETALHAMENTO COM PERCENTAGENS E PROPORÇÕES */}
        <div className="bg-zinc-50 p-3.5 rounded-2xl border-2 border-zinc-900 space-y-2.5">
          <div className="flex items-center justify-between border-b-2 border-zinc-900/10 pb-1.5">
            <span className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
              INDICADORES & PROPORÇÕES DETALHADAS
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-400">
              AUDITADO
            </span>
          </div>

          {analysis === 'status' && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-100/70 border border-emerald-300">
                <span className="font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Status Normal (Estoque Seguro):
                </span>
                <span className="font-display font-black text-emerald-950">
                  {statusAnalysis.normal} ({statusAnalysis.normalPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-100/70 border border-amber-300">
                <span className="font-bold text-amber-950 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Status Atenção (4 a 7 dias):
                </span>
                <span className="font-display font-black text-amber-950">
                  {statusAnalysis.atencao} ({statusAnalysis.atencaoPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-red-100/70 border border-red-300">
                <span className="font-bold text-red-950 uppercase flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  Status Crítico (Reposição Urgente):
                </span>
                <span className="font-display font-black text-red-700">
                  {statusAnalysis.critico} ({statusAnalysis.criticoPct}%)
                </span>
              </div>
            </div>
          )}

          {analysis === 'in_out' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300">
                <span className="text-[9px] font-black text-emerald-800 uppercase block">
                  Volume de Entrada
                </span>
                <span className="font-display font-black text-lg text-emerald-950 block">
                  {inOutAnalysis.totalEntradasQty} un
                </span>
                <span className="text-[9px] font-bold text-emerald-700 block mt-0.5">
                  Proporção: {inOutAnalysis.entradaQtyPct}% do fluxo
                </span>
              </div>

              <div className="p-2.5 bg-red-50 rounded-xl border border-red-300">
                <span className="text-[9px] font-black text-red-800 uppercase block">
                  Volume de Saída
                </span>
                <span className="font-display font-black text-lg text-red-700 block">
                  {inOutAnalysis.totalSaidasQty} un
                </span>
                <span className="text-[9px] font-bold text-red-600 block mt-0.5">
                  Proporção: {inOutAnalysis.saidaQtyPct}% do fluxo
                </span>
              </div>
            </div>
          )}

          {analysis === 'top_products' && (
            <div className="space-y-1.5">
              {topProductsAnalysis.data.slice(0, 4).map((item, idx) => (
                <div
                  key={`top-detail-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-display font-black text-zinc-900 uppercase block leading-tight">
                        {item.fullName}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold">
                        {item.code}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-zinc-900 block text-xs">
                      {item.value} un
                    </span>
                    <span className="text-[9px] font-bold text-red-600 uppercase">
                      {item.percentage}% do top 5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysis === 'categories' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categoryAnalysis.data.slice(0, 4).map((cat, idx) => (
                <div key={`cat-detail-${idx}`} className="p-2 rounded-xl bg-white border border-zinc-200">
                  <span className="text-[9px] font-black text-zinc-500 uppercase block">
                    {cat.name}
                  </span>
                  <span className="font-display font-black text-zinc-900 text-sm block">
                    {cat.value} un ({cat.percentage}%)
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase block mt-0.5">
                    {cat.produtos} produtos
                  </span>
                </div>
              ))}
            </div>
          )}

          {analysis === 'timeline' && (
            <div className="p-2 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700 font-bold space-y-1">
              <p>
                📊 <strong>Total de datas analisadas:</strong> {timelineAnalysis.totalPoints} dias com movimentações registradas.
              </p>
              <p>
                🔄 <strong>Balanço operacional do período:</strong> {inOutAnalysis.totalEntradasQty} entradas versus {inOutAnalysis.totalSaidasQty} saídas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
