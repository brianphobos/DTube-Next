'use client';
import { useState } from 'react';
import { broadcastVote, getSession, loadPostingKey } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

type Props = {
  author: string;
  permlink: string;
  defaultWeightPct?: number; // -100..100
  label?: string;
};

function pctToWeight(p: number) {
  const clamped = Math.max(-100, Math.min(100, Math.round(p)));
  return clamped * 100;
}

export default function VoteButton({ author, permlink, defaultWeightPct = 100, label = 'Vote' }: Props) {
  const session = getSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [weightPct, setWeightPct] = useState(defaultWeightPct);

  async function doVote() {
    if (!session) { setErr('Please log in first.'); return; }
    setBusy(true); setErr(null);
    try {
      const key = loadPostingKey(passphrase);
      if (!key) throw new Error('Bad passphrase or no key stored');
      await broadcastVote(session.username, key, author, permlink, pctToWeight(weightPct));
      toast({ variant: 'success', title: 'Voted', description: `Weight: ${weightPct}%` });
    } catch (e: any) {
      setErr(e.message || 'Vote failed');
      toast({ variant: 'error', title: 'Vote failed', description: e.message || 'Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl p-3 space-y-3">
      <div className="text-sm text-neutral-300">Vote weight: <span className="font-medium text-white">{weightPct}%</span></div>
      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={weightPct}
        onChange={(e)=>setWeightPct(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="password"
          placeholder="passphrase"
          className="bg-soft rounded px-3 py-1.5 outline-none"
          value={passphrase}
          onChange={(e)=>setPassphrase(e.target.value)}
        />
        <button onClick={doVote} disabled={busy}
          className="px-3 py-1.5 rounded-2xl bg-white text-black font-medium">
          {busy ? 'Voting…' : label}
        </button>
        {err && <span className="text-red-400 text-sm">{err}</span>}
      </div>
      <div className="flex gap-2 text-xs">
        {[-100,-75,-50,-25,0,25,50,75,100].map(p=>(
          <button key={p} onClick={()=>setWeightPct(p)}
            className={`px-2 py-1 rounded border ${p===weightPct?'bg-white text-black':'border-neutral-700'}`}>
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
}
