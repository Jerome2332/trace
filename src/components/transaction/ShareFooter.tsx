'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface ShareFooterProps {
  signature: string
  network: string
}

function getClusterParam(network: string): string {
  if (network === 'devnet') return '?cluster=devnet'
  if (network === 'testnet') return '?cluster=testnet'
  return ''
}

export function ShareFooter({ signature, network }: ShareFooterProps) {
  const [copied, setCopied] = useState(false)

  const clusterParam = getClusterParam(network)
  const solscanUrl = `https://solscan.io/tx/${signature}${clusterParam}`
  const explorerUrl = `https://explorer.solana.com/tx/${signature}${clusterParam}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 px-4 pb-4">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copy link</span>
          </>
        )}
      </button>

      <a
        href={solscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        <span>Open in Solscan</span>
      </a>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        <span>Open in Solana Explorer</span>
      </a>
    </div>
  )
}
