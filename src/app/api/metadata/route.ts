import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const ytId = extractYouTubeId(url)
    const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : ''

    return NextResponse.json({
      normalizedUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : url,
      thumbnail: thumb,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 })
  }
}

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v') as string
      const parts = u.pathname.split('/')
      const i = parts.indexOf('embed')
      if (i >= 0) return parts[i + 1]
      if (parts[1] === 'shorts' && parts[2]) return parts[2]
    }
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.split('/')[1]
    }
  } catch {}
  return null
}
