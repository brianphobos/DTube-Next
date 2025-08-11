'use client';
import { useState } from 'react';
import { saveSession, verifyAccount, logout, getSession } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

export default function LoginForm() {
  const toast = useToast();
  const session = getSession();
  const [username, setUsername] = useState('');
  const [postingKey, setPostingKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">Signed in as <b>@{session.username}</b></div>
        <button
          className="px-3 py-1 rounded bg-gray-200 text-black"
          onClick={() => {
            logout();
            toast({ title: 'Signed out' });
            location.reload();
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (!username || !postingKey || !passphrase) {
        throw new Error('Enter username, posting key, and passphrase.');
      }
      const ok = await verifyAccount(username.trim());
      if (!ok) throw new Error('Account not found');
      saveSession(username.trim(), postingKey.trim(), passphrase);
      toast({ variant: 'success', title: 'Signed in', description: `@${username.trim()}` });
      location.reload();
    } catch (e: any) {
      setErr(e.message || 'Login failed');
      toast({ variant: 'error', title: 'Login failed', description: e.message || 'Check your details.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onLogin} className="flex flex-wrap items-center gap-2">
      <input
        className="border px-2 py-1 rounded bg-white/90 text-black placeholder:text-black/60"
        placeholder="username"
        value={username}
        onChange={e=>setUsername(e.target.value)}
        autoComplete="username"
      />
      <input
        className="border px-2 py-1 rounded bg-white/90 text-black placeholder:text-black/60"
        placeholder="posting key"
        value={postingKey}
        onChange={e=>setPostingKey(e.target.value)}
        type="password"
        autoComplete="current-password"
      />
      <input
        className="border px-2 py-1 rounded bg-white/90 text-black placeholder:text-black/60"
        placeholder="passphrase (encrypts key)"
        value={passphrase}
        onChange={e=>setPassphrase(e.target.value)}
        type="password"
      />
      <button disabled={busy} className="px-3 py-1 rounded bg-black text-white">
        {busy ? '…' : 'Log in'}
      </button>
      {err && <span className="text-red-400 text-sm">{err}</span>}
    </form>
  );
}
