'use client';
import { useEffect, useMemo, useState } from 'react';
import { getContentReplies } from '@/lib/api';
import { broadcastComment, getSession, loadPostingKey } from '@/lib/auth';
import { useToast } from '@/components/ToastProvider';

type Reply = {
  author: string;
  permlink: string;
  body: string;
  created?: string;
};

export default function Comments({ author, permlink }: { author: string; permlink: string }) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const session = getSession();
  const toast = useToast();

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r: any = await getContentReplies(author, permlink);
      setReplies(Array.isArray(r) ? r : []);
    } catch (e: any) {
      setErr(e.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [author, permlink]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { setErr('Please log in to comment.'); return; }
    if (!body.trim()) return;
    try {
      const key = loadPostingKey(passphrase);
      if (!key) throw new Error('Bad passphrase or no key stored');

      const childPermlink = `re-${permlink}-${Date.now().toString(36)}`;
      await broadcastComment(
        session.username,
        key,
        author,
        permlink,
        childPermlink,
        '',
        body.trim(),
        { app: 'dtube-next' }
      );
      setBody('');
      toast({ variant: 'success', title: 'Comment posted' });
      await load();
    } catch (e: any) {
      setErr(e.message || 'Comment failed');
    }
  }

  const sorted = useMemo(
    () => [...replies].sort((a: any, b: any) => (a?.created || '').localeCompare(b?.created || '')),
    [replies]
  );

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-3">Comments</h3>
      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      {!loading && sorted.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
      <ul className="space-y-4">
        {sorted.map((c: any) => (
          <li key={c.permlink} className="border rounded p-3">
            <div className="text-sm text-gray-600 mb-1">@{c.author}</div>
            <div className="whitespace-pre-wrap">{c.body}</div>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-6 space-y-2">
        <textarea
          className="w-full border rounded p-2 min-h-[100px] text-black"
          placeholder="Write a comment…"
          value={body}
          onChange={e=>setBody(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="passphrase"
            className="border px-2 py-1 rounded text-black"
            value={passphrase}
            onChange={(e)=>setPassphrase(e.target.value)}
          />
          <button className="px-3 py-1 rounded bg-black text-white">Post</button>
        </div>
      </form>
    </div>
  );
}
