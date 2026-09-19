import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-400 shrink-0" />
        }[t.type];

        const bg = {
          success: 'bg-[var(--surface)] border-emerald-500/40 text-[var(--ink)]',
          error: 'bg-[var(--surface)] border-rose-500/40 text-[var(--ink)]',
          info: 'bg-[var(--surface)] border-blue-500/40 text-[var(--ink)]'
        }[t.type];

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/40 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              {icons}
              <span className="font-medium">{t.text}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
