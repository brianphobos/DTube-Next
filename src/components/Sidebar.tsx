import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-56 border-r border-neutral-900 p-4 space-y-2">
      <Section title="Explore">
        <Nav href="/" label="Trending" />
        <Nav href="/?sort=new" label="New" />
        <Nav href="/?sort=subs" label="Subscriptions" />
      </Section>
      <Section title="Categories">
        <Nav href="/?tag=tech" label="Tech" />
        <Nav href="/?tag=gaming" label="Gaming" />
        <Nav href="/?tag=news" label="News" />
      </Section>
    </aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">{title}</div>
      <div className="grid gap-1">{children}</div>
    </div>
  )
}

function Nav({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-xl hover:bg-soft text-sm text-neutral-200">{label}</Link>
  )
}
