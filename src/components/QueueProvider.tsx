'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
type QItem = { id: string; title: string; author: string; href: string; thumbnail?: string };

type Ctx = {
  items: QItem[];
  add: (item: QItem) => void;
  addMany: (items: QItem[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  next: () => QItem | null;
  peek: () => QItem | null;
};

const LS_KEY = 'dtube_queue';
const QueueCtx = createContext<Ctx | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((item: QItem) => {
    setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
  }, []);
  const addMany = useCallback((arr: QItem[]) => {
    setItems(prev => {
      const map = new Map(prev.map(i => [i.id, i]));
      arr.forEach(i => map.set(i.id, map.get(i.id) ?? i));
      return Array.from(map.values());
    });
  }, []);
  const remove = useCallback((id: string) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const next = useCallback(() => {
    let n: QItem | null = null;
    setItems(prev => {
      const [, ...rest] = prev;
      n = rest[0] || null;
      return rest;
    });
    return n;
  }, []);
  const peek = useCallback(() => items[0] || null, [items]);

  const value = useMemo(() => ({ items, add, addMany, remove, clear, next, peek }), [items, add, addMany, remove, clear, next, peek]);
  return <QueueCtx.Provider value={value}>{children}<QueueDrawer /></QueueCtx.Provider>;
}

export function useQueue() {
  const ctx = useContext(QueueCtx);
  if (!ctx) throw new Error('useQueue must be inside <QueueProvider>');
  return ctx;
}

function QueueDrawer() {
  const { items, remove, clear } = useQueue();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button onClick={()=>setOpen(o=>!o)} className="px-3 py-1.5 rounded-2xl bg-white text-black text-sm">
        Queue {items.length ? `(${items.length})` : ''}
      </button>
      {open && (
        <div className="mt-2 w-[320px] max-h-[50vh] overflow-auto bg-card border border-neutral-800 rounded-xl p-2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-300">Up next</div>
            <button onClick={clear} className="text-xs text-neutral-400 hover:underline">Clear</button>
          </div>
          {items.length === 0 && <div className="text-xs text-neutral-500">Queue is empty.</div>}
          {items.map(it => (
            <a key={it.id} href={it.href} className="flex gap-2 items-center rounded hover:bg-soft p-2">
              <img src={it.thumbnail || '/logo.svg'} className="w-16 h-10 object-cover rounded" alt="" />
              <div className="min-w-0">
                <div className="text-sm truncate">{it.title}</div>
                <div className="text-xs text-neutral-400">@{it.author}</div>
              </div>
              <button onClick={(e)=>{ e.preventDefault(); remove(it.id); }} className="ml-auto text-xs text-neutral-400 hover:text-white">✕</button>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
