'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Hash, Clock, Coins, Cpu, Tag, Copy, Check } from 'lucide-react'
import type { TraceTransaction } from '@/types/transaction'
import { formatSol, formatNumber, formatRelativeTime, formatAbsoluteTime, shortenAddress } from '@/lib/utils'

export function TxStatusBar({ transaction }: { transaction: TraceTransaction }) {
  const isSuccess = transaction.status === 'success'
  const [copied, setCopied] = useState(false)

  function copySignature() {
    navigator.clipboard.writeText(transaction.signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-row items-center gap-3 bg-bg-surface border-b border-border px-4 py-3 flex-wrap gap-y-2">
      {/* Status badge */}
      <div
        className={`shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isSuccess
            ? 'bg-success/10 text-success'
            : 'bg-error/10 text-error'
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        {isSuccess ? 'Success' : 'Failed'}
      </div>

      {/* Signature */}
      <button
        onClick={copySignature}
        className="shrink-0 flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
        title={transaction.signature}
      >
        {copied ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <Copy className="w-3 h-3 text-text-tertiary" />
        )}
        <span>{copied ? 'Copied!' : shortenAddress(transaction.signature, 6)}</span>
      </button>

      {/* Slot */}
      <div className="shrink-0 flex items-center gap-1.5 text-xs">
        <Hash className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">Slot</span>
        <span className="text-text-primary font-mono">{formatNumber(transaction.slot)}</span>
      </div>

      {/* Time */}
      <div className="shrink-0 flex items-center gap-1.5 text-xs">
        <Clock className="w-3.5 h-3.5 text-text-tertiary" />
        <span
          className="text-text-primary"
          title={formatAbsoluteTime(transaction.blockTime)}
        >
          {formatRelativeTime(transaction.blockTime)}
        </span>
      </div>

      {/* Fee */}
      <div className="shrink-0 flex items-center gap-1.5 text-xs">
        <Coins className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">Fee</span>
        <span className="text-text-primary font-mono">{formatSol(transaction.fee)}</span>
      </div>

      {/* Compute units */}
      <div className="shrink-0 flex items-center gap-1.5 text-xs">
        <Cpu className="w-3.5 h-3.5 text-text-tertiary" />
        <span className="text-text-secondary">CUs:</span>
        <span className="text-text-primary font-mono">
          {formatNumber(transaction.computeUnitsConsumed)}
          {transaction.computeUnitsRequested != null && (
            <> / {formatNumber(transaction.computeUnitsRequested)}</>
          )}
        </span>
      </div>

      {/* Transaction type */}
      {transaction.txType && (
        <div className="shrink-0 flex items-center gap-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-text-secondary bg-bg-surface-2 px-2 py-0.5 rounded">
            {transaction.txType}
          </span>
        </div>
      )}
    </div>
  )
}
