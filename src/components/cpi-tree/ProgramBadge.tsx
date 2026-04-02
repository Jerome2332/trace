'use client'

import { shortenAddress } from '@/lib/utils'

interface ProgramBadgeProps {
  programId: string
  programName?: string
  color: string
}

export function ProgramBadge({ programId, programName, color }: ProgramBadgeProps) {
  const displayName = programName ?? shortenAddress(programId, 4)
  const truncated = displayName.length > 20 ? displayName.slice(0, 20) + '...' : displayName

  return (
    <div className="inline-flex items-center" title={programId}>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-surface-2 text-text-primary border border-border"
        style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      >
        {truncated}
      </span>
    </div>
  )
}
