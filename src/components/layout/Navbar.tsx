'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import CommandSearchModal from './CommandSearchModal'

const links = [
  { href: '/models', label: 'Explore' },
  { href: '/compare', label: 'Compare' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/directory', label: 'Directory' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                OA
              </span>
              <span>OneAtlas</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm transition ${
                      active
                        ? 'bg-zinc-900 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200 sm:flex"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
              <span>Search models</span>
              <kbd className="ml-2 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                Ctrl K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex rounded-md border border-zinc-800 bg-zinc-900/60 p-2 text-zinc-400 hover:text-zinc-200 sm:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex rounded-md border border-zinc-800 bg-zinc-900/60 p-2 text-zinc-400 hover:text-zinc-200 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-zinc-800 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm ${
                      active ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      <CommandSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
