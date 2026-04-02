'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Diagnosis } from '@/types/diagnosis'
import { DiagnosisContent } from './DiagnosisContent'
import { DiagnosisLoading } from './DiagnosisLoading'

interface DiagnosisPanelProps {
  signature: string
  network: string
  isFailed: boolean
}

export function DiagnosisPanel({ signature, network, isFailed }: DiagnosisPanelProps) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(isFailed)

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
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [signature, network])

  useEffect(() => {
    if (isFailed) {
      setExpanded(true)
      fetchDiagnosis()
    }
  }, [isFailed, fetchDiagnosis])

  const handleAnalyze = () => {
    setExpanded(true)
    fetchDiagnosis()
  }

  const toggleExpanded = () => {
    if (diagnosis || loading || error) {
      setExpanded((prev) => !prev)
    }
  }

  return (
    <div className="w-full rounded-lg border border-border bg-bg-surface overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpanded() }}
        className="flex w-full items-center justify-between px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-text-primary">
            AI Diagnosis
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!diagnosis && !loading && !error && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleAnalyze()
              }}
              className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Analyze with AI
            </button>
          )}
          {(diagnosis || loading || error) && (
            expanded
              ? <ChevronDown className="h-4 w-4 text-text-tertiary" />
              : <ChevronRight className="h-4 w-4 text-text-tertiary" />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {loading && <DiagnosisLoading />}

              {error && !loading && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-error">{error}</span>
                  <button
                    type="button"
                    onClick={fetchDiagnosis}
                    className="rounded-md border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Retry
                  </button>
                </div>
              )}

              {diagnosis && !loading && (
                <DiagnosisContent diagnosis={diagnosis} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
