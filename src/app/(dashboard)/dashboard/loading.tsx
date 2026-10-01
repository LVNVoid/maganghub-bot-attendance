export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-6 w-56 sm:w-64 bg-surface rounded" />
        <div className="h-3.5 w-72 sm:w-96 bg-surface/60 rounded" />
      </div>

      {/* 5 Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-surface rounded" />
              <div className="w-4 h-4 bg-surface rounded-xs" />
            </div>
            <div className="h-6 sm:h-7 w-16 bg-surface rounded" />
            <div className="h-2.5 w-24 bg-surface/50 rounded" />
          </div>
        ))}
      </div>

      {/* Quick Submit Card */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-surface rounded" />
            <div className="h-3 w-56 bg-surface/50 rounded" />
          </div>
          <div className="h-9 w-36 bg-surface rounded" />
        </div>
        <div className="p-3 rounded-sm bg-canvas-deep border border-hairline flex items-center justify-between">
          <div className="h-3 w-48 bg-surface rounded" />
          <div className="h-5 w-20 bg-surface rounded-full" />
        </div>
      </div>

      {/* Grid: Commits Preview + Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commits Preview Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-surface rounded" />
            <div className="h-3 w-24 bg-surface rounded" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-16 bg-canvas-deep rounded-xs border border-hairline" />
            <div className="h-16 bg-canvas-deep rounded-xs border border-hairline" />
          </div>
        </div>

        {/* Submit Logs Feed Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-surface rounded" />
            <div className="h-3 w-20 bg-surface rounded" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-12 bg-canvas-deep rounded-xs border border-hairline" />
            <div className="h-12 bg-canvas-deep rounded-xs border border-hairline" />
            <div className="h-12 bg-canvas-deep rounded-xs border border-hairline" />
          </div>
        </div>
      </div>
    </div>
  );
}
