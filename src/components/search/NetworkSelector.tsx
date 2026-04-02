'use client'

import { useState, useEffect } from 'react'

type Network = 'mainnet' | 'devnet' | 'testnet'
const NETWORKS: Network[] = ['mainnet', 'devnet', 'testnet']

export function NetworkSelector() {
  const [network, setNetwork] = useState<Network>('mainnet')

  useEffect(() => {
    const saved = localStorage.getItem('trace:network') as Network | null
    if (saved && NETWORKS.includes(saved)) {
      setNetwork(saved)
    }
  }, [])

  function handleChange(n: Network) {
    setNetwork(n)
    localStorage.setItem('trace:network', n)
  }

  return (
    <div className="flex items-center bg-bg-surface-2 rounded-md border border-border p-0.5 text-xs">
      {NETWORKS.map((n) => (
        <button
          key={n}
          onClick={() => handleChange(n)}
          className={`px-2.5 py-1 rounded transition-colors capitalize ${
            network === n
              ? 'bg-bg-surface-3 text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
