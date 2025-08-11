export const AVALON_NODE = process.env.NEXT_PUBLIC_AVALON_API || 'https://avalon.d.tube';

let cached: any = null;

export async function getAvalon() {
  if (cached) return cached;
  const mod: any = await import('javalon');
  const javalon = mod.default || mod;
  if (javalon.setServer) javalon.setServer(AVALON_NODE);
  if (javalon.config) javalon.config.api = AVALON_NODE;
  cached = javalon;
  return javalon;
}
