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
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showCu}
            onChange={(e) => setShowCu(e.target.checked)}
            className="rounded border-border"
          />
          Show CU lines
        </label>
        <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showData}
            onChange={(e) => setShowData(e.target.checked)}
            className="rounded border-border"
          />
          Show data lines
        </label>
      </div>

      <div className="max-h-[500px] overflow-y-auto rounded-lg border border-border bg-bg-surface">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-text-tertiary">
            No log lines to display
          </div>
        ) : (
          <div className="p-2">
            {(() => {
              const firstInvokeIdx = filtered.findIndex((l) => l.type === 'invoke')
              return filtered.map((log, i) => {
              const isInvoke = log.type === 'invoke'
              return (
              <div
                key={log.index}
                className={`flex gap-2 px-2 py-0.5 font-mono text-xs rounded ${isInvoke && i !== firstInvokeIdx ? 'mt-2' : ''} ${LOG_LINE_STYLES[log.type]}`}
              >
                <span className="w-8 shrink-0 text-right text-text-tertiary select-none">
                  {log.index}
                </span>
                <span className="whitespace-pre-wrap break-all">{log.raw}</span>
              </div>
              )
              })
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
