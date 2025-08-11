import { parseLink } from '@/lib/links';

function toHttps(u: string) {
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  if (u.startsWith('http://')) return 'https' + u.slice(4);
  return u;
}
function ipfsToHttp(u: string) {
  if (!u) return '';
  if (u.startsWith('ipfs://')) return 'https://cloudflare-ipfs.com/ipfs/' + u.replace(/^ipfs:\/\//, '');
  if (u.startsWith('/ipfs/')) return 'https://cloudflare-ipfs.com' + u;
  return u;
}

export function getSafeThumbFromJson(json: any): string {
  // explicit fields first
  let t = String(json?.thumbnail || json?.img || json?.image || '');
  t = toHttps(ipfsToHttp(t));
  if (t) return t;

  // derive from source/provider (e.g., YouTube)
  const source = String(json?.video?.source || json?.source || '');
  const parsed = parseLink(source);
  if (parsed.provider === 'youtube' && parsed.thumbnail) return parsed.thumbnail;

  // other dtube metadata
  t = String(json?.video?.thumbnail || '');
  return toHttps(ipfsToHttp(t)) || '';
}

export function withFallbackThumb(url?: string) {
  return url && /^https?:\/\//i.test(url) ? url : '/logo.svg';
}
