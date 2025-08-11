'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LoginForm from './LoginForm'

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/80 bg-bg/90 border-b border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-14 flex items-center gap-4">
        <Link href="/" className="font-semibold tracking-tight text-lg">DTube</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Tab href="/" label="Trending" active={pathname === '/'} />
          <Tab href="/?sort=new" label="New" active={pathname?.includes('sort=new') ?? false} />
          <Tab href="/upload" label="Upload" active={pathname?.startsWith('/upload') ?? false} />
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <input placeholder="Search" className="bg-soft rounded-full px-4 py-1.5 text-sm outline-none" />
          <LoginForm />
        </div>
      </div>
    </header>
  )
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-full hover:bg-soft ${active ? 'bg-soft' : ''}`}>{label}</Link>
  )
}
