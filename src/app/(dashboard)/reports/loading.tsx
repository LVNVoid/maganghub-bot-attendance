export default function ReportsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <div className="h-6 w-48 sm:w-56 bg-surface rounded" />
          <div className="h-3.5 w-64 sm:w-80 bg-surface/60 rounded" />
        </div>
        <div className="h-9 sm:h-8 w-44 bg-surface rounded" />
      </div>

      {/* ReportForm Card Skeleton */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-6">
        {/* Date Selector Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="h-4 w-28 bg-surface rounded" />
            <div className="h-9 w-40 bg-surface rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-surface rounded-full" />
            <div className="h-6 w-28 bg-surface rounded-full" />
          </div>
        </div>

        {/* 3 Textareas */}
        <div className="space-y-5">
          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-48 bg-surface rounded" />
              <div className="h-3 w-16 bg-surface/50 rounded" />
            </div>
            <div className="h-28 bg-canvas-deep border border-hairline rounded-xs" />
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-56 bg-surface rounded" />
              <div className="h-3 w-16 bg-surface/50 rounded" />
            </div>
            <div className="h-24 bg-canvas-deep border border-hairline rounded-xs" />
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-44 bg-surface rounded" />
              <div className="h-3 w-16 bg-surface/50 rounded" />
            </div>
            <div className="h-24 bg-canvas-deep border border-hairline rounded-xs" />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-hairline">
          <div className="h-9 w-36 bg-surface rounded" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-surface rounded" />
            <div className="h-9 w-36 bg-surface rounded" />
          </div>
        </div>
      </div>

      {/* Recent History Preview Card Skeleton */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="space-y-1">
            <div className="h-4 w-44 bg-surface rounded" />
            <div className="h-3 w-72 bg-surface/50 rounded" />
          </div>
          <div className="h-4 w-40 bg-surface/50 rounded" />
        </div>

        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 bg-canvas-deep border border-hairline rounded-xs flex items-center justify-between"
            >
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="h-3.5 w-28 bg-surface rounded" />
                <div className="h-3 w-3/4 bg-surface/60 rounded" />
              </div>
              <div className="h-6 w-20 bg-surface rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
