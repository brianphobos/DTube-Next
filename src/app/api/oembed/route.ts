import { NextResponse } from 'next/server';

const OEMBED = [
  { match: /youtube\.com|youtu\.be/i, url: (u: string) => `https://www.youtube.com/oembed?url=${encodeURIComponent(u)}&format=json` },
  { match: /tiktok\.com/i, url: (u: string) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(u)}` },
  { match: /instagram\.com|instagr\.am/i, url: (u: string) => `https://graph.facebook.com/v17.0/instagram_oembed?url=${encodeURIComponent(u)}&omitscript=true` },
];

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    const provider = OEMBED.find(p => p.match.test(url));
    if (!provider) return NextResponse.json({ error: 'No oEmbed provider' }, { status: 404 });
    const res = await fetch(provider.url(url), { next: { revalidate: 60 } });
    if (!res.ok) return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: res.status });
    const json = await res.json();
    return NextResponse.json({
      title: json.title || '',
      thumbnail_url: json.thumbnail_url || json.thumbnail_url_with_play_button || '',
      author_name: json.author_name || '',
      width: json.width || null,
      height: json.height || null,
      html: json.html || '',
      provider_name: json.provider_name || '',
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
