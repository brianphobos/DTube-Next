'use client';
import { useEffect, useState } from 'react';
import { getDiscussionsByAuthor } from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import { getSafeThumbFromJson, withFallbackThumb } from '@/lib/thumb';

export default function ChannelGrid({ username }: { username: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getDiscussionsByAuthor(username, 24 as any)
      .then((r: any) => setItems(r || []))
      .catch(() => setItems([]));
  }, [username]);

  const videos = (items || []).map((c: any) => ({
    id: `${c.author}/${c.link}`,
    title: c.title || c?.json?.title || 'Untitled',
    author: c.author,
    thumbnail: withFallbackThumb(getSafeThumbFromJson(c?.json)),
    views: Number(c.dist || 0),
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
