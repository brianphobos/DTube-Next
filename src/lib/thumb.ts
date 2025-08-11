import { parseLink } from './links';

export function getSafeThumbFromJson(json: any): string {
  // Prefer explicit thumbnail if present
  let t = json?.thumbnail || json?.img || '';
  if (typeof t === 'string' && t) {
    // normalize http -> https (YouTube thumbs require https for Next image)
    try {
      const u = new URL(t, 'https://dummy.invalid');
      if (u.protocol === 'http:') t = 'https:' + t.slice(5);
    } catch { /* ignore */ }
    return t;
  }

  // Try deriving from provider/source
  const source = json?.video?.source || json?.source || '';
  if (typeof source === 'string' && source) {
    const parsed = parseLink(source);
    if (parsed.provider === 'youtube') {
      // ensures we always have a clean https thumbnail
      return parsed.thumbnail || '';
    }
  }
  return '';
}

export function withFallbackThumb(url?: string): string {
  if (url && /^https?:\/\//i.test(url)) return url;
  return '/logo.svg';
}
