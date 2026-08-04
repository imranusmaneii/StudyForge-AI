import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#0070F3] shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-[#06140e]/95 text-emerald-200',
    info: 'border-[#0070F3]/40 bg-[#061022]/95 text-blue-200',
    warning: 'border-amber-500/40 bg-[#141006]/95 text-amber-200'
  };

  const type = toast.type || 'success';

  return (
    <div className={`pointer-events-auto p-3.5 rounded-xl border shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-300 ${borderColors[type]}`}>
      <div className="flex items-center gap-2.5">
        {icons[type]}
        <span className="font-medium tracking-tight">{toast.text}</span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
