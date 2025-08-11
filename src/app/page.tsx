import VideoCard from '@/components/VideoCard'
import { getHotDiscussions } from '@/lib/api'

export default async function Home() {
  const items: any = await getHotDiscussions(24 as any)
  const videos = (items || []).map((c: any) => ({
    id: `${c.author}/${c.link}`,
    title: c.title || c?.json?.title || 'Untitled',
    author: c.author,
    thumbnail: c?.json?.thumbnail || c?.json?.img || '/logo.svg',
    views: Number(c.dist || 0),
  }))

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v: any) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  )
}
