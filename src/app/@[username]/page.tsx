// src/app/[handle]/page.tsx
import dynamic from 'next/dynamic';
const ChannelClient = dynamic(() => import('./ChannelClient'), { ssr: false });

export default function ChannelPage({ params }: { params: { handle: string } }) {
  const user = params.handle.replace(/^@/, '');
  return <ChannelClient user={user} />;
}
