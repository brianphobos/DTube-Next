import { getAvalon } from './avalon';

/** HOT (popular). `limit` is sliced client-side. */
export async function getHotDiscussions(limit = 25, start_author?: string | null, start_permlink?: string | null) {
  const javalon = await getAvalon();
  return new Promise<any[]>((resolve, reject) => {
    try {
      (javalon as any).getHotDiscussions(start_author || null, start_permlink || null, (err: any, res: any[]) =>
        err ? reject(err) : resolve((res || []).slice(0, limit))
      );
    } catch (e) {
      reject(e);
    }
  });
}

/** NEW (by creation time). */
export async function getNewDiscussions(limit = 25, start_author?: string | null, start_permlink?: string | null) {
  const javalon = await getAvalon();
  return new Promise<any[]>((resolve, reject) => {
    (javalon as any).getNewDiscussions(start_author || null, start_permlink || null, (err: any, res: any[]) =>
      err ? reject(err) : resolve((res || []).slice(0, limit))
    );
  });
}

/** FEED (followed accounts of `username`). */
export async function getFeedDiscussions(username: string, limit = 25, start_permlink?: string | null) {
  const javalon = await getAvalon();
  return new Promise<any[]>((resolve, reject) => {
    (javalon as any).getFeedDiscussions(username, start_permlink || null, (err: any, res: any[]) =>
      err ? reject(err) : resolve((res || []).slice(0, limit))
    );
  });
}

/** Single content. */
export async function getContent(author: string, permlink: string) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).getContent(author, permlink, (err: any, res: any) =>
      err ? reject(err) : resolve(res)
    );
  });
}

/** Replies. */
export async function getContentReplies(author: string, permlink: string) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).getContentReplies(author, permlink, (err: any, res: any) =>
      err ? reject(err) : resolve(res)
    );
  });
}

/** Single account. */
export async function getAccount(username: string) {
  const javalon = await getAvalon();
  return new Promise((resolve) => {
    (javalon as any).getAccount(username, (_e: any, a: any) => resolve(a || null));
  });
}

/** Author’s posts. */
export async function getDiscussionsByAuthor(username: string, limit = 24, start_permlink?: string | null) {
  const javalon = await getAvalon();
  return new Promise<any[]>((resolve, reject) => {
    (javalon as any).getDiscussionsByAuthor(username, start_permlink || null, (err: any, res: any[]) =>
      err ? reject(err) : resolve((res || []).slice(0, limit))
    );
  });
}

/** Followers count (fallback to 0 if method not present). */
export async function getFollowersCount(username: string) {
  const javalon = await getAvalon();
  return new Promise<number>((resolve) => {
    if (!(javalon as any).getFollowers) return resolve(0);
    (javalon as any).getFollowers(username, ( _e: any, list: any[]) => {
      resolve(Array.isArray(list) ? list.length : 0);
    });
  });
}
