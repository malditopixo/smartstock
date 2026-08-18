import React, { useMemo } from 'react';
import { parseAIResponse, AIParsedResponse, AIProductCard, AISection, AIMetricItem, AIMovementItem } from '../utils/aiResponseParser';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  MapPin,
  Tag,
  ShieldAlert,
  Zap,
  TrendingUp,
  Compass
} from 'lucide-react';

interface AIResponseViewerProps {
  rawResponse: string;
}

export const AIResponseViewer: React.FC<AIResponseViewerProps> = ({ rawResponse }) => {
  const parsed: AIParsedResponse = useMemo(() => {
    return parseAIResponse(rawResponse);
  }, [rawResponse]);

  return (
    <div className="space-y-4">
      {/* 1. Introductory Summary (if present) */}
      {parsed.intro && (
        <div className="p-3.5 bg-zinc-900 text-white rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(220,38,38,1)] flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </div>
          <div className="space-y-0.5 flex-1">
            <span className="text-[9px] font-black uppercase text-red-400 tracking-wider block">
              RESUMO DA INTELIGÊNCIA ARTIFICIAL:
            </span>
            <p className="text-xs font-bold leading-relaxed text-zinc-100">
              {parsed.intro}
            </p>
          </div>
        </div>
      )}

      {/* 2. Structured Sections */}
      {parsed.sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
    </div>
  );
};

interface SectionViewProps {
  section: AISection;
}

const SectionView: React.FC<SectionViewProps> = ({ section }) => {
  const getSectionBadge = () => {
    switch (section.severity) {
      case 'critical':
        return {
          bg: 'bg-red-600 text-white',
          border: 'border-red-600',
          icon: ShieldAlert,
          label: 'CRÍTICO'
        };
      case 'warning':
        return {
          bg: 'bg-amber-400 text-zinc-900',
          border: 'border-amber-500',
          icon: AlertTriangle,
          label: 'ATENÇÃO'
        };
      case 'normal':
        return {
          bg: 'bg-emerald-500 text-white',
          border: 'border-emerald-600',
          icon: CheckCircle2,
          label: 'NORMAL'
        };
      default:
        return {
          bg: 'bg-zinc-900 text-white',
          border: 'border-zinc-900',
          icon: Compass,
          label: 'ANÁLISE'
        };
    }
  };

  const badge = getSectionBadge();
  const Icon = badge.icon;

  return (
    <div className="space-y-2.5">
      {/* Section Title Header */}
      {section.title && (
        <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md ${badge.bg} flex items-center justify-center`}>
              <Icon className="w-3 h-3 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-xs uppercase tracking-tight text-zinc-900">
              {section.title}
            </h3>
          </div>
          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-zinc-900 ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      )}

      {/* Metrics Grid (if any) */}
      {section.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {section.metrics.map((m, idx) => (
            <MetricCard key={idx} metric={m} />
          ))}
        </div>
      )}

      {/* Product Cards List (if any) */}
      {section.productCards.length > 0 && (
        <div className="space-y-2">
          {section.productCards.map((product, idx) => (
            <ProductCardItem key={idx} card={product} />
          ))}
        </div>
      )}

      {/* Movements Items List (if any) */}
      {section.movements.length > 0 && (
        <div className="space-y-1.5">
          {section.movements.map((movement, idx) => (
            <MovementCardItem key={idx} movement={movement} />
          ))}
        </div>
      )}

      {/* Plain Paragraphs / Explanations (if any) */}
      {section.paragraphs.length > 0 && (
        <div className="space-y-1.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 leading-relaxed">
          {section.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* Concluding Recommendation Box (if any) */}
      {section.recommendation && (
        <div
          className={`p-3 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-start gap-2.5 ${
            section.recommendation.severity === 'critical'
              ? 'bg-red-50 text-red-950'
              : section.recommendation.severity === 'warning'
              ? 'bg-amber-50 text-amber-950'
              : 'bg-emerald-50 text-emerald-950'
          }`}
        >
          <Zap
            className={`w-4 h-4 mt-0.5 shrink-0 stroke-[3] ${
              section.recommendation.severity === 'critical'
                ? 'text-red-600'
                : section.recommendation.severity === 'warning'
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          />
          <div className="space-y-0.5 flex-1">
            <span className="text-[9px] font-black uppercase tracking-wider block">
              {section.recommendation.title}:
            </span>
            <p className="text-xs font-bold leading-snug">
              {section.recommendation.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductCardItemProps {
  card: AIProductCard;
}

const ProductCardItem: React.FC<ProductCardItemProps> = ({ card }) => {
  const getStyle = () => {
    switch (card.severity) {
      case 'critical':
        return {
          cardBg: 'bg-red-50/80 hover:bg-red-50',
          borderColor: 'border-red-600',
          badgeBg: 'bg-red-600 text-white',
          stockText: 'text-red-600 font-black',
          badgeText: 'ESTOQUE CRÍTICO / ZERADO'
        };
      case 'warning':
        return {
          cardBg: 'bg-amber-50/80 hover:bg-amber-50',
          borderColor: 'border-amber-500',
          badgeBg: 'bg-amber-400 text-zinc-900',
          stockText: 'text-amber-700 font-black',
          badgeText: 'ESTOQUE BAIXO / ALERTA'
        };
      case 'normal':
        return {
          cardBg: 'bg-emerald-50/80 hover:bg-emerald-50',
          borderColor: 'border-emerald-500',
          badgeBg: 'bg-emerald-500 text-white',
          stockText: 'text-emerald-700 font-black',
          badgeText: 'ESTOQUE REGULAR'
        };
      default:
        return {
          cardBg: 'bg-zinc-50 hover:bg-zinc-100',
          borderColor: 'border-zinc-900',
          badgeBg: 'bg-zinc-900 text-white',
          stockText: 'text-zinc-900 font-black',
          badgeText: 'PRODUTO'
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`p-3 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] ${style.cardBg} space-y-2 transition-all`}
    >
      {/* Top bar: Name, Code and Severity Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display font-black text-xs uppercase text-zinc-900 leading-tight">
              {card.name}
            </span>
            {card.code && (
              <span className="bg-white border border-zinc-900 px-1.5 py-0.2 text-[9px] font-mono font-black text-zinc-900 rounded">
                {card.code}
              </span>
            )}
          </div>

          {/* Tags for location or category */}
          {(card.location || card.category) && (
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500">
              {card.category && (
                <span className="flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5" />
                  {card.category}
                </span>
              )}
              {card.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {card.location}
                </span>
              )}
            </div>
          )}
        </div>

        <span
          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-zinc-900 shrink-0 whitespace-nowrap ${style.badgeBg}`}
        >
          {card.priority || style.badgeText}
        </span>
      </div>

      {/* Grid of Key Info: Estoque Atual, Estoque Mínimo, Status, Recomendação */}
      <div className="grid grid-cols-2 gap-1.5 bg-white/80 p-2.5 rounded-xl border border-zinc-900/10 text-xs">
        {/* Estoque Atual */}
        <div>
          <span className="text-[8px] font-black uppercase text-zinc-400 block tracking-wider">
            ESTOQUE ATUAL
          </span>
          <span className={`font-display text-sm leading-none block mt-0.5 ${style.stockText}`}>
            {card.currentStock || '0 un'}
          </span>
        </div>

        {/* Estoque Mínimo */}
        <div>
          <span className="text-[8px] font-black uppercase text-zinc-400 block tracking-wider">
            ESTOQUE MÍNIMO
          </span>
          <span className="font-display font-black text-sm text-zinc-800 leading-none block mt-0.5">
            {card.minStock || 'N/A'}
          </span>
        </div>

        {/* Status */}
        {card.status && (
          <div className="col-span-2 pt-1 border-t border-zinc-100 flex items-center justify-between text-[10px]">
            <span className="font-bold text-zinc-500 uppercase">Situação:</span>
            <span className="font-black text-zinc-900 uppercase">
              {card.status}
            </span>
          </div>
        )}

        {/* Recomendação */}
        {card.recommendation && (
          <div className="col-span-2 pt-1 border-t border-zinc-100 flex items-start justify-between text-[10px] gap-1">
            <span className="font-bold text-zinc-500 uppercase shrink-0">Recomendação:</span>
            <span className="font-black text-red-600 uppercase text-right">
              {card.recommendation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  metric: AIMetricItem;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  return (
    <div className="p-2.5 bg-white rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block leading-tight">
        {metric.label}
      </span>
      <span className="font-display font-black text-lg text-zinc-900 leading-tight mt-1">
        {metric.value}
      </span>
    </div>
  );
};

interface MovementCardItemProps {
  movement: AIMovementItem;
}

const MovementCardItem: React.FC<MovementCardItemProps> = ({ movement }) => {
  const isEntrada = movement.type === 'ENTRADA';

  return (
    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black border border-zinc-900 ${
            isEntrada ? 'bg-emerald-400 text-zinc-900' : 'bg-red-600 text-white'
          }`}
        >
          {isEntrada ? (
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
          )}
        </div>

        <div>
          <span className="font-display font-black text-zinc-900 uppercase block leading-tight">
            {movement.productName}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase">
            {movement.productCode && <span>{movement.productCode}</span>}
            {movement.date && <span>• {movement.date}</span>}
          </div>
        </div>
      </div>

      <div className="text-right">
        <span
          className={`font-display font-black text-xs block ${
            isEntrada ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {isEntrada ? `+${movement.quantity}` : `-${movement.quantity}`}
        </span>
        <span className="text-[8px] font-black uppercase text-zinc-400">
          {movement.type}
        </span>
      </div>
    </div>
  );
};
