'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getContent } from '@/lib/api';
import { useQueue } from '@/components/QueueProvider';
import { useToast } from '@/components/ToastProvider';
import ShareMenu from '@/components/ShareMenu';
import VoteButton from '@/components/VoteButton';
import AutoNextToggle, { getAutoNext } from '@/components/AutoNextToggle';
import { getSafeThumbFromJson, withFallbackThumb } from '@/lib/thumb';
import { parseLink } from '@/lib/links';

type VideoLike = {
  author: string;
  permlink: string;
  title?: string;
  json?: any;
  thumbnail?: string;
};

function buildYouTubeEmbed(id: string) {
  // modest branding + inline playback
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
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
      .then((v) => {
        if (!cancelled) {
          setFull(v);
          (window as any).__lastVideoJSON = (v as any)?.json;
        }
      })
      .catch(() => { if (!cancelled) setFull(null); });
    return () => { cancelled = true; };
  }, [video.author, video.permlink]);

  const data = full || video;
  const json = (data as any)?.json || {};
  const title = (data as any)?.title || json?.title || 'Video';

  // Determine provider & build embed URL (YouTube only for now)
  const source = String(json?.video?.source || json?.source || '');
  const parsed = useMemo(() => parseLink(source), [source]);
  const youtubeId = parsed.provider === 'youtube' ? (new URL(parsed.normalizedUrl).searchParams.get('v') || parsed.normalizedUrl.split('/').pop() || '') : '';
  const canPlayInline = parsed.provider === 'youtube' && !!youtubeId;
  const embedSrc = canPlayInline ? buildYouTubeEmbed(youtubeId as string) : '';

  // Page URL (for Share + Queue)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Auto-next logic (time-based; we can’t read YT time without postMessage API wiring)
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
      <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        {canPlayInline ? (
          <iframe
            ref={iframeRef}
            src={embedSrc}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="p-6 text-center">
            <div className="text-white font-medium mb-2">This video can’t be embedded here (provider: {parsed.provider}).</div>
            {source ? (
              <a className="inline-block px-3 py-1.5 rounded-2xl bg-white text-black font-medium"
                 href={source} target="_blank" rel="noopener noreferrer">
                Open original source
              </a>
            ) : (
              <div className="text-neutral-400 text-sm">No source URL found in post metadata.</div>
            )}
          </div>
        )}
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
