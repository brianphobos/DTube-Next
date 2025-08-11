'use client';
import { useEffect, useRef, useState } from 'react';
import VideoCard from './VideoCard';

type Item = { id: string; title: string; author: string; thumbnail: string; views: number; link: string };

export default function ChannelGrid({ username }: { username: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentryRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    if (loading || done) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', '24');
      if (cursor) qs.set('start_link', cursor);
      const res = await fetch(`/api/author/${encodeURIComponent(username)}/videos?` + qs.toString(), { cache: 'no-store' });
      const json = await res.json();
      const newItems = json.items as Item[];
      setItems(prev => [...prev, ...newItems]);
      setCursor(json.next?.start_link || null);
      if (!json.next) setDone(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setItems([]); setCursor(null); setDone(false);
  }, [username]);

  useEffect(() => {
    const el = sentryRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) load();
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [sentryRef, cursor, done, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(v => <VideoCard key={v.id} video={v as any} />)}
      </div>
      <div ref={sentryRef} className="h-12 flex items-center justify-center text-sm text-neutral-400">
        {done ? 'No more videos' : loading ? 'Loading…' : 'Scroll for more'}
      </div>
    </>
  );
}
