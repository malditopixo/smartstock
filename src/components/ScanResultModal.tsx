import React, { useState, useEffect } from 'react';
import { Product, MovementType } from '../types';
import { getStockStatus, formatCurrency } from '../utils/formatters';
import {
  X,
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Check,
  Package,
  MapPin,
  Tag,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanResultModalProps {
  product: Product | null;
  scannedCode: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmMovement: (
    productId: string,
    type: MovementType,
    quantity: number,
    note?: string
  ) => void;
  onRegisterNewWithCode?: (code: string) => void;
  onViewQRCode?: (product: Product) => void;
  operatorName?: string;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  product,
  scannedCode,
  isOpen,
  onClose,
  onConfirmMovement,
  onRegisterNewWithCode,
  onViewQRCode,
  operatorName = 'Renan',
}) => {
  const [activeAction, setActiveAction] = useState<MovementType | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveAction(null);
    setQuantity('1');
    setNote('');
    setErrorMsg(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Case: Product not found for scanned code
  if (!product) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 space-y-4 text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white mx-auto">
            <AlertOctagon className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-zinc-900 text-xl uppercase tracking-tight">PRODUTO NÃO ENCONTRADO</h3>
            <p className="text-xs text-zinc-600 font-bold uppercase">
              Nenhum produto cadastrado com o código{' '}
              <strong className="font-mono text-red-600">{scannedCode}</strong>.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            {onRegisterNewWithCode && scannedCode && (
              <button
                onClick={() => {
                  onClose();
                  onRegisterNewWithCode(scannedCode);
                }}
                className="w-full bg-red-600 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                CADASTRAR ESTE PRODUTO AGORA
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full bg-zinc-200 text-zinc-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl border-2 border-zinc-900 hover:bg-zinc-300 transition-all"
            >
              FECHAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockInfo = getStockStatus(product.currentStock, product.minStock);
  const numQty = parseInt(quantity, 10) || 0;

  // Calculate predicted new stock
  const predictedNewStock =
    activeAction === 'ENTRADA'
      ? product.currentStock + numQty
      : product.currentStock - numQty;

  const isInvalidSaida = activeAction === 'SAIDA' && numQty > product.currentStock;

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeAction) return;

    if (isNaN(numQty) || numQty <= 0) {
      setErrorMsg('Informe uma quantidade maior que zero.');
      return;
    }

    if (activeAction === 'SAIDA' && numQty > product.currentStock) {
      setErrorMsg(
        `Estoque insuficiente! O estoque atual é ${product.currentStock} ${product.unit}. Não é permitido estoque negativo.`
      );
      return;
    }

    // Fire celebratory confetti for successful entry
    if (activeAction === 'ENTRADA') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    onConfirmMovement(product.id, activeAction, numQty, note.trim() || undefined);
    setActiveAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b-4 border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(255,255,255,1)]">
              <Package className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-red-500">
                ITEM ESCANEADO
              </span>
              <h2 className="font-display font-black text-sm text-white uppercase truncate max-w-[200px]">
                {product.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-800 border-2 border-zinc-700 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Main Product Card Summary */}
          <div className="bg-zinc-100 p-4 rounded-2xl border-3 border-zinc-900 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-black text-zinc-900 text-lg uppercase leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-black text-white bg-zinc-900 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    {product.code}
                  </span>
                  <span className="text-xs text-zinc-600 font-black uppercase flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {product.category}
                  </span>
                </div>
              </div>

              {onViewQRCode && (
                <button
                  onClick={() => onViewQRCode(product)}
                  className="p-2 bg-white rounded-xl border-2 border-zinc-900 hover:bg-zinc-100 text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all shrink-0"
                  title="Ver QR Code"
                >
                  <QrCode className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Current Stock Display */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">
                  ESTOQUE ATUAL
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-display text-3xl font-black text-zinc-900 leading-none">
                    {product.currentStock}
                  </span>
                  <span className="text-xs font-black text-zinc-500 uppercase">
                    {product.unit}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-zinc-900 ${
                  product.currentStock === 0
                    ? 'bg-red-600 text-white'
                    : product.currentStock <= product.minStock
                    ? 'bg-amber-400 text-zinc-900'
                    : 'bg-emerald-400 text-zinc-900'
                }`}
              >
                {stockInfo.label.toUpperCase()}
              </span>
            </div>

            {/* Extra details (Location, Price) */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-black uppercase text-zinc-800">
              {product.location && (
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border-2 border-zinc-900">
                  <MapPin className="w-3.5 h-3.5 text-red-600 stroke-[2.5] shrink-0" />
                  <span className="truncate">{product.location}</span>
                </div>
              )}
              {product.price !== undefined && (
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-lg border-2 border-zinc-900 text-zinc-900">
                  <span>PREÇO:</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Choice: ENTRADA / SAÍDA Buttons */}
          {!activeAction ? (
            <div className="space-y-2">
              <p className="text-xs font-black text-zinc-900 text-center uppercase tracking-widest">
                SELECIONE A OPERAÇÃO:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* ENTRADA button */}
                <button
                  onClick={() => {
                    setActiveAction('ENTRADA');
                    setErrorMsg(null);
                  }}
                  className="p-4 rounded-2xl bg-emerald-400 hover:bg-emerald-500 text-zinc-900 font-black border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <ArrowUpRight className="w-8 h-8 stroke-[3]" />
                  <span className="text-base uppercase tracking-tight">ENTRADA</span>
                  <span className="text-[10px] font-bold text-zinc-800 uppercase">
                    (+) ADICIONAR
                  </span>
                </button>

                {/* SAÍDA button */}
                <button
                  onClick={() => {
                    setActiveAction('SAIDA');
                    setErrorMsg(null);
                  }}
                  className="p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <ArrowDownRight className="w-8 h-8 stroke-[3]" />
                  <span className="text-base uppercase tracking-tight">SAÍDA</span>
                  <span className="text-[10px] font-bold text-red-100 uppercase">
                    (-) RETIRAR
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Action Form for Quantity input */
            <form onSubmit={handleActionSubmit} className="space-y-3 pt-1 border-t-2 border-zinc-900">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border-2 border-zinc-900 flex items-center gap-1.5 ${
                    activeAction === 'ENTRADA'
                      ? 'bg-emerald-400 text-zinc-900'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {activeAction === 'ENTRADA' ? (
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <MinusCircle className="w-4 h-4 stroke-[2.5]" />
                  )}
                  {activeAction}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="text-xs text-red-600 hover:underline uppercase font-black"
                >
                  ALTERAR
                </button>
              </div>

              {/* Quantity Input */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                  QUANTIDADE ({product.unit.toUpperCase()}):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(Math.max(1, (parseInt(quantity, 10) || 1) - 1).toString())
                    }
                    className="w-12 h-12 rounded-xl border-2 border-zinc-900 bg-zinc-100 font-black text-xl text-zinc-900 hover:bg-zinc-200 active:translate-y-0.5 flex items-center justify-center shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 bg-zinc-100 border-2 border-zinc-900 rounded-xl h-12 text-center font-display font-black text-2xl text-zinc-900 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(((parseInt(quantity, 10) || 0) + 1).toString())
                    }
                    className="w-12 h-12 rounded-xl border-2 border-zinc-900 bg-zinc-100 font-black text-xl text-zinc-900 hover:bg-zinc-200 active:translate-y-0.5 flex items-center justify-center shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Note / Observação Optional */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                  MOTIVO / OBSERVAÇÃO (OPCIONAL):
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    activeAction === 'ENTRADA'
                      ? 'EX: REPOSIÇÃO DE ESTOQUE'
                      : 'EX: VENDA AO CLIENTE'
                  }
                  className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Active Operator for Traceability */}
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 bg-zinc-50 p-2.5 rounded-xl border-2 border-zinc-900">
                <span className="uppercase text-[9px] text-zinc-500 font-black tracking-wider">
                  OPERADOR RESPONSÁVEL:
                </span>
                <span className="font-display font-black text-zinc-900 uppercase flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px]">
                    👤
                  </span>
                  {operatorName}
                </span>
              </div>

              {/* Live Preview of Stock Change */}
              <div className="p-3 bg-zinc-100 rounded-xl border-2 border-zinc-900 text-xs flex items-center justify-between font-black uppercase text-zinc-900">
                <span>ANTERIOR: {product.currentStock}</span>
                <span className="text-red-600">➔</span>
                <span
                  className={
                    isInvalidSaida
                      ? 'text-red-600 font-black'
                      : 'text-zinc-900 font-black'
                  }
                >
                  FINAL: {predictedNewStock} {product.unit.toUpperCase()}
                </span>
              </div>

              {/* Error Warning */}
              {errorMsg && (
                <div className="p-3 bg-red-600 text-white border-2 border-zinc-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-start gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-white mt-0.5 stroke-[2.5]" />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl border-2 border-zinc-900 transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isInvalidSaida || numQty <= 0}
                  className={`flex-1 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl border-2 border-zinc-900 transition-all flex items-center justify-center gap-1.5 ${
                    isInvalidSaida || numQty <= 0
                      ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                      : activeAction === 'ENTRADA'
                      ? 'bg-emerald-400 text-zinc-900 hover:bg-emerald-500 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRMAR {activeAction}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
