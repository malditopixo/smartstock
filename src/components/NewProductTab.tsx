import React, { useState } from 'react';
import { Product } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  PlusCircle,
  QrCode,
  Sparkles,
  Package,
  Tag,
  MapPin,
  DollarSign,
  Layers,
  Check,
  RotateCcw
} from 'lucide-react';

interface NewProductTabProps {
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingProducts: Product[];
}

export const NewProductTab: React.FC<NewProductTabProps> = ({
  onAddProduct,
  existingProducts
}) => {
  // Generate a recommended code: e.g., "EST-007"
  const generateNewCode = () => {
    const nextNum = existingProducts.length + 1;
    const pad = String(nextNum).padStart(3, '0');
    return `EST-${pad}`;
  };

  const [name, setName] = useState('');
  const [code, setCode] = useState(generateNewCode());
  const [category, setCategory] = useState('Eletrônicos');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [unit, setUnit] = useState('un');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Informe o nome do produto.');
      return;
    }

    if (!code.trim()) {
      setErrorMsg('Informe um código/SKU único para o QR Code.');
      return;
    }

    // Check code uniqueness
    const codeExists = existingProducts.some(
      (p) => p.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (codeExists) {
      setErrorMsg(`O código "${code.trim()}" já está em uso por outro produto!`);
      return;
    }

    const stockNum = parseInt(currentStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('Estoque inicial não pode ser negativo.');
      return;
    }

    const minNum = parseInt(minStock, 10);
    const parsedPrice = price ? parseFloat(price.replace(',', '.')) : undefined;

    onAddProduct({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      category: category.trim() || 'Geral',
      currentStock: stockNum,
      minStock: isNaN(minNum) ? 2 : minNum,
      unit: unit.trim() || 'un',
      price: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : undefined,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-in fade-in duration-200">
      {/* Title Card */}
      <div className="bg-red-600 border-4 border-zinc-900 p-4 rounded-2xl text-white shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(255,255,255,1)] flex items-center justify-center">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display font-black text-lg uppercase tracking-tight leading-tight">CADASTRAR PRODUTO</h2>
            <p className="text-xs text-red-100 font-bold uppercase tracking-wide">Geração Automática de QR Code Unique</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* QR Code Live Preview Card */}
        <div className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="bg-zinc-100 p-2.5 rounded-xl border-2 border-zinc-900 shrink-0">
            <QRCodeSVG
              value={code.trim() || 'NOVO-PRODUTO'}
              size={80}
              level="M"
              fgColor="#09090B"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 block">
              PRÉ-VISUALIZAÇÃO DO QR CODE
            </span>
            <div className="font-mono font-black text-red-600 text-base">
              {code.trim() || 'CÓDIGO'}
            </div>
            <div className="text-xs font-black uppercase text-zinc-900 line-clamp-1">
              {name.trim() || 'NOME DO PRODUTO'}
            </div>
            <button
              type="button"
              onClick={() => setCode(generateNewCode())}
              className="text-[10px] font-black uppercase text-red-600 hover:underline flex items-center gap-1 pt-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
              <span>GERAR NOVO CÓDIGO</span>
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="bg-white p-4 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] space-y-3">
          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
              NOME DO PRODUTO <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="EX: TECLADO GAMER RGB"
              className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Código & Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                CÓDIGO QR / SKU <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EX: EST-010"
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 font-mono text-xs font-black text-red-600 focus:bg-white focus:outline-none uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                CATEGORIA
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:outline-none"
              >
                <option value="Eletrônicos">ELETRÔNICOS</option>
                <option value="Papelaria">PAPELARIA</option>
                <option value="Informática">INFORMÁTICA</option>
                <option value="Móveis">MÓVEIS</option>
                <option value="Alimentos">ALIMENTOS</option>
                <option value="Ferramentas">FERRAMENTAS</option>
                <option value="Outros">OUTROS</option>
              </select>
            </div>
          </div>

          {/* Estoque Inicial, Estoque Mínimo e Unidade */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-900 block">
                INICIAL
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-center font-display font-black text-sm text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-900 block">
                MÍNIMO
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-center font-display font-black text-sm text-red-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-900 block">
                UNIDADE
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:outline-none"
              >
                <option value="un">UN</option>
                <option value="cx">CX</option>
                <option value="kg">KG</option>
                <option value="pct">PCT</option>
                <option value="lt">LT</option>
              </select>
            </div>
          </div>

          {/* Preço Unitário & Localização */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                PREÇO (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
                LOCALIZAÇÃO
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="EX: CORREDOR B"
                className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-900 block">
              DESCRIÇÃO (OPCIONAL)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="DETALHES ADICIONAIS DO PRODUTO..."
              className="w-full bg-zinc-100 border-2 border-zinc-900 rounded-xl p-2.5 text-xs font-black uppercase text-zinc-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-600 text-white border-2 border-zinc-900 text-xs font-black uppercase tracking-wider rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            {errorMsg}
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl border-2 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>SALVAR PRODUTO E GERAR QR CODE</span>
        </button>
      </form>
    </div>
  );
};
