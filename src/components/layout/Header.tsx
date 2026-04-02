'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SearchBar } from '../search/SearchBar'
import { NetworkSelector } from '../search/NetworkSelector'

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <header className="h-14 bg-bg-surface border-b border-border flex items-center px-4 gap-4">
      <Link href="/" className="flex items-center gap-1 shrink-0">
        <span className="font-mono text-lg text-text-primary font-semibold tracking-tight">
          trace
        </span>
        <span className="text-accent text-lg font-bold">.</span>
      </Link>

      {!isHome && (
        <div className="flex-1 max-w-md">
          <SearchBar size="compact" />
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <NetworkSelector />
      </div>
    </header>
  )
}
