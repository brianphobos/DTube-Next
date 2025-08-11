'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useQueue } from '@/components/QueueProvider';

export default function VideoCard({ video }: { video: any }) {
  const { add } = useQueue();
  const item = {
    id: video.id,
    title: video.title,
    author: video.author,
    href: `/watch/${video.id}`,
    thumbnail: video.thumbnail,
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <Link href={`/watch/${video.id}`}>
        <div className="relative aspect-video bg-neutral-900">
          <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/watch/${video.id}`} className="font-medium line-clamp-2 group-hover:underline">{video.title}</Link>
        <div className="text-sm text-neutral-400 mt-1">
          <a href={`/@${video.author}`} className="hover:underline">@{video.author}</a>
        </div>
        <div className="mt-2">
          <button onClick={()=>add(item)} className="text-xs px-2 py-1 rounded-2xl border border-neutral-700 hover:bg-soft">＋ Add to queue</button>
        </div>
      </div>
    </div>
  );
}
