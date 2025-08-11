'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: string; title?: string; description?: string; variant?: 'default'|'success'|'error' };
type Ctx = { toast: (t: Omit<Toast,'id'>) => void; remove: (id: string) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setItems(i => i.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setItems(i => [...i, { id, ...t }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo(() => ({ toast, remove }), [toast, remove]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed z-[100] bottom-4 right-4 space-y-2 w-[calc(100%-2rem)] max-w-sm">
        {items.map(t => (
          <div key={t.id}
            className={`rounded-xl p-3 shadow border text-sm
              ${t.variant==='success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                t.variant==='error' ? 'bg-red-50 border-red-200 text-red-900' :
                'bg-white border-neutral-200 text-neutral-900'}`}>
            {t.title && <div className="font-medium">{t.title}</div>}
            {t.description && <div className="text-neutral-700 mt-0.5">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
