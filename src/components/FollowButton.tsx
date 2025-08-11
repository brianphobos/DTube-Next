'use client';
import { useState } from 'react';
import { getSession } from '@/lib/auth';

export default function FollowButton({ username }: { username: string }) {
  const session = getSession();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!session) { alert('Log in to follow'); return; }
    setBusy(true);
    try {
      // TODO: broadcast follow tx if available on your node / social plugin
      await new Promise(r => setTimeout(r, 250));
      setFollowing(v => !v);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={toggle} disabled={busy}
      className={`px-3 py-1 rounded-2xl text-sm ${following ? 'bg-neutral-700' : 'bg-white text-black'}`}>
      {busy ? '…' : following ? 'Following' : 'Follow'}
    </button>
  );
}
