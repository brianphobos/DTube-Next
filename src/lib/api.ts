import { getAvalon } from './avalon';

export async function getHotDiscussions(limit = 25, start_author?: string, start_permlink?: string) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    try {
      (javalon as any).getHotDiscussions({ limit, start_author, start_permlink }, (err: any, res: any) =>
        err ? reject(err) : resolve(res)
      );
    } catch (e) {
      (javalon as any).getHotDiscussions(null, null, (err: any, res: any) => err ? reject(err) : resolve(res));
    }
  });
}

export async function getNewDiscussions(limit = 25) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    try {
      (javalon as any).getNewDiscussions({ limit }, (err: any, res: any) => err ? reject(err) : resolve(res));
    } catch {
      (javalon as any).getNewDiscussions(null, null, (err: any, res: any) => err ? reject(err) : resolve(res));
    }
  });
}

export async function getFeedDiscussions(username: string, limit = 25) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    try {
      (javalon as any).getFeedDiscussions(username, { limit }, (err: any, res: any) => err ? reject(err) : resolve(res));
    } catch {
      (javalon as any).getFeedDiscussions(username, null, null, (err: any, res: any) => err ? reject(err) : resolve(res));
    }
  });
}

export async function getContent(author: string, permlink: string) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).getContent(author, permlink, (err: any, res: any) =>
      err ? reject(err) : resolve(res)
    );
  });
}

export async function getContentReplies(author: string, permlink: string) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).getContentReplies(author, permlink, (err: any, res: any) =>
      err ? reject(err) : resolve(res)
    );
  });
}

export async function getAccount(username: string) {
  const javalon = await getAvalon();
  return new Promise((resolve) => {
    (javalon as any).getAccount(username, (_e: any, a: any) => resolve(a || null));
  });
}

export async function getDiscussionsByAuthor(username: string, limit = 24) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    const cb = (err: any, res: any) => (err ? reject(err) : resolve(res));
    try {
      (javalon as any).getDiscussionsByAuthor(username, { limit }, cb);
    } catch {
      (javalon as any).getDiscussionsByAuthor(username, null, null, cb);
    }
  });
}

export async function getFollowersCount(username: string) {
  const javalon = await getAvalon();
  return new Promise<number>((resolve) => {
    if (!(javalon as any).getFollowers) return resolve(0);
    (javalon as any).getFollowers(username, null, 1000, (_e: any, list: any[]) => {
      resolve(Array.isArray(list) ? list.length : 0);
    });
  });
}
