'use client'

import Link from 'next/link'
import { AlertTriangle, TrendingDown, Cpu } from 'lucide-react'

const EXAMPLES = [
  {
    label: 'Jupiter slippage exceeded',
    icon: TrendingDown,
    signature: 'xJmAM36oPJmGppGLbxLdnXXDE6qLuXUiPFUWs6CA9ogFDPVyzKwHLZpyYdQoCFzLZQcvBURdoqR5Bfm4gCBFEKr',
  },
  {
    label: 'Compute budget exceeded',
    icon: Cpu,
    signature: '5N6bHSspCzb3Qvmtpze57dpFNH46WnGYos7jKKhsFgYBRsRbVAdHGa6SvJwt7FjvWLoG3w3qoWgZpMAwGvULWPRh',
  },
  {
    label: 'Program execution failed',
    icon: AlertTriangle,
    signature: '7yKrxgQ1hGx2agfkS6bswFE3cGwRJpxMHXuciEs58UPbFjTfSxyLFEcXXywuMbrLENRSusvWMDirZv42QnAYYgA',
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
