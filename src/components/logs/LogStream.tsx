'use client'

import { useState } from 'react'
import type { ParsedLog, LogLineType } from '@/types/log-parser'

interface LogStreamProps {
  logs: ParsedLog[]
}

const LOG_LINE_STYLES: Record<LogLineType, string> = {
  invoke: 'text-text-secondary font-medium border-l-[3px] border-accent/30 pl-2',
  success: 'text-success/40',
  failed: 'text-error font-semibold bg-error/5 border-l-[3px] border-error pl-2',
  log: 'text-text-primary pl-4',
  data: 'text-text-tertiary',
  cu_consumed: 'text-text-tertiary italic',
  return: 'text-text-tertiary',
  unknown: 'text-text-tertiary',
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
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowCu(!showCu)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors border ${
            showCu
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-bg-surface-2 border-border text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${showCu ? 'bg-accent' : 'bg-text-tertiary/30'}`} />
          CU lines
        </button>
        <button
          onClick={() => setShowData(!showData)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors border ${
            showData
              ? 'bg-accent/10 border-accent/30 text-accent'
              : 'bg-bg-surface-2 border-border text-text-tertiary hover:text-text-secondary'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${showData ? 'bg-accent' : 'bg-text-tertiary/30'}`} />
          Data lines
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-bg-surface">
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
  const firstInvokeIdx = logs.findIndex((l) => l.type === 'invoke')

  return (
    <div className="p-2">
      {logs.map((log, i) => {
        const isInvoke = log.type === 'invoke'
        const addGap = isInvoke && i !== firstInvokeIdx

        return (
          <div
            key={log.index}
            className={`flex gap-2 px-2 py-0.5 font-mono text-xs rounded ${addGap ? 'mt-2' : ''} ${LOG_LINE_STYLES[log.type]}`}
          >
            <span className="w-8 shrink-0 text-right text-text-tertiary select-none">
              {log.index}
            </span>
            <span className="truncate">{log.raw}</span>
          </div>
        )
      })}
    </div>
  )
}
