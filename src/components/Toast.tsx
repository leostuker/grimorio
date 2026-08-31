import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0">
      {toasts.map((t) => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const isWarning = t.type === 'warning';

        return (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all transform translate-y-0 backdrop-blur-md ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100'
                : isError
                ? 'bg-rose-950/90 border-rose-700/60 text-rose-100'
                : isWarning
                ? 'bg-amber-950/90 border-amber-700/60 text-amber-100'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-sm">
              <h4 className="font-semibold">{t.title}</h4>
              {t.message && <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{t.message}</p>}
            </div>
            <button
              id={`toast-dismiss-${t.id}`}
              onClick={() => onDismiss(t.id)}
              className="shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
