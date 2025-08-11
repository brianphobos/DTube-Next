export type ParsedLink = {
  provider: 'youtube'|'tiktok'|'instagram'|'rumble'|'bitchute'|'odysee'|'unknown';
  normalizedUrl: string;
  thumbnail?: string;
  short?: boolean;
};

export function parseLink(raw: string): ParsedLink {
  let url = raw.trim();
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const id = youtubeId(u);
      const isShorts = u.pathname.startsWith('/shorts/');
      return {
        provider: 'youtube',
        normalizedUrl: id ? `https://www.youtube.com/watch?v=${id}` : url,
        thumbnail: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined,
        short: !!isShorts,
      };
    }

    if (host.includes('tiktok.com')) {
      return { provider: 'tiktok', normalizedUrl: url, short: true };
    }

    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      const isReel = u.pathname.startsWith('/reel/');
      return { provider: 'instagram', normalizedUrl: url, short: isReel };
    }

    if (host.includes('rumble.com')) {
      return { provider: 'rumble', normalizedUrl: url, short: false };
    }

    if (host.includes('bitchute.com')) {
      const parts = u.pathname.split('/');
      const id = parts[2];
      return { provider: 'bitchute', normalizedUrl: url, thumbnail: id ? `https://static-3.bitchute.com/live/cover_images/${id}.jpg` : undefined, short: false };
    }

    if (host.includes('odysee.com') || host.includes('lbry.tv')) {
      return { provider: 'odysee', normalizedUrl: url, short: false };
    }

    return { provider: 'unknown', normalizedUrl: url, short: false };
  } catch {
    return { provider: 'unknown', normalizedUrl: url, short: false };
  }
}

function youtubeId(u: URL) {
  if (u.hostname.includes('youtu.be')) return u.pathname.split('/')[1];
  const v = u.searchParams.get('v'); if (v) return v;
  const parts = u.pathname.split('/');
  const si = parts.indexOf('shorts'); if (si >= 0 && parts[si+1]) return parts[si+1];
  const ei = parts.indexOf('embed'); if (ei >= 0 && parts[ei+1]) return parts[ei+1];
  return null;
}
