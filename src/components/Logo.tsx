import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Main graphic symbol of InvenTech / SmartStock:
 * - Outer circular dual-tone ring (black and red arcs with trend arrow)
 * - Central lightbulb with red gear on left, electronic circuit traces on right
 * - Bar chart with growth arrow on bottom-left
 * - 3D inventory warehouse box on bottom-right
 */
export const InvenTechLogoSymbol: React.FC<LogoProps> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red accent glow / backdrop subtle layer */}
      <circle cx="200" cy="200" r="180" fill="transparent" />

      {/* --- OUTER CIRCULAR FRAME --- */}
      {/* Black Left Arc */}
      <path
        d="M 190 48 A 155 155 0 0 0 100 160"
        stroke="#18181b"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path
        d="M 98 160 A 155 155 0 0 0 105 270"
        stroke="#18181b"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Red Right Arc with Terminal Nodes */}
      <path
        d="M 235 55 A 155 155 0 0 1 292 312"
        stroke="#dc2626"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Top Red Node */}
      <circle cx="238" cy="58" r="10" fill="#dc2626" />

      {/* Bottom Red Arc & Growth Line connecting to chart */}
      <path
        d="M 292 312 A 155 155 0 0 1 106 286"
        stroke="#dc2626"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Bottom-left node */}
      <circle cx="106" cy="286" r="10" fill="#dc2626" />

      {/* --- BOTTOM LEFT: GROWTH BAR CHART & ARROW --- */}
      {/* Bar 1 */}
      <rect x="124" y="278" width="16" height="30" rx="3" fill="#18181b" />
      {/* Bar 2 */}
      <rect x="146" y="254" width="16" height="54" rx="3" fill="#18181b" />
      {/* Bar 3 */}
      <rect x="168" y="230" width="16" height="78" rx="3" fill="#18181b" />

      {/* Ascending Red Line with Arrow */}
      <path
        d="M 106 286 L 126 270 L 140 274 L 165 240 L 180 244 L 198 214"
        stroke="#dc2626"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead */}
      <polygon points="196,204 204,220 188,218" fill="#dc2626" />

      {/* --- BOTTOM RIGHT: ISOMETRIC INVENTORY BOX --- */}
      <g transform="translate(220, 222)">
        {/* Box Top Face */}
        <polygon points="36,0 72,14 36,28 0,14" fill="#18181b" />
        {/* Box Left Face */}
        <polygon points="0,14 36,28 36,68 0,54" fill="#27272a" />
        {/* Box Right Face */}
        <polygon points="36,28 72,14 72,54 36,68" fill="#09090b" />
        {/* Box Packaging Tape / Detail */}
        <polygon points="14,9 28,15 28,50 14,44" fill="#ffffff" />
        {/* Label on Right side */}
        <rect x="44" y="38" width="16" height="14" rx="2" fill="#ffffff" transform="skewY(-12)" />
        <rect x="48" y="41" width="8" height="2" fill="#18181b" transform="skewY(-12)" />
        <rect x="48" y="45" width="6" height="2" fill="#dc2626" transform="skewY(-12)" />
      </g>

      {/* --- CENTER: LIGHTBULB (LÂMPADA) --- */}
      {/* Bulb Glass Outline */}
      <path
        d="M 152 178 C 136 150 140 100 178 72 C 218 45 270 65 276 112 C 280 144 260 166 248 178 C 242 186 238 196 238 206 L 162 206 C 162 196 158 186 152 178 Z"
        stroke="#18181b"
        strokeWidth="11"
        strokeLinejoin="round"
        fill="#ffffff"
      />

      {/* Bulb Screw Base Threads */}
      <path
        d="M 172 216 L 228 216"
        stroke="#18181b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 175 228 L 225 228"
        stroke="#18181b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M 182 240 L 218 240"
        stroke="#18181b"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Bulb bottom contact */}
      <path
        d="M 190 248 C 190 254 210 254 210 248 Z"
        fill="#18181b"
      />

      {/* Inside Bulb: Left Half RED GEAR (Engrenagem) */}
      <g fill="#dc2626">
        {/* Gear Center half-disc */}
        <path d="M 198 96 A 32 32 0 0 0 198 160 Z" />
        {/* Center hole */}
        <path d="M 198 116 A 12 12 0 0 0 198 140 Z" fill="#ffffff" />
        {/* Gear Teeth (Cogs) */}
        {/* Tooth 1 Top-Left */}
        <polygon points="186,86 200,86 198,98 182,94" />
        {/* Tooth 2 Left-Up */}
        <polygon points="166,100 178,92 184,104 174,110" />
        {/* Tooth 3 Middle Left */}
        <polygon points="156,120 156,136 170,132 170,124" />
        {/* Tooth 4 Left-Down */}
        <polygon points="166,156 178,164 184,152 174,146" />
        {/* Tooth 5 Bottom-Left */}
        <polygon points="186,170 200,170 198,158 182,162" />
      </g>

      {/* Inside Bulb: Right Half ELECTRONIC CIRCUITS (Trilhas & Nós) */}
      <g stroke="#18181b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Main Central Trunk */}
        <line x1="202" y1="96" x2="202" y2="190" strokeWidth="5" />

        {/* Trace 1 - Top Right */}
        <path d="M 204 150 L 228 150 L 228 116" />
        <circle cx="228" cy="112" r="6" fill="#18181b" stroke="none" />

        {/* Trace 2 - Middle Right */}
        <path d="M 204 165 L 244 165 L 244 140" />
        <circle cx="244" cy="136" r="6" fill="#18181b" stroke="none" />

        {/* Trace 3 - Inner Right */}
        <path d="M 204 180 L 214 180 L 214 125" />
        <circle cx="214" cy="121" r="5" fill="#18181b" stroke="none" />
      </g>
    </svg>
  );
};

