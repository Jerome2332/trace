'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TraceTransaction } from '@/types/transaction'

interface UseTransactionResult {
  data: TraceTransaction | null
  loading: boolean
  error: { code: string; message: string } | null
  refetch: () => void
}

export function useTransaction(signature: string, network: string): UseTransactionResult {
  const [data, setData] = useState<TraceTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)

  const fetchTx = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/transaction?sig=${encodeURIComponent(signature)}&network=${network}`)
      const json = await res.json()
      if (!res.ok) {
        setError({ code: json.error, message: json.message })
        return
      }
      setData(json.data)
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'Failed to fetch transaction. Check your connection.' })
    } finally {
      setLoading(false)
    }
  }, [signature, network])

  useEffect(() => {
    fetchTx()
  }, [fetchTx])

  return { data, loading, error, refetch: fetchTx }
}
