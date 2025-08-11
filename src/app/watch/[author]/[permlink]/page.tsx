import { getContent } from '@/lib/api';
import WatchClient from './WatchClient';

export default async function WatchPage({ params }: { params: { author: string; permlink: string } }) {
  const video: any = await getContent(params.author, params.permlink);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <WatchClient video={{ ...video, permlink: params.permlink }} />
    </div>
  );
}
