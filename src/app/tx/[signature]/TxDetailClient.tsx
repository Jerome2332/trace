'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { TxStatusBar } from '@/components/transaction/TxStatusBar'
import { TxLoading } from '@/components/transaction/TxLoading'
import { TxNotFound } from '@/components/transaction/TxNotFound'
import { TxError } from '@/components/transaction/TxError'
import { CpiTree } from '@/components/cpi-tree/CpiTree'
import { LogStream } from '@/components/logs/LogStream'
import { AccountDiffTable } from '@/components/account-diff/AccountDiffTable'
import { DiagnosisPanel } from '@/components/diagnosis/DiagnosisPanel'
import { ShareFooter } from '@/components/transaction/ShareFooter'
import { MobileTabs } from '@/components/transaction/MobileTabs'
import { TxSuccessSummary } from '@/components/transaction/TxSuccessSummary'
import type { TraceTransaction } from '@/types/transaction'

interface TxDetailClientProps {
  signature: string
  network: string
}

export function TxDetailClient({ signature, network }: TxDetailClientProps) {
  const [data, setData] = useState<TraceTransaction | null>(null)
  const [error, setError] = useState<{ code: string; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTx = useCallback(async () => {
    setLoading(true)
    setError(null)

    const cacheKey = `trace:tx:${signature}:${network}`

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        setData(JSON.parse(cached) as TraceTransaction)
        setLoading(false)
        return
      }
    } catch {
      // sessionStorage unavailable or corrupt, continue to fetch
    }

    try {
      const res = await fetch(`/api/transaction?sig=${signature}&network=${network}`)
      const json = await res.json()
      if (!res.ok) {
        setError({ code: json.error, message: json.message })
        return
      }
      setData(json.data)
      try { sessionStorage.setItem(cacheKey, JSON.stringify(json.data)) } catch {}
    } catch {
      setError({ code: 'NETWORK_ERROR', message: 'Failed to fetch transaction. Check your connection.' })
    } finally {
      setLoading(false)
    }
  }, [signature, network])

  useEffect(() => {
    fetchTx()
  }, [fetchTx])

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {loading && <TxLoading />}

        {!loading && error && (
          error.code === 'TX_NOT_FOUND'
            ? <TxNotFound message={error.message} />
            : <TxError message={error.message} onRetry={fetchTx} />
        )}

        {!loading && data && (
          <>
            <TxStatusBar transaction={data} />

            {data.status === 'success' && <TxSuccessSummary transaction={data} />}

            {/* Desktop: 3-column grid */}
            <div className="hidden lg:grid lg:grid-cols-[5fr_3fr_3fr] gap-4 p-4 overflow-hidden">
              <div className="bg-bg-surface rounded-lg border border-border p-4 min-w-0 overflow-hidden">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">CPI Call Tree</h3>
                <CpiTree nodes={data.cpiTree} />
              </div>

              <div className="bg-bg-surface rounded-lg border border-border p-4 min-w-0 overflow-hidden">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">Log Messages</h3>
                <LogStream logs={data.parsedLogs} />
              </div>

              <div className="bg-bg-surface rounded-lg border border-border p-4 min-w-0 overflow-hidden">
                <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-3">Account Changes</h3>
                <AccountDiffTable diffs={data.accountDiffs} />
              </div>
            </div>

            {/* Mobile: tabbed view */}
            <div className="lg:hidden p-4">
              <MobileTabs
                cpiTree={<CpiTree nodes={data.cpiTree} />}
                logStream={<LogStream logs={data.parsedLogs} />}
                accountDiff={<AccountDiffTable diffs={data.accountDiffs} />}
              />
            </div>

            {/* AI Diagnosis */}
            <div className="px-4 pb-4">
              <DiagnosisPanel
                signature={signature}
                network={network}
                isFailed={data.status === 'failed'}
              />
            </div>

            <ShareFooter signature={signature} network={network} />

            {/* Warnings */}
            {data.warnings.length > 0 && (
              <div className="mx-4 mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                {data.warnings.map((w, i) => (
                  <p key={i} className="text-warning text-xs">{w}</p>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
