'use client'

import Link from 'next/link'
import { AlertTriangle, TrendingDown, Cpu } from 'lucide-react'

const EXAMPLES = [
  {
    label: 'Insufficient funds failure',
    icon: AlertTriangle,
    signature: '5EpSxptWjZ9UeJLij61yzbpV6wLSnf8u87R4MvzgfLDZwtH6P1U4WEn8QcndniZ7d7ydcj2kNgYv9hFFobXRcbqp',
  },
  {
    label: 'Jupiter slippage exceeded',
    icon: TrendingDown,
    signature: '2L61GBxU5oGNKgPbTsnRyHoztDGMP932CywQx3DLYxA1UZQfUv66CgAqfTiLNSaV2sNghGNQW1n5X71nunqRRj3h',
  },
  {
    label: 'Jupiter route error',
    icon: Cpu,
    signature: '5p5o8zmFmh9REqAk8ogMv4hR9SbPJvpSpa3Wf3XFLfP8d7Y8VQVfWeW1MjR13nRLGGpECamK5su9B2Y8j8KdmRek',
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
