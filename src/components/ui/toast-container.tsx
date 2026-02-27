'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import type { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom-2 fade-in ${
            toast.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/90 text-emerald-100'
              : 'border-red-500/20 bg-red-950/90 text-red-100'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-400" />
          ) : (
            <XCircle className="size-4 text-red-400" />
          )}
          {toast.message}
        </button>
      ))}
    </div>
  );
}
