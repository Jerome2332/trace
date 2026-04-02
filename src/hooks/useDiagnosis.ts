'use client'

import { useState, useCallback } from 'react'
import type { Diagnosis } from '@/types/diagnosis'

interface UseDiagnosisResult {
  diagnosis: Diagnosis | null
  loading: boolean
  error: string | null
  cached: boolean
  fetch: () => void
}

export function useDiagnosis(signature: string, network: string): UseDiagnosisResult {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cached, setCached] = useState(false)

  const fetchDiagnosis = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature, network }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message ?? 'Failed to generate diagnosis.')
        return
      }
      setDiagnosis(json.diagnosis)
      setCached(json.cached ?? false)
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [signature, network])

  return { diagnosis, loading, error, cached, fetch: fetchDiagnosis }
}
