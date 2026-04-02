'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, CircleDot } from 'lucide-react'
import type { Diagnosis } from '@/types/diagnosis'

interface DiagnosisContentProps {
  diagnosis: Diagnosis
}

const severityConfig = {
  error: { dot: 'text-error', label: 'Error' },
  warning: { dot: 'text-warning', label: 'Warning' },
  info: { dot: 'text-accent', label: 'Info' },
} as const

const confidenceConfig = {
  high: { dot: 'text-success', label: 'High' },
  medium: { dot: 'text-warning', label: 'Medium' },
  low: { dot: 'text-text-tertiary', label: 'Low' },
} as const

export function DiagnosisContent({ diagnosis }: DiagnosisContentProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyFix = async () => {
    try {
      await navigator.clipboard.writeText(diagnosis.suggestedFix)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard access denied
    }
  }

  const severity = severityConfig[diagnosis.severity]
  const confidence = confidenceConfig[diagnosis.confidence]

  return (
    <div className="space-y-4 p-4">
      {/* Root Cause */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <CircleDot className={`h-3 w-3 ${severity.dot}`} />
          <span className="text-xs font-medium uppercase text-text-tertiary">
            Root Cause
          </span>
        </div>
        <p className="text-sm font-medium text-text-primary">
          {diagnosis.rootCause}
        </p>
      </div>

      {/* Technical Detail */}
      <div>
        <span className="mb-1 block text-xs font-medium uppercase text-text-tertiary">
          Technical Detail
        </span>
        <p className="text-sm text-text-secondary">
          {diagnosis.technicalDetail}
        </p>
      </div>

      {/* Metadata Row */}
      <div className="grid grid-cols-3 gap-3 rounded-md bg-bg-surface-2 p-3">
        <div>
          <span className="block text-xs text-text-tertiary">Error Code</span>
          <span className="font-mono text-sm text-text-primary">
            {diagnosis.errorCode ?? '-'}
          </span>
        </div>
        <div>
          <span className="block text-xs text-text-tertiary">
            Failed Program
          </span>
          <span className="font-mono text-sm text-text-primary truncate block">
            {diagnosis.failedProgram ?? '-'}
          </span>
        </div>
        <div>
          <span className="block text-xs text-text-tertiary">Confidence</span>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${confidence.dot} bg-current`} />
            <span className="text-sm text-text-primary">
              {confidence.label}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Fix */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase text-text-tertiary">
            Suggested Fix
          </span>
          <button
            type="button"
            onClick={handleCopyFix}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Fix
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-text-primary">{diagnosis.suggestedFix}</p>
      </div>

      {/* Code Snippet */}
      {diagnosis.codeSnippet && (
        <div>
          <span className="mb-1 block text-xs font-medium uppercase text-text-tertiary">
            Code
          </span>
          <pre className="overflow-x-auto rounded-md bg-bg-surface-2 p-3 font-mono text-xs text-text-secondary">
            <code>{diagnosis.codeSnippet}</code>
          </pre>
        </div>
      )}

      {/* Docs Link */}
      {diagnosis.docsUrl && (
        <a
          href={diagnosis.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover"
        >
          View Documentation
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}
