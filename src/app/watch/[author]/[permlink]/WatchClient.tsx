// src/app/watch/[author]/[permlink]/WatchClient.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getContent } from '@/lib/api';
import { useQueue } from '@/components/QueueProvider';
import { useToast } from '@/components/ToastProvider';
import ShareMenu from '@/components/ShareMenu';
import VoteButton from '@/components/VoteButton';
import AutoNextToggle, { getAutoNext } from '@/components/AutoNextToggle';
import { getSafeThumbFromJson, withFallbackThumb } from '@/lib/thumb';

type VideoLike = {
  author: string;
  permlink: string;
  title?: string;
  json?: any;
  thumbnail?: string;
};

function buildEmbedCandidates(author: string, permlink: string) {
  const a = author.replace(/^@/, '');
  return [
    // primary (dtube embed)
    `https://emb.d.tube/#!/v/${a}/${permlink}`,
    // legacy variant
    `https://emb.d.tube/#!/${a}/${permlink}`,
    // last-ditch fallback
    `https://d.tube/#!/v/${a}/${permlink}`,
  ];
}

export default function WatchClient({ video }: { video: VideoLike }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const toast = useToast();
  const { add, next, peek } = useQueue();

  // Load full post (title/json/etc) on the client
  const [full, setFull] = useState<any>(null);
  useEffect(() => {
    let cancelled = false;
    getContent(video.author, video.permlink)
      .then((v) => { if (!cancelled) { setFull(v); (window as any).__lastVideoJSON = (v as any)?.json; } })
      .catch(() => { if (!cancelled) setFull(null); });
    return () => { cancelled = true; };
  }, [video.author, video.permlink]);

  const data = full || video;
  const json = (data as any)?.json || {};
  const title = (data as any)?.title || json?.title || 'Video';

  // Embed URL with auto-fallbacks
  const [srcIndex, setSrcIndex] = useState(0);
  const embedList = useMemo(() => buildEmbedCandidates(video.author, video.permlink), [video.author, video.permlink]);
  const embUrl = embedList[srcIndex];

  useEffect(() => {
    let timedOut = false;
    const t = setTimeout(() => {
      timedOut = true;
      setSrcIndex((i) => Math.min(i + 1, embedList.length - 1));
    }, 4000);

    const onLoad = () => { if (!timedOut) clearTimeout(t); };
    const el = iframeRef.current;
    el?.addEventListener?.('load', onLoad);
    return () => { clearTimeout(t); el?.removeEventListener?.('load', onLoad as any); };
  }, [embUrl, embedList.length]);

  // Page URL (for Share + Queue)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Auto-next logic
  const durationSec = Number(json?.duration || 0);
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
      if (getAutoNext()) {
        const n = next();
        if (n) window.location.href = n.href;
      }
    }, dur * 1000);

    return () => { clearTimeout(warnT); clearTimeout(nextT); };
  }, [durationSec, json?.video?.short, json?.video?.provider, next, peek, toast]);

  // Also react to postMessages from the embed signaling "ended"
  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      try {
        const origin = new URL(embUrl).origin;
        if (ev.origin !== origin) return;
      } catch { return; }

      const d: any = ev.data;
      const tag = (typeof d === 'string') ? d.toLowerCase() :
                  (typeof d === 'object' && (d.event || d.type || d.action)) ?
                    String(d.event || d.type || d.action).toLowerCase() : '';
      if (tag.includes('ended') || tag.includes('finish')) {
        if (getAutoNext()) {
          const n = next();
          if (n) window.location.href = n.href;
        }
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [embUrl, next]);

  // Derived thumbnail (for queue item)
  const thumb = withFallbackThumb(getSafeThumbFromJson(json) || (data as any)?.thumbnail);

  function addToQueue() {
    add({
      id: `${video.author}/${video.permlink}`,
      title: title || 'Untitled',
      author: video.author,
      href: pageUrl,
      thumbnail: thumb,
    });
    toast({ variant: 'success', title: 'Added to queue' });
  }

  function goNext() {
    const n = next();
    if (n) window.location.href = n.href;
    else toast({ title: 'Queue ended' });
  }

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
        <button onClick={addToQueue} className="px-3 py-1.5 rounded-2xl border border-neutral-700">
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

