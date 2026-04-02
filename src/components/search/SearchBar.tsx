'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import { extractSignatureFromUrl, validateSignature } from '@/lib/signature-validator'

interface SearchBarProps {
  defaultValue?: string
  size?: 'hero' | 'compact'
  autoFocus?: boolean
}

export function SearchBar({ defaultValue = '', size = 'hero', autoFocus = false }: SearchBarProps) {
  const [input, setInput] = useState(defaultValue)
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const sig = extractSignatureFromUrl(input)
    if (!sig) {
      setError("That doesn't look like a valid Solana transaction signature.")
      return
    }

    if (!validateSignature(sig)) {
      setError("That doesn't look like a valid Solana transaction signature.")
      return
    }

    const network = typeof window !== 'undefined'
      ? localStorage.getItem('trace:network') ?? 'mainnet'
      : 'mainnet'

    router.push(`/tx/${sig}?network=${network}`)
  }

  const isCompact = size === 'compact'

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex items-center gap-2 bg-bg-surface-2 border border-border rounded-lg transition-colors focus-within:border-border-active ${isCompact ? 'px-3 py-1.5' : 'px-4 py-3'}`}>
        <Search className={`text-text-tertiary shrink-0 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a transaction signature..."
          autoFocus={autoFocus}
          className={`flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary font-mono ${isCompact ? 'text-sm' : 'text-base'}`}
        />
        <button
          type="submit"
          className={`shrink-0 bg-accent hover:bg-accent-hover text-white rounded-md font-medium transition-colors flex items-center gap-1.5 ${isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
        >
          {isCompact ? <ArrowRight className="w-3.5 h-3.5" /> : <>Analyze <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-error text-sm">{error}</p>
      )}
    </form>
  )
}
