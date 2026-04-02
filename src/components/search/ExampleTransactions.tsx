'use client'

import Link from 'next/link'
import { AlertTriangle, TrendingDown, Cpu } from 'lucide-react'

const EXAMPLES = [
  {
    label: 'Anchor constraint failure',
    icon: AlertTriangle,
    signature: '5UfDuX7hXbMjRHMWnmkXmTJvJo5ZGpR5KkEMwyfSbPfMGDmMF1hBPiVW9JLv5zQyT5xJKBFhGxqQ8GKVdGxhUVK',
  },
  {
    label: 'Jupiter slippage exceeded',
    icon: TrendingDown,
    signature: '4zBk3vM8rN6ZCsFXAiVPYqs2C5RBmDNJnxHkJFLmKdBnQEwJ3rYnVLHFdP9KUELE6QzpEjDkE2YnkzVz5GSyZJu',
  },
  {
    label: 'Compute limit exceeded',
    icon: Cpu,
    signature: '2ByBQxKfyV3AT5mFGDhJNVf6Xqp1LWf4YLHXZQ2Fsd1C9PJN7Gm5xtRZCvWPgFJeYRnpkr2JJxuXZYfFbcZnKw',
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
