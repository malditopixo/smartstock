import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white';
          let border = 'border-slate-800';
          let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-white text-zinc-900';
            border = 'border-3 border-zinc-900';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[3] shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-red-600 text-white';
            border = 'border-3 border-zinc-900';
            icon = <XCircle className="w-5 h-5 text-white stroke-[3] shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-400 text-zinc-900';
            border = 'border-3 border-zinc-900';
            icon = <AlertTriangle className="w-5 h-5 text-zinc-900 stroke-[3] shrink-0" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl ${bg} ${border} shadow-[4px_4px_0px_rgba(0,0,0,1)]`}
            >
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wide">
                {icon}
                <div>
                  {toast.title && <div className="font-display font-black text-xs uppercase">{toast.title}</div>}
                  <div className="font-bold">{toast.message}</div>
                </div>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
