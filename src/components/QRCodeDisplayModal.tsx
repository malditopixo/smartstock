import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Product } from '../types';
import { X, Printer, Download, QrCode, Tag, Package } from 'lucide-react';

interface QRCodeDisplayModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeDisplayModal: React.FC<QRCodeDisplayModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const qrCardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${product.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .ticket {
              border: 2px dashed #000;
              padding: 24px;
              border-radius: 12px;
              text-align: center;
              max-width: 300px;
            }
            .code {
              font-size: 20px;
              font-weight: bold;
              margin-top: 12px;
            }
            .name {
              font-size: 16px;
              margin-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <svg id="qr-svg">${qrCardRef.current?.querySelector('svg')?.innerHTML || ''}</svg>
            <div class="code">${product.code}</div>
            <div class="name">${product.name}</div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xs w-full overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between border-b-4 border-zinc-900">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-white stroke-[2.5]" />
            <h3 className="font-display font-black text-sm uppercase tracking-tight">ETIQUETA QR CODE</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-zinc-900 text-white border-2 border-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-4 text-center">
          {/* Printable Ticket Card */}
          <div
            ref={qrCardRef}
            className="bg-zinc-100 border-3 border-zinc-900 p-5 rounded-2xl w-full flex flex-col items-center shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <div className="bg-white p-3 rounded-xl border-2 border-zinc-900 mb-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <QRCodeSVG
                value={product.code}
                size={160}
                level="H"
                includeMargin={false}
                fgColor="#09090B"
              />
            </div>

            <span className="font-mono font-black text-red-600 text-lg tracking-wider">
              {product.code}
            </span>
            <h4 className="font-display font-black text-zinc-900 text-base uppercase mt-0.5 line-clamp-2">
              {product.name}
            </h4>

            <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-700 font-black uppercase">
              <span className="bg-white px-2 py-0.5 rounded-md border border-zinc-900">
                {product.category}
              </span>
              <span>•</span>
              <span className="font-black text-zinc-900">
                {product.currentStock} {product.unit.toUpperCase()}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-zinc-600 font-bold uppercase">
            Escaneie este QR Code com a câmera do celular para realizar movimentações de entrada ou saída.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider py-3 rounded-xl border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>IMPRIMIR</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-black text-xs uppercase tracking-wider py-3 rounded-xl border-2 border-zinc-900 transition-all"
            >
              FECHAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
