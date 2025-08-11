'use client';
import { useEffect, useState } from 'react';
import { getAccount } from '@/lib/api';
import ChannelHeader from '@/components/ChannelHeader';
import ChannelGrid from '@/components/ChannelGrid';

export default function ChannelClient({ user }: { user: string }) {
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    let cancel = false;
    getAccount(user).then(a => { if (!cancel) setAccount(a); }).catch(() => setAccount(null));
    return () => { cancel = true; };
  }, [user]);

  if (!account) return <div className="p-8 text-neutral-400 text-center">Loading channel…</div>;

  return (
    <div className="max-w-[1200px] mx-auto">
      <ChannelHeader account={account} />
      <div className="mt-6">
        <ChannelGrid username={user} />
      </div>
    </div>
  );
}
