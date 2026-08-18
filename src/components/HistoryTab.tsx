import React, { useState, useMemo } from 'react';
import { Movement } from '../types';
import { formatDate, formatDateTimeParts } from '../utils/formatters';
import {
  History as HistoryIcon,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  User,
  FileText,
  Filter,
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface HistoryTabProps {
  movements: Movement[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ENTRADA' | 'SAIDA'>('ALL');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        m.productName.toLowerCase().includes(searchLower) ||
        m.productCode.toLowerCase().includes(searchLower) ||
        (m.operator && m.operator.toLowerCase().includes(searchLower)) ||
        (m.note && m.note.toLowerCase().includes(searchLower));

      const matchesType = typeFilter === 'ALL' || m.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [movements, searchTerm, typeFilter]);

  return (
    <div className="space-y-4 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="bg-white p-3.5 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <HistoryIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-black text-sm text-zinc-900 uppercase tracking-tight leading-tight">
                HISTÓRICO & RASTREABILIDADE
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Auditoria de Operadores e Movimentações
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white border-2 border-zinc-900 px-2.5 py-1 rounded-md">
            {filteredMovements.length} {filteredMovements.length === 1 ? 'REGISTRO' : 'REGISTROS'}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-900 stroke-[3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PRODUTO, OPERADOR, CÓDIGO OU NOTA..."
            className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl pl-9 pr-3 py-2 text-xs font-black uppercase text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white transition-all"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="grid grid-cols-3 gap-2 text-xs font-black pt-1 border-t-2 border-zinc-900">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`py-2 rounded-xl uppercase tracking-wider text-[11px] text-center border-2 border-zinc-900 transition-all ${
              typeFilter === 'ALL'
                ? 'bg-zinc-900 text-white shadow-[2px_2px_0px_rgba(220,38,38,1)]'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            TODAS ({movements.length})
          </button>
          <button
            onClick={() => setTypeFilter('ENTRADA')}
            className={`py-2 rounded-xl uppercase tracking-wider text-[11px] text-center border-2 border-zinc-900 transition-all flex items-center justify-center gap-1 ${
              typeFilter === 'ENTRADA'
                ? 'bg-emerald-400 text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            <span>ENTRADAS</span>
          </button>
          <button
            onClick={() => setTypeFilter('SAIDA')}
            className={`py-2 rounded-xl uppercase tracking-wider text-[11px] text-center border-2 border-zinc-900 transition-all flex items-center justify-center gap-1 ${
              typeFilter === 'SAIDA'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-red-600 hover:bg-red-50'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
            <span>SAÍDAS</span>
          </button>
        </div>
      </div>

      {/* Movement Feed */}
      {filteredMovements.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center space-y-2">
          <HistoryIcon className="w-10 h-10 text-zinc-300 mx-auto stroke-[2]" />
          <h3 className="font-display font-black text-zinc-900 text-sm uppercase">
            Nenhuma movimentação encontrada
          </h3>
          <p className="text-xs text-zinc-500 font-bold uppercase">
            Não existem registros para os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMovements.map((m) => {
            const isEntrada = m.type === 'ENTRADA';
            const dt = formatDateTimeParts(m.timestamp);

            return (
              <div
                key={m.id}
                className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3"
              >
                {/* Header of Card: Operator Name & Timestamp */}
                <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-900/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-black border border-zinc-900">
                      👤
                    </span>
                    <span className="font-display font-black text-xs text-zinc-900 uppercase tracking-tight">
                      {m.operator || 'OPERADOR'}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-600 font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-900 stroke-[2.5]" />
                    {dt.full}
                  </span>
                </div>

                {/* Operation Pill & Product Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border-2 border-zinc-900 flex items-center gap-1 ${
                        isEntrada
                          ? 'bg-emerald-400 text-zinc-900'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {isEntrada ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      {m.type} • {m.quantity} UN
                    </span>

                    <span className="font-mono text-[10px] font-black text-zinc-900 bg-zinc-100 border border-zinc-900 px-1.5 py-0.5 rounded uppercase">
                      {m.productCode}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-zinc-900 text-base uppercase leading-snug">
                    {m.productName}
                  </h3>
                </div>

                {/* Stock Transition: Previous -> Final */}
                <div className="bg-zinc-100 p-2.5 rounded-xl border-2 border-zinc-900 flex items-center justify-between text-xs">
                  <div className="text-left">
                    <span className="text-[9px] text-zinc-500 font-black block uppercase tracking-wider">
                      ANTERIOR
                    </span>
                    <span className="font-display font-black text-zinc-900 text-sm">
                      {m.previousStock} un
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-black text-zinc-400">
                    <ArrowRight className="w-4 h-4 stroke-[3] text-zinc-900" />
                    <span
                      className={`font-display font-black text-xs uppercase px-2 py-0.5 rounded border border-zinc-900 ${
                        isEntrada
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isEntrada ? '+' : '-'}{m.quantity}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[3] text-zinc-900" />
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 font-black block uppercase tracking-wider">
                      FINAL
                    </span>
                    <span className="font-display font-black text-zinc-900 text-sm">
                      {m.finalStock} un
                    </span>
                  </div>
                </div>

                {/* Dedicated RASTREABILIDADE Block */}
                <div className="bg-zinc-50 p-3 rounded-xl border-2 border-zinc-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b-2 border-zinc-900/10 pb-1">
                    <div className="flex items-center gap-1.5 font-black uppercase text-zinc-900 text-[10px] tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                      <span>RASTREABILIDADE</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                      ID: {m.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-bold">
                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">
                        Operador:
                      </span>
                      <span className="text-zinc-900 font-black uppercase">
                        {m.operator || 'Operador'}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">
                        Operação:
                      </span>
                      <span
                        className={`font-black uppercase ${
                          isEntrada ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {isEntrada ? 'Entrada' : 'Saída'} ({m.quantity} un)
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">
                        Data:
                      </span>
                      <span className="text-zinc-900 font-black">
                        {dt.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 font-bold uppercase text-[9px] block">
                        Horário:
                      </span>
                      <span className="text-zinc-900 font-black">
                        {dt.time}
                      </span>
                    </div>
                  </div>

                  {m.note && (
                    <div className="pt-1.5 border-t border-zinc-200 text-[10px] text-zinc-600 font-medium flex items-start gap-1">
                      <FileText className="w-3 h-3 text-zinc-400 stroke-[2.5] shrink-0 mt-0.5" />
                      <span className="italic">Nota: "{m.note}"</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
