'use client'

import { useMemo } from 'react'

export default function VideoPlayer({ video }: { video: any }) {
  const embed = useMemo(() => getEmbedUrl(video.sourceUrl, video), [video?.sourceUrl])
  return (
    <div className="bg-card rounded-2xl overflow-hidden">
      {embed ? (
        <iframe
          src={embed}
          className="w-full aspect-video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="aspect-video grid place-items-center text-neutral-400">No preview available</div>
      )}
    </div>
  )
}

function getEmbedUrl(url: string, video: any) {
  try {
    if (!url && video?.id?.includes('/')) {
      const [author, permlink] = video.id.split('/')
      return `https://emb.d.tube/#!/${author}/${permlink}`
    }
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}`
      const parts = u.pathname.split('/')
      const i = parts.indexOf('shorts')
      if (i >= 0 && parts[i + 1]) return `https://www.youtube.com/embed/${parts[i + 1]}`
      const e = parts.indexOf('embed')
      if (e >= 0) return `https://www.youtube.com/embed/${parts[e + 1]}`
    }
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.split('/')[1]
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('rumble.com')) {
      const match = url.match(/rumble\.com\/(?:v|embed)\/?([a-z0-9]+)/i)
      if (match?.[1]) return `https://rumble.com/embed/${match[1]}/`
    }
    if (u.hostname.includes('bitchute.com')) {
      const parts = u.pathname.split('/')
      const id = parts[2]
      if (id) return `https://www.bitchute.com/embed/${id}/`
    }
    if (u.hostname.includes('odysee.com') || u.hostname.includes('lbry.tv')) {
      return `https://odysee.com/$/embed/${u.pathname.replace(/^\//, '')}`
    }
    if (u.hostname.includes('tiktok.com')) {
      return `https://www.tiktok.com/embed${u.pathname}`
    }
    if (u.hostname.includes('instagram.com')) {
      return `https://www.instagram.com${u.pathname}embed/`
    }
  } catch {}
  return ''
}
