import { NextResponse } from 'next/server';
import { getAvalon } from '@/lib/avalon';

export async function GET(_req: Request, { params }: { params: { username: string } }) {
  const { searchParams } = new URL(_req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 50);
  const start_link = searchParams.get('start_link');

  const javalon = await getAvalon();

  const items: any[] = await new Promise((resolve, reject) => {
    const cb = (err: any, res: any[]) => (err ? reject(err) : resolve(res || []));
    try {
      (javalon as any).getDiscussionsByAuthor(params.username, { limit, start_link }, cb);
    } catch {
      (javalon as any).getDiscussionsByAuthor(params.username, null, null, cb);
    }
  });

  const mapped = items.map((c: any) => ({
    id: `${c.author}/${c.link}`,
    title: c.title || c?.json?.title || 'Untitled',
    author: c.author,
    thumbnail: c?.json?.thumbnail || c?.json?.img || '/logo.svg',
    views: Number(c.dist || 0),
    link: c.link,
  }));

  const next = mapped.length >= limit ? { start_link: mapped[mapped.length - 1].link } : null;

  return NextResponse.json({ items: mapped, next });
}
