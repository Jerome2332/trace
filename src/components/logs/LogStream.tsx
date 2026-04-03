'use client'

import { useState } from 'react'
import type { ParsedLog } from '@/types/log-parser'

interface LogStreamProps {
  logs: ParsedLog[]
}

export function LogStream({ logs }: LogStreamProps) {
  const [showCu, setShowCu] = useState(false)
  const [showData, setShowData] = useState(false)

  const filtered = logs.filter((log) => {
    if (!showCu && log.type === 'cu_consumed') return false
    if (!showData && log.type === 'data') return false
    return true
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCu(!showCu)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
            showCu
              ? 'bg-accent/15 text-accent'
              : 'bg-bg-surface-2 text-text-tertiary hover:text-text-secondary'
          }`}
        >
          cu
        </button>
        <button
          onClick={() => setShowData(!showData)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
            showData
              ? 'bg-accent/15 text-accent'
              : 'bg-bg-surface-2 text-text-tertiary hover:text-text-secondary'
          }`}
        >
          data
        </button>
        <span className="text-[10px] text-text-tertiary ml-auto">{filtered.length} lines</span>
      </div>

      <div className="max-h-[500px] overflow-y-auto overflow-x-hidden rounded-lg bg-[#0d0d14] ring-1 ring-white/[0.06]">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-text-tertiary">
            No log lines to display
          </div>
        ) : (
          <LogLines logs={filtered} />
        )}
      </div>
    </div>
  )
}

function LogLines({ logs }: { logs: ParsedLog[] }) {
  return (
    <div className="font-mono text-[11px] leading-[18px]">
      {logs.map((log, i) => {
        const prev = i > 0 ? logs[i - 1] : undefined
        const showDivider = log.type === 'invoke' && prev && prev.type !== 'invoke' && i > 0

        return (
          <div key={log.index}>
            {showDivider && <div className="border-t border-white/[0.04] mx-3" />}
            <div
              className={`flex items-start gap-0 hover:bg-white/[0.02] transition-colors ${
                log.type === 'failed' ? 'bg-red-500/[0.06]' : ''
              }`}
            >
              {/* Line number gutter */}
              <span className="w-9 shrink-0 text-right pr-3 py-px text-text-tertiary/40 select-none tabular-nums">
                {log.index}
              </span>

              {/* Type indicator */}
              <span className="w-[3px] shrink-0 self-stretch mr-2" style={getIndicatorStyle(log.type)} />

              {/* Content */}
              <span className={`py-px pr-3 truncate ${getTextStyle(log.type)}`}>
                {log.raw}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getIndicatorStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'invoke': return { backgroundColor: '#7c5cfc' }
    case 'success': return { backgroundColor: '#22c55e', opacity: 0.3 }
    case 'failed': return { backgroundColor: '#ef4444' }
    case 'log': return { backgroundColor: 'transparent' }
    case 'cu_consumed': return { backgroundColor: 'transparent' }
    default: return { backgroundColor: 'transparent' }
  }
}

function getTextStyle(type: string): string {
  switch (type) {
    case 'invoke': return 'text-[#a78bfa]'
    case 'success': return 'text-[#4ade80]/40'
    case 'failed': return 'text-[#f87171] font-medium'
    case 'log': return 'text-[#c8c8d8]'
    case 'data': return 'text-text-tertiary'
    case 'cu_consumed': return 'text-text-tertiary/60'
    case 'return': return 'text-text-tertiary/60'
    default: return 'text-text-tertiary'
  }
}
