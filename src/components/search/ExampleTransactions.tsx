'use client'

import Link from 'next/link'
import { AlertTriangle, TrendingDown, Cpu } from 'lucide-react'
import { EXAMPLE_SIGNATURES } from '@/lib/example-transactions'

const sigs = [...EXAMPLE_SIGNATURES]

const EXAMPLES = [
  {
    label: 'Jupiter slippage exceeded',
    icon: TrendingDown,
    signature: sigs[0]!,
  },
  {
    label: 'Compute budget exceeded',
    icon: Cpu,
    signature: sigs[1]!,
  },
  {
    label: 'Program execution failed',
    icon: AlertTriangle,
    signature: sigs[2]!,
  },
]

export function ExampleTransactions() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {EXAMPLES.map((ex) => {
        const Icon = ex.icon
        return (
          <Link
            key={ex.signature}
            href={`/tx/${ex.signature}?network=mainnet`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface-2 border border-border rounded-full text-xs text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            {ex.label}
          </Link>
        )
      })}
    </div>
  )
}
