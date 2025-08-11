'use client';
import { useEffect, useState } from 'react';
import { parseLink } from '@/lib/links';
import { getSession, loadPostingKey } from '@/lib/auth';
import { broadcastPost, makePermlink } from '@/lib/post';
import { useToast } from '@/components/ToastProvider';

async function fetchOEmbed(url: string) {
  const res = await fetch('/api/oembed', { method: 'POST', body: JSON.stringify({ url }) });
  if (!res.ok) return null;
  return res.json();
}

export default function UploadPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [thumb, setThumb] = useState('');
  const [isShort, setIsShort] = useState(false);
  const [provider, setProvider] = useState('unknown');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let ignore = false;

    async function run(u: string) {
      const parsed = parseLink(u);
      if (ignore) return;
      setProvider(parsed.provider);
      setIsShort(!!parsed.short);
      setThumb(parsed.thumbnail || '');

      if (!parsed.thumbnail && ['tiktok','instagram','youtube'].includes(parsed.provider)) {
        const data = await fetchOEmbed(parsed.normalizedUrl);
        if (!ignore && data?.thumbnail_url) setThumb(data.thumbnail_url);
        if (!ignore && !title && data?.title) setTitle(data.title);
      }
    }

    if (url) run(url);
    return () => { ignore = true; };
  }, [url, title]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const session = getSession();
      if (!session) throw new Error('Please log in first.');
      const passphrase = prompt('Enter your passphrase to decrypt your posting key') || '';
      if (!passphrase) throw new Error('Passphrase required');
      const postingKey = loadPostingKey(passphrase);
      if (!postingKey) throw new Error('Bad passphrase or missing key');

      const parsed = parseLink(url);
      const permlink = makePermlink(title || parsed.normalizedUrl);
      const bodyMd = (desc || '').trim() || `${parsed.normalizedUrl}`;
      const json = {
        app: 'dtube-next',
        video: { provider: parsed.provider, source: parsed.normalizedUrl, short: isShort },
        thumbnail: thumb || undefined,
        title,
        description: desc,
      };

      await broadcastPost({ postingKey, author: session.username, permlink, title: title || 'New video', body: bodyMd, tags: ['dtube'], json });
      toast({ variant: 'success', title: 'Posted', description: 'Your video is live!' });
      location.href = `/watch/${session.username}/${permlink}`;
    } catch (err: any) {
      toast({ variant: 'error', title: 'Submit failed', description: err.message || 'Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Submit a Video</h1>
      <form onSubmit={onSubmit} className="space-y-4 bg-card p-4 rounded-2xl">
        <div>
          <label className="block text-sm text-neutral-300 mb-1">Video URL</label>
          <input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://..." className="w-full bg-soft rounded-xl p-3 outline-none" />
          <p className="text-xs text-neutral-400 mt-1">YouTube/Shorts, TikTok, Instagram Reels, Rumble, BitChute, Odysee supported.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-soft rounded-xl p-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Provider</label>
            <input readOnly value={provider} className="w-full bg-soft rounded-xl p-3 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-1">Description</label>
          <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} rows={4} className="w-full bg-soft rounded-xl p-3 outline-none" />
        </div>

        <div className="flex items-center gap-3">
          <input id="short" type="checkbox" checked={isShort} onChange={(e)=>setIsShort(e.target.checked)} />
          <label htmlFor="short" className="text-sm text-neutral-300">Short (vertical)</label>
        </div>

        {thumb && (
          <div>
            <label className="block text-sm text-neutral-300 mb-2">Detected Thumbnail</label>
            <img src={thumb} alt="thumbnail" className="w-full max-w-md rounded-xl" />
          </div>
        )}

        <button disabled={busy} className="bg-white text-black rounded-2xl px-4 py-2 font-medium hover:opacity-90">
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
