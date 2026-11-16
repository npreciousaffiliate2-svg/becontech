import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const icon = {
            success: <CheckCircle2 className="w-4 h-4 text-[#13A348] shrink-0" />,
            danger: <XCircle className="w-4 h-4 text-[#F83A20] shrink-0" />,
            warning: <AlertCircle className="w-4 h-4 text-[#FEC10A] shrink-0" />,
            info: <Info className="w-4 h-4 text-[#0F7640] shrink-0" />,
          }[toast.type];

          const borderColors = {
            success: 'border-l-[#13A348]',
            danger: 'border-l-[#F83A20]',
            warning: 'border-l-[#FEC10A]',
            info: 'border-l-[#0F7640]',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-[4px] border border-slate-200 border-l-4 ${borderColors} bg-white p-3 shadow-sm flex items-start gap-2.5 transition-all duration-200 animate-slide-up`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-slate-500 break-words">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-[4px] shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
