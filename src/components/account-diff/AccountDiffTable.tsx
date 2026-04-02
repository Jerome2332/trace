'use client'

import { useState, useCallback } from 'react'
import type { AccountDiff } from '@/types/account-diff'
import { shortenAddress, lamportsToSol } from '@/lib/utils'

interface AccountDiffTableProps {
  diffs: AccountDiff[]
}

function SolDelta({ lamports }: { lamports: number }) {
  if (lamports === 0) {
    return <span className="text-text-tertiary">-</span>
  }

  const sol = lamportsToSol(lamports)
  const formatted = sol.toFixed(9).replace(/\.?0+$/, '')

  if (lamports > 0) {
    return (
      <span className="text-success font-mono">
        {'\u2191'} +{formatted}
      </span>
    )
  }

  return (
    <span className="text-error font-mono">
      {'\u2193'} {formatted}
    </span>
  )
}

function RoleBadges({ diff }: { diff: AccountDiff }) {
  const badges: Array<{ label: string; className: string }> = []

  if (diff.isSigner) {
    badges.push({ label: 'Signer', className: 'bg-accent/10 text-accent' })
  }
  if (diff.isFeePayer) {
    badges.push({ label: 'Fee Payer', className: 'bg-warning/10 text-warning' })
  }
  if (diff.isNew) {
    badges.push({ label: 'New', className: 'bg-success/10 text-success' })
  }
  if (diff.isClosed) {
    badges.push({ label: 'Closed', className: 'bg-error/10 text-error' })
  }

  if (badges.length === 0) {
    return <span className="text-text-tertiary">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <span
          key={badge.label}
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}

function TokenChanges({ diff }: { diff: AccountDiff }) {
  if (diff.tokenChanges.length === 0) {
    return <span className="text-text-tertiary">-</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {diff.tokenChanges.map((tc) => {
        const isPositive = tc.uiDelta > 0
        const formatted = isPositive ? `+${tc.uiDelta}` : String(tc.uiDelta)

        return (
          <span
            key={tc.mint}
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
              isPositive
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            <span>{formatted}</span>
            <span className="text-text-tertiary">{shortenAddress(tc.mint)}</span>
          </span>
        )
      })}
    </div>
  )
}

export function AccountDiffTable({ diffs }: AccountDiffTableProps) {
  const [showAll, setShowAll] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  const hasChanges = useCallback(
    (d: AccountDiff) =>
      d.solDelta !== 0 ||
      d.tokenChanges.length > 0 ||
      d.isNew ||
      d.isClosed,
    [],
  )

  const filtered = showAll ? diffs : diffs.filter(hasChanges)
  const hiddenCount = diffs.length - diffs.filter(hasChanges).length

  const handleCopy = useCallback((address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-border bg-bg-surface">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-bg-surface-2">
              <th className="px-3 py-2 text-left font-medium text-text-secondary">
                Address
              </th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">
                Role
              </th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">
                SOL Change
              </th>
              <th className="px-3 py-2 text-left font-medium text-text-secondary">
                Token Changes
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-text-tertiary"
                >
                  No account changes
                </td>
              </tr>
            ) : (
              filtered.map((diff) => (
                <tr
                  key={diff.address}
                  className="border-b border-border last:border-b-0 hover:bg-bg-surface-2/50"
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(diff.address)}
                      className="font-mono text-text-primary hover:text-accent transition-colors cursor-pointer"
                      title={diff.address}
                    >
                      {copiedAddress === diff.address
                        ? 'Copied!'
                        : shortenAddress(diff.address)}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <RoleBadges diff={diff} />
                  </td>
                  <td className="px-3 py-2">
                    <SolDelta lamports={diff.solDelta} />
                  </td>
                  <td className="px-3 py-2">
                    <TokenChanges diff={diff} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="self-start text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {showAll
            ? 'Show only changed accounts'
            : `Show all ${diffs.length} accounts`}
        </button>
      )}
    </div>
  )
}
