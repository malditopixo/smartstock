import React, { useState, useEffect } from 'react';
import { Operator } from '../types';
import { User, ShieldCheck, Check, Sparkles, X, Briefcase } from 'lucide-react';
import { InvenTechLogoSymbol } from './Logo';

interface OperatorModalProps {
  isOpen: boolean;
  currentOperator: Operator | null;
  onSaveOperator: (operator: Operator) => void;
  onClose?: () => void;
  isFirstSetup?: boolean;
}

const COMMON_ROLES = [
  'Operador',
  'Aluno',
  'Administrador',
  'Estoquista',
  'Gerente',
];

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  currentOperator,
  onSaveOperator,
  onClose,
  isFirstSetup = false,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Operador');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOperator) {
      setName(currentOperator.name || '');
      setRole(currentOperator.role || 'Operador');
    } else {
      setName('Renan');
      setRole('Operador');
    }
    setError(null);
  }, [currentOperator, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, informe o nome do operador.');
      return;
    }

    onSaveOperator({
      name: cleanName,
      role: role.trim() || 'Operador',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 space-y-4">
        {/* Header with Graphic */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(220,38,38,1)]">
              <User className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block">
                {isFirstSetup ? 'IDENTIFICAÇÃO DE ACESSO' : 'PERFIL DO OPERADOR'}
              </span>
              <h2 className="font-display font-black text-zinc-900 text-lg uppercase tracking-tight leading-tight">
                {isFirstSetup ? 'Quem está usando?' : 'Trocar Operador'}
              </h2>
            </div>
          </div>

          {!isFirstSetup && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-100 border-2 border-zinc-900 text-zinc-900 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Explain Box */}
        <div className="bg-zinc-50 p-3 rounded-2xl border-2 border-zinc-900 text-xs text-zinc-700 space-y-1">
          <div className="flex items-center gap-1.5 font-black uppercase text-zinc-900 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-red-600 stroke-[2.5]" />
            Rastreabilidade de Estoque
          </div>
          <p className="text-[11px] font-bold text-zinc-600">
            O operador ativo será registrado automaticamente em todas as movimentações de <strong>Entrada</strong> e <strong>Saída</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-700 text-xs font-black rounded-xl">
              {error}
            </div>
          )}

          {/* Operator Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1">
              Nome do Operador <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Ex: Renan"
              className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl px-3.5 py-2.5 text-xs font-black text-zinc-900 uppercase placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-red-600 transition-all"
            />
          </div>

          {/* Role / Function */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-900 tracking-wider flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-zinc-900" />
              Cargo / Função <span className="text-zinc-500 font-bold text-[9px]">(opcional)</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Aluno / Operador / Administrador"
              className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl px-3.5 py-2 text-xs font-black text-zinc-900 uppercase placeholder:text-zinc-400 focus:bg-white focus:outline-none transition-all"
            />

            {/* Quick role chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {COMMON_ROLES.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-[9px] font-black px-2 py-0.5 rounded-lg border transition-all uppercase ${
                    role.toLowerCase() === r.toLowerCase()
                      ? 'bg-red-600 text-white border-zinc-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {isFirstSetup ? 'ENTRAR NO SMARTSTOCK' : 'CONFIRMAR OPERADOR'}
            </button>

            {!isFirstSetup && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-zinc-200 text-zinc-900 font-black text-xs uppercase tracking-wider py-2.5 rounded-2xl border-2 border-zinc-900 hover:bg-zinc-300 transition-all"
              >
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
