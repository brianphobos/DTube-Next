'use client';
import { useEffect, useState } from 'react';

const KEY = 'dtube_autonext';

export function getAutoNext() {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(KEY);
  return v == null ? true : v === '1';
}

export default function AutoNextToggle() {
  const [on, setOn] = useState(getAutoNext());
  useEffect(() => { localStorage.setItem(KEY, on ? '1' : '0'); }, [on]);

  return (
    <label className="flex items-center gap-2 text-sm text-neutral-300">
      <input type="checkbox" checked={on} onChange={e=>setOn(e.target.checked)} />
      Auto-next
    </label>
  );
}