/**
 * Complete Official Logo with InvenTech brand & sustainability pillars
 */
export const InvenTechLogoComplete: React.FC<{ className?: string }> = ({ className = 'w-full max-w-xs' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Graphic Symbol */}
      <InvenTechLogoSymbol className="w-36 h-36 mx-auto drop-shadow-sm" />

      {/* Brand Name InvenTech */}
      <div className="mt-4 flex items-center justify-center font-display font-black text-3xl tracking-tight uppercase select-none">
        <span className="text-zinc-900">Inven</span>
        <span className="text-red-600">Tech</span>
      </div>

      {/* Sub-banner: Tecnologia | Sustentabilidade | Economia */}
      <div className="mt-2.5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-wider text-zinc-600 border-t-2 border-zinc-900/10 pt-2 w-full">
        <span className="text-red-600 font-black">⚙️ TECNOLOGIA</span>
        <span className="text-zinc-400">•</span>
        <span className="text-zinc-800 font-black">🌱 SUSTENTABILIDADE</span>
        <span className="text-zinc-400">•</span>
        <span className="text-red-600 font-black">💰 ECONOMIA</span>
      </div>
    </div>
  );
};

/**
 * Splash Screen component shown when the app opens
 */
interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-6 animate-in fade-in duration-300 select-none">
      {/* Top spacing */}
      <div className="w-full flex justify-end">
        <button
          onClick={onFinish}
          className="text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 transition-colors"
        >
          Pular
        </button>
      </div>

      {/* Central Content */}
      <div className="flex flex-col items-center text-center max-w-xs w-full space-y-5 animate-in zoom-in-95 duration-500">
        {/* Official Symbol */}
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-3xl p-3 border-3 border-zinc-900 shadow-[6px_6px_0px_rgba(220,38,38,1)] flex items-center justify-center">
            <InvenTechLogoSymbol className="w-24 h-24" />
          </div>
        </div>

        {/* Application Name & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="font-display font-black text-3xl tracking-tighter text-zinc-900 uppercase leading-none">
            SMART<span className="text-red-600">STOCK</span>
          </h1>
          <p className="text-xs font-black text-red-600 uppercase tracking-widest">
            Controle Inteligente de Estoque
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-900/20 rounded-full text-[10px] font-black text-zinc-700 uppercase tracking-wider">
              by InvenTech
            </span>
          </div>
        </div>

        {/* Progress Bar / Pulse */}
        <div className="w-48 bg-zinc-100 h-2 rounded-full border border-zinc-900 overflow-hidden mt-4">
          <div className="bg-red-600 h-full w-full animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Footer Branding Pillars */}
      <div className="text-center space-y-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
          TECNOLOGIA • SUSTENTABILIDADE • ECONOMIA
        </p>
        <p className="text-[10px] font-bold text-zinc-500">
          Versão 2.0 • Mobile First
        </p>
      </div>
    </div>
  );
};
