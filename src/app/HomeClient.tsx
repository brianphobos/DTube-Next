// src/app/HomeClient.tsx
'use client';
import { useEffect, useState } from 'react';
import { getHotDiscussions } from '@/lib/api';
import VideoCard from '@/components/VideoCard';

export default function HomeClient() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { getHotDiscussions(24 as any).then((r:any)=>setItems(r||[])).catch(()=>setItems([])); }, []);
  const videos = (items||[]).map((c:any)=>({
    id: `${c.author}/${c.link}`, title: c.title || c?.json?.title || 'Untitled',
    author: c.author, thumbnail: c?.json?.thumbnail || c?.json?.img || '/logo.svg',
    views: Number(c.dist || 0),
  }));
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map(v => <VideoCard key={v.id} video={v} />)}
    </div>
  );
}
