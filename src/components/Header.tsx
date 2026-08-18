import React, { useState } from 'react';
import { QrCode, RefreshCw, Info, PackageCheck, Smartphone, MoreVertical, Sparkles, User, UserCheck } from 'lucide-react';
import { Operator } from '../types';
import { InvenTechLogoSymbol, InvenTechLogoComplete } from './Logo';

interface HeaderProps {
  onOpenScanner: () => void;
  onResetData: () => void;
  totalProducts: number;
  operator: Operator | null;
  onSwitchOperator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onResetData,
  totalProducts,
  operator,
  onSwitchOperator,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b-4 border-zinc-900">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          {/* Official Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(220,38,38,1)] shrink-0">
              <InvenTechLogoSymbol className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-black text-zinc-900 text-lg tracking-tight uppercase leading-none">
                  SMART<span className="text-red-600">STOCK</span>
                </h1>
                <span className="text-[9px] font-black bg-zinc-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-tight flex items-center gap-1 mt-0.5">
                <span className="text-zinc-500 font-bold">CONTROLE INTELIGENTE</span>
                <span>•</span>
                <span>{totalProducts} {totalProducts === 1 ? 'ITEM' : 'ITENS'}</span>
              </p>
            </div>
          </div>

          {/* Quick Scanner Action & Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:translate-y-0.5 text-white font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>SCAN</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-9 h-9 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                aria-label="Menu de opções"
              >
                <MoreVertical className="w-5 h-5 stroke-[2.5]" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-60 bg-white rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] border-3 border-zinc-900 p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onSwitchOperator();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black uppercase text-zinc-800 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors border-b border-zinc-100"
                    >
                      <User className="w-4 h-4 text-red-600 stroke-[2.5]" />
                      <span>Trocar Operador ({operator?.name || 'Renan'})</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onResetData();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black uppercase text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
                      <span>Resetar Dados</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowAbout(true);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black uppercase text-zinc-800 hover:bg-zinc-100 flex items-center gap-2.5 transition-colors"
                    >
                      <Info className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
                      <span>Sobre o Projeto</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Discreet Active Operator Bar */}
        <div className="bg-zinc-900 text-white px-4 py-1.5 border-t border-zinc-800">
          <div className="max-w-md mx-auto flex items-center justify-between text-[11px] font-black">
            <button
              onClick={onSwitchOperator}
              className="flex items-center gap-2 hover:opacity-85 text-left group transition-opacity"
            >
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black border border-white/20">
                👤
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-wider">
                  OPERADOR ATUAL:
                </span>
                <span className="text-white uppercase tracking-wide group-hover:text-red-400 transition-colors">
                  {operator?.name || 'RENAN'}
                </span>
                {operator?.role && (
                  <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded border border-zinc-700 uppercase font-bold">
                    {operator.role}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={onSwitchOperator}
              className="text-[10px] font-black uppercase text-red-400 hover:text-white underline decoration-red-500 underline-offset-2 transition-colors flex items-center gap-1 shrink-0"
            >
              <UserCheck className="w-3 h-3 stroke-[2.5]" />
              <span>TROCAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal Sobre o Projeto */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Complete Official Logo in About Modal */}
            <div className="p-3 bg-zinc-50 rounded-2xl border-2 border-zinc-900 flex flex-col items-center">
              <InvenTechLogoComplete className="w-full" />
            </div>

            <div className="text-center space-y-1">
              <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest inline-block rounded-md border border-zinc-900">
                PROJETO INVENTECH
              </span>
              <h2 className="font-display font-black text-zinc-900 text-2xl uppercase tracking-tight">SmartStock</h2>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                Controle Inteligente de Estoque
              </p>
            </div>

            <div className="bg-zinc-100 p-4 rounded-2xl text-xs text-zinc-800 space-y-2 border-2 border-zinc-900 font-medium">
              <p>
                <strong className="font-black uppercase text-zinc-900">Sobre:</strong> O <strong>SmartStock</strong> é a solução mobile-first da <strong>InvenTech</strong> para gestão de estoque com leitura de QR Code, auditoria em tempo real, inteligência artificial e previsão estatística de reposição.
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5 font-black uppercase text-zinc-900">
                  <Smartphone className="w-4 h-4 text-red-600 stroke-[2.5]" />
                  Pilares do Projeto:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-700 font-bold text-[11px]">
                  <li><strong className="text-zinc-900">Tecnologia:</strong> Câmera com QR Code & Assistente IA integrado</li>
                  <li><strong className="text-zinc-900">Sustentabilidade:</strong> Otimização de consumo e redução de desperdício</li>
                  <li><strong className="text-zinc-900">Economia:</strong> Previsão inteligente para evitar falta ou excesso de itens</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_rgba(220,38,38,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </>
  );
};

