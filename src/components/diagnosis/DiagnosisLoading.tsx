export function DiagnosisLoading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 animate-ping rounded-full bg-accent/30" />
        <span className="text-sm text-text-secondary">
          Analyzing transaction...
        </span>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-bg-surface-2" />
        <div className="h-4 w-1/2 rounded bg-bg-surface-2" />
        <div className="h-3 w-2/3 rounded bg-bg-surface-2" />
      </div>
    </div>
  )
}
