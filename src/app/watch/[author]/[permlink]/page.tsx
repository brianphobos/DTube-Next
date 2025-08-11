// src/app/watch/[author]/[permlink]/page.tsx
import dynamic from 'next/dynamic';
const WatchClient = dynamic(() => import('./WatchClient'), { ssr: false });

export default function WatchPage({ params }: { params: { author: string; permlink: string } }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <WatchClient video={{ author: params.author, permlink: params.permlink }} />
    </div>
  );
}
