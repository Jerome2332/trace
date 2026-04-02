'use client'

import type { CpiTreeNode } from '@/types/cpi-tree'
import { CpiNodeComponent } from './CpiNode'

interface CpiTreeProps {
  nodes: CpiTreeNode[]
}

export function CpiTree({ nodes }: CpiTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-text-tertiary text-sm py-4 text-center">
        No CPI calls found in this transaction.
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node, i) => (
        <CpiNodeComponent key={node.id} node={node} index={i} />
      ))}
    </div>
  )
}
