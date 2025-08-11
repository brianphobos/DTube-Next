import { getAvalon } from './avalon';

/** Make a URL-safe permlink (unique-ish) */
export function makePermlink(title: string) {
  const base = (title || 'video')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'video';
  return `${base}-${Date.now().toString(36)}`;
}

export async function broadcastPost(params: {
  postingKey: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  tags?: string[];
  json: any;
}) {
  const { postingKey, author, permlink, title, body, json, tags = ['dtube'] } = params;
  const javalon = await getAvalon();
  const meta = { ...json, tags };

  return new Promise((resolve, reject) => {
    (javalon as any).broadcast.comment(
      postingKey,
      author,
      '',
      tags[0] || 'dtube',
      permlink,
      title,
      body,
      meta,
      (err: any, res: any) => (err ? reject(err) : resolve(res))
    );
  });
}
