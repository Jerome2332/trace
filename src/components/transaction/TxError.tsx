'use client'

import { AlertTriangle } from 'lucide-react'

export function TxError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertTriangle className="w-12 h-12 text-error" />
      <h2 className="text-lg font-medium text-text-primary">Something went wrong</h2>
      <p className="text-text-secondary text-sm max-w-md text-center">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
