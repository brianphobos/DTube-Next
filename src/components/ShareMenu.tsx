'use client';
import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';

export default function ShareMenu({ url, title }: { url: string; title: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast({ variant: 'success', title: 'Link copied' });
    } catch {
      toast({ variant: 'error', title: 'Copy failed', description: 'Select and copy manually.' });
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(v => !v)} className="px-3 py-1.5 rounded-2xl bg-white text-black text-sm">Share</button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-neutral-800 p-2 z-50">
          <button onClick={nativeShare} className="w-full text-left px-3 py-2 rounded hover:bg-soft text-sm">Share…</button>
          <button onClick={copy} className="w-full text-left px-3 py-2 rounded hover:bg-soft text-sm">Copy link</button>
          <a className="block px-3 py-2 rounded hover:bg-soft text-sm" target="_blank"
             href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>Post to X</a>
          <a className="block px-3 py-2 rounded hover:bg-soft text-sm" target="_blank"
             href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}>Share to Facebook</a>
        </div>
      )}
    </div>
  );
}
