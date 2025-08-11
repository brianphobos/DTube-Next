import { getAccount } from '@/lib/api';
import dynamic from 'next/dynamic';
import ChannelHeader from '@/components/ChannelHeader';

const ChannelGrid = dynamic(() => import('@/components/ChannelGrid'), { ssr: false });

export default async function ChannelPage({ params }: { params: { handle: string } }) {
  // supports /brian and /@brian in the URL
  const user = params.handle.replace(/^@/, '');
  const account = await getAccount(user);

  return (
    <div className="max-w-[1200px] mx-auto">
      <ChannelHeader account={account} />
      <div className="mt-6">
        <ChannelGrid username={user} />
      </div>
    </div>
  );
}
