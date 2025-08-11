import { parseLink } from './links';

function normalizeHttps(url: string) {
  if (!url) return '';
  // add protocol if missing (starts with //)
  if (/^\/\//.test(url)) return 'https:' + url;
  // fix http -> https
  if (/^http:\/\//i.test(url)) return 'https' + url.slice(4);
  return url;
}

function ipfsToHttp(u: string) {
  if (!u) return '';
  // supports ipfs://<cid>[/path] and /ipfs/<cid>...
  if (/^ipfs:\/\//i.test(u)) return 'https://cloudflare-ipfs.com/ipfs/' + u.replace(/^ipfs:\/\//i, '');
  if (/^\/ipfs\//i.test(u)) return 'https://cloudflare-ipfs.com' + u;
  return u;
}

export function getSafeThumbFromJson(json: any): string {
  // 1) explicit fields
  let t = json?.thumbnail || json?.img || json?.image || '';
  t = ipfsToHttp(normalizeHttps(String(t || '')));
  if (t) return t;

  // 2) derive from source/provider (e.g., YouTube)
  const source = String(json?.video?.source || json?.source || '');
  const parsed = parseLink(source);
  if (parsed.provider === 'youtube' && parsed.thumbnail) return parsed.thumbnail;

  // 3) some DTube metadata stores nested url
  const nested = String(json?.video?.thumbnail || '');
  t = ipfsToHttp(normalizeHttps(nested));
  return t || '';
}

export function withFallbackThumb(url?: string): string {
  return url && /^https?:\/\//i.test(url) ? url : '/logo.svg';
}
