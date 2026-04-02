export function TxLoading() {
  return (
    <div className="animate-pulse">
      {/* Status bar skeleton */}
      <div className="bg-bg-surface border-b border-border px-4 py-3 flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-5 bg-bg-surface-2 rounded w-24" />
        ))}
      </div>

      {/* Three column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-4 p-4">
        {/* CPI Tree skeleton */}
        <div className="bg-bg-surface rounded-lg border border-border p-4 space-y-3">
          <div className="h-4 bg-bg-surface-2 rounded w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(i - 1) * 20}px` }}>
              <div className="w-3 h-3 bg-bg-surface-2 rounded-full" />
              <div className="h-4 bg-bg-surface-2 rounded flex-1" />
            </div>
          ))}
        </div>

        {/* Log stream skeleton */}
        <div className="bg-bg-surface rounded-lg border border-border p-4 space-y-2">
          <div className="h-4 bg-bg-surface-2 rounded w-24" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-3 bg-bg-surface-2 rounded" style={{ width: `${60 + (i * 5)}%` }} />
          ))}
        </div>

        {/* Account diff skeleton */}
        <div className="bg-bg-surface rounded-lg border border-border p-4 space-y-2">
          <div className="h-4 bg-bg-surface-2 rounded w-28" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 bg-bg-surface-2 rounded w-20" />
              <div className="h-3 bg-bg-surface-2 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
