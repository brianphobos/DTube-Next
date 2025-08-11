import CryptoJS from 'crypto-js';
import { getAvalon } from './avalon';

const LS_USER = 'dtube_user';
const LS_ENC_PK = 'dtube_enc_pk';

export type Session = { username: string } | null;

export function getSession(): Session {
  if (typeof window === 'undefined') return null;
  const username = localStorage.getItem(LS_USER);
  return username ? { username } : null;
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_USER);
  localStorage.removeItem(LS_ENC_PK);
}

export function isLoggedIn() {
  return !!getSession();
}

export function saveSession(username: string, postingKey: string, passphrase: string) {
  if (!username || !postingKey || !passphrase) throw new Error('Missing login fields');
  const enc = CryptoJS.AES.encrypt(postingKey, passphrase).toString();
  localStorage.setItem(LS_USER, username);
  localStorage.setItem(LS_ENC_PK, enc);
}

export function loadPostingKey(passphrase: string): string | null {
  const enc = localStorage.getItem(LS_ENC_PK);
  if (!enc) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(enc, passphrase);
    const pk = bytes.toString(CryptoJS.enc.Utf8);
    return pk || null;
  } catch {
    return null;
  }
}

export async function verifyAccount(username: string): Promise<boolean> {
  const javalon = await getAvalon();
  return new Promise((resolve) => {
    (javalon as any).getAccount(username, (_e: any, a: any) => resolve(!!a));
  });
}

export async function broadcastVote(
  voter: string,
  postingKey: string,
  author: string,
  permlink: string,
  weight: number
) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).broadcast.vote(
      postingKey,
      voter,
      author,
      permlink,
      weight,
      (err: any, res: any) => (err ? reject(err) : resolve(res))
    );
  });
}

export async function broadcastComment(
  author: string,
  postingKey: string,
  parentAuthor: string,
  parentPermlink: string,
  permlink: string,
  title: string,
  body: string,
  json: any = {}
) {
  const javalon = await getAvalon();
  return new Promise((resolve, reject) => {
    (javalon as any).broadcast.comment(
      postingKey,
      author,
      parentAuthor,
      parentPermlink,
      permlink,
      title,
      body,
      json,
      (err: any, res: any) => (err ? reject(err) : resolve(res))
    );
  });
}
