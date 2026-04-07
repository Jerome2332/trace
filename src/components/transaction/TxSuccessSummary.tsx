'use client'

import { CheckCircle, Cpu, Wallet, Tag } from 'lucide-react'
import type { TraceTransaction } from '@/types/transaction'
import { formatNumber } from '@/lib/utils'

export function TxSuccessSummary({ transaction }: { transaction: TraceTransaction }) {
  const programCount = new Set(
    transaction.cpiTree.flatMap(function collectIds(node): string[] {
      return [node.programId, ...node.children.flatMap(collectIds)]
    })
  ).size

  const changedAccounts = transaction.accountDiffs.filter(
    (a) => a.solDelta !== 0 || a.tokenChanges.length > 0
  ).length

  return (
    <div className="mx-4 mt-4 rounded-lg border border-success/20 bg-success/[0.03] p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-4 h-4 text-success" />
        <span className="text-sm font-medium text-text-primary">
          Transaction completed successfully
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-surface-2 text-xs">
          <Wallet className="w-3 h-3 text-text-tertiary" />
          <span className="text-text-secondary">{programCount} programs</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-surface-2 text-xs">
          <Cpu className="w-3 h-3 text-text-tertiary" />
          <span className="text-text-secondary">{formatNumber(transaction.computeUnitsConsumed)} CUs</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-surface-2 text-xs">
          <Wallet className="w-3 h-3 text-text-tertiary" />
          <span className="text-text-secondary">{changedAccounts} accounts changed</span>
        </div>

        {transaction.txType && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 text-xs">
            <Tag className="w-3 h-3 text-accent" />
            <span className="text-accent">{transaction.txType}</span>
          </div>
        )}
      </div>
    </div>
  )
}
