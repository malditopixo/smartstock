import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, Image, CheckCircle, AlertCircle, Sparkles, QrCode } from 'lucide-react';
import { Product } from '../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  products: Product[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  products
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      setCameraError(null);
      setIsScanning(true);

      try {
        const html5Qrcode = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success! Stop scanner & trigger success callback
            stopScanner();
            onScanSuccess(decodedText);
          },
          () => {
            // Scanning in progress (no barcode found in current frame)
          }
        );
      } catch (err: any) {
        console.warn("Camera start error:", err);
        setCameraError(
          "Não foi possível acessar a câmera. Você pode selecionar uma foto de QR Code ou escolher um produto de teste abaixo."
        );
        setIsScanning(false);
      }
    };

    // Small delay to allow DOM element to render
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn("Failed to stop scanner cleanly", e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const html5Qrcode = new Html5Qrcode("qr-reader-file");
      const result = await html5Qrcode.scanFile(file, true);
      html5Qrcode.clear();
      stopScanner();
      onScanSuccess(result);
    } catch (e) {
      alert("Não foi possível identificar um QR Code válido na imagem selecionada.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    stopScanner();
    onScanSuccess(manualCodeInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,1)] border-4 border-zinc-900 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-red-600 border-b-4 border-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white border-2 border-zinc-900 flex items-center justify-center">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-black text-base uppercase tracking-tight leading-tight">LEITOR DE QR CODE</h2>
              <p className="text-[10px] text-red-100 font-bold uppercase tracking-wider">APROXIME A CÂMERA DO QR CODE</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900 border-2 border-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Camera View Area */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 min-h-[240px] flex flex-col items-center justify-center border-4 border-zinc-900 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div id="qr-reader" className="w-full h-full" />
            <div id="qr-reader-file" className="hidden" />

            {/* Scanning Overlay Box */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div className="w-48 h-48 border-4 border-red-600 rounded-2xl relative flex items-center justify-center">
                  <div className="w-full h-1 bg-red-600 animate-pulse shadow-[0_0_12px_#dc2626]"></div>
                </div>
                <p className="text-white text-[10px] font-black uppercase tracking-wider mt-3 bg-zinc-900 border-2 border-white px-3 py-1 rounded-md">
                  BUSCANDO QR CODE...
                </p>
              </div>
            )}

            {/* Camera Error / Permission Banner */}
            {cameraError && (
              <div className="p-4 text-center space-y-3 max-w-xs">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto stroke-[2.5]" />
                <p className="text-xs text-zinc-200 font-bold uppercase">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Upload Photo Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all border-2 border-zinc-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
          >
            <Image className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            <span>ESCANEAR IMAGEM / GALERIA</span>
          </button>

          {/* Quick Demo Selector for Presentation */}
          <div className="bg-zinc-100 p-3 rounded-2xl border-3 border-zinc-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-zinc-900 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                TESTE RÁPIDO (APRESENTAÇÃO ESCOLAR)
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase">
              Clique em um produto abaixo para simular a leitura do QR Code instantaneamente:
            </p>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    stopScanner();
                    onScanSuccess(p.code);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-red-50 border-2 border-zinc-900 transition-all flex items-center justify-between text-xs font-black text-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                >
                  <div className="truncate pr-2">
                    <span className="text-zinc-900 font-black uppercase block truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-red-600 font-black">{p.code}</span>
                  </div>
                  <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-black shrink-0 uppercase">
                    {p.currentStock} {p.unit.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code Input */}
          <form onSubmit={handleManualSubmit} className="space-y-1.5 pt-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-900 block">
              DIGITAR CÓDIGO MANUALMENTE:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => setManualCodeInput(e.target.value)}
                placeholder="EX: EST-001"
                className="flex-1 bg-zinc-100 border-2 border-zinc-900 rounded-xl px-3 py-2 text-xs font-black uppercase text-zinc-900 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="bg-zinc-900 text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(220,38,38,1)] hover:bg-zinc-800 transition-all"
              >
                BUSCAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
