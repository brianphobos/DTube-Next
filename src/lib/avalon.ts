// src/lib/avalon.ts
export const AVALON_NODE = process.env.NEXT_PUBLIC_AVALON_API || 'https://dtube.fso.ovh';
let cached: any = null;

export async function getAvalon() {
  if (typeof window === 'undefined') {
    throw new Error('getAvalon() is client-only. Call it from a "use client" component.');
  }
  if (cached) return cached;
  const mod: any = await import('javalon');
  const javalon = mod.default || mod;
  if (javalon.setServer) javalon.setServer(AVALON_NODE);
  if (javalon.config) javalon.config.api = AVALON_NODE;
  cached = javalon;
  return javalon;
}
