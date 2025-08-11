import { getAccount } from '@/lib/api';
import dynamic from 'next/dynamic';
import ChannelHeader from '@/components/ChannelHeader';

const ChannelGrid = dynamic(() => import('@/components/ChannelGrid'), { ssr: false });

export default async function ChannelPage({ params }: { params: { handle: string } }) {
  // params.handle will be 'brianphobos' or '@brianphobos'
  const user = params.handle.replace(/^@/, '');
  const account = await getAccount(user);

  if (!account) {
    return (
      <div className="p-8 text-center text-red-400">
        Channel @{user} not found.
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <ChannelHeader account={account} />
      <div className="mt-6">
        <ChannelGrid username={user} />
      </div>
    </div>
  );
}
