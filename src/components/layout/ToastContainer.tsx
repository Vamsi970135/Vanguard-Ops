import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
            default: return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success': return 'border-emerald-500/30 bg-white dark:bg-slate-900 shadow-sm shadow-emerald-500/5';
            case 'warning': return 'border-amber-500/30 bg-white dark:bg-slate-900 shadow-sm shadow-amber-500/5';
            case 'error': return 'border-red-500/30 bg-white dark:bg-slate-900 shadow-sm shadow-red-500/5';
            default: return 'border-blue-500/30 bg-white dark:bg-slate-900 shadow-sm shadow-blue-500/5';
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border transition-all ${getBorderColor()}`}
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[10px] font-mono text-slate-400">{toast.timestamp}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
