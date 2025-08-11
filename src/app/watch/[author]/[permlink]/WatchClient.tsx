// src/app/watch/[author]/[permlink]/WatchClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getContent } from '@/lib/api';
import { useQueue } from '@/components/QueueProvider';
import { useToast } from '@/components/ToastProvider';
import ShareMenu from '@/components/ShareMenu';
import VoteButton from '@/components/VoteButton';
import AutoNextToggle, { getAutoNext } from '@/components/AutoNextToggle';

type VideoLike = {
  author: string;
  permlink: string;
  title?: string;
  json?: any;
  thumbnail?: string;
};

export default function WatchClient({ video }: { video: VideoLike }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const toast = useToast();
  const { add, next, peek } = useQueue();

  // Load full content on the client
  const [full, setFull] = useState<any>(null);
  useEffect(() => {
    let cancelled = false;
    getContent(video.author, video.permlink)
      .then((v) => { if (!cancelled) setFull(v); })
      .catch(() => { if (!cancelled) setFull(null); });
    return () => { cancelled = true; };
  }, [video.author, video.permlink]);

  const data = full || video;
  const title = (data as any)?.title || 'Video';
  const json = (data as any)?.json || {};
  const embUrl = useMemo(
    () => `https://emb.d.tube/#!/${video.author}/${video.permlink}`,
    [video.author, video.permlink]
  );
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const durationSec = Number(json?.duration || 0);
  const [autoNextEnabled, setAutoNextEnabled] = useState(getAutoNext());

  useEffect(() => {
    const sync = () => setAutoNextEnabled(getAutoNext());
    const id = setInterval(sync, 500);
    return () => clearInterval(id);
  }, []);

  function goNext() {
    const n = next();
    if (n) window.location.href = n.href;
    else toast({ title: 'Queue ended' });
  }

  // Listen for "ended" postMessages from the DTube embed
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      try {
        const origin = new URL(embUrl).origin;
        if (ev.origin !== origin) return;
      } catch { return; }

      const data: any = ev.data;
      const tag = (typeof data === 'string') ? data.toLowerCase() :
                  (typeof data === 'object' && (data.event || data.type || data.action)) ?
                    String(data.event || data.type || data.action).toLowerCase() : '';

      if (tag.includes('ended') || tag.includes('finish') || tag.includes('endedplayback')) {
        if (getAutoNext()) goNext();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [embUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Time-based auto-next fallback if the embed doesn't postMessage
  useEffect(() => {
    if (!getAutoNext()) return;
    const isShort = !!json?.video?.short || /shorts|tiktok|reel/i.test(String(json?.video?.provider || ''));
    const assumed = isShort ? 180 : 480;
    const dur = durationSec > 30 ? durationSec : assumed;

    const warnAt = Math.max(0, dur - 10) * 1000;
    const warnT = setTimeout(() => {
      const n = peek();
      if (n) toast({ title: 'Up next', description: n.title });
    }, warnAt);

    const nextT = setTimeout(() => {
      if (getAutoNext()) goNext();
    }, dur * 1000);

    return () => { clearTimeout(warnT); clearTimeout(nextT); };
  }, [durationSec, json?.video?.short, json?.video?.provider]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src={embUrl}
          className="w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            add({
              id: `${video.author}/${video.permlink}`,
              title: title || 'Untitled',
              author: video.author,
              href: pageUrl,
              thumbnail: json?.thumbnail || (data as any)?.thumbnail,
            });
            toast({ variant: 'success', title: 'Added to queue' });
          }}
          className="px-3 py-1.5 rounded-2xl border border-neutral-700"
        >
          ＋ Add to queue
        </button>

        <button onClick={goNext} className="px-3 py-1.5 rounded-2xl bg-white text-black">Next ▶</button>

        <ShareMenu url={pageUrl} title={title || 'Video'} />
        <div className="ml-auto"><AutoNextToggle /></div>
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="text-sm text-neutral-400 mt-1">
          by <a className="hover:underline" href={`/@${video.author}`}>@{video.author}</a>
        </div>
        <div className="mt-4">
          <VoteButton author={video.author} permlink={video.permlink} />
        </div>
      </div>
    </div>
  );
}

