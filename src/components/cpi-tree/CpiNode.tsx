'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, AlertCircle } from 'lucide-react'
import type { CpiTreeNode } from '@/types/cpi-tree'
import { ProgramBadge } from './ProgramBadge'
import { formatNumber } from '@/lib/utils'

interface CpiNodeProps {
  node: CpiTreeNode
  index: number
}

export function CpiNodeComponent({ node, index }: CpiNodeProps) {
  const [expanded, setExpanded] = useState(node.status === 'failed')
  const hasLogs = node.logs.length > 0
  const hasChildren = node.children.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
    >
      {/* Node row */}
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-bg-surface-3 transition-colors group ${
          node.status === 'failed' ? 'bg-error/5' : ''
        }`}
        onClick={() => hasLogs && setExpanded(!expanded)}
      >
        {/* Expand indicator */}
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {hasLogs ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
            )
          ) : (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.programColor }} />
          )}
        </div>

        {/* Program badge */}
        <ProgramBadge
          programId={node.programId}
          programName={node.programName}
          color={node.programColor}
        />

        {/* Instruction name */}
        {node.instructionName && (
          <span className="text-xs text-text-secondary">{node.instructionName}</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status */}
        {node.status === 'success' && (
          <span className="text-xs text-success/60">success</span>
        )}
        {node.status === 'failed' && (
          <span className="flex items-center gap-1 text-xs text-error font-medium">
            <AlertCircle className="w-3 h-3" />
            FAILED
          </span>
        )}

        {/* CU count */}
        {node.computeUnits != null && (
          <span className="text-xs text-text-tertiary font-mono">
            {formatNumber(node.computeUnits)} CU
          </span>
        )}
      </div>

      {/* Error message */}
      {node.status === 'failed' && node.errorMessage && (
        <div className="ml-6 px-3 py-1.5 text-xs text-error/80 bg-error/5 rounded border border-error/10 font-mono">
          {node.anchorErrorName && (
            <span className="text-error font-medium">{node.anchorErrorName} </span>
          )}
          {node.errorHex && <span>({node.errorHex})</span>}
          {!node.anchorErrorName && <span>{node.errorMessage}</span>}
        </div>
      )}

      {/* Expanded logs */}
      <AnimatePresence>
        {expanded && hasLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-6 pl-3 border-l border-border space-y-0.5 py-1">
              {node.logs.map((log, i) => (
                <div key={i} className="text-xs font-mono text-text-tertiary truncate" title={log.raw}>
                  {log.raw}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children */}
      {hasChildren && (
        <div className="ml-5 pl-3 border-l border-border">
          {node.children.map((child, i) => (
            <CpiNodeComponent key={child.id} node={child} index={index + i + 1} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
