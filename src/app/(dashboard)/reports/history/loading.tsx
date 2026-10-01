export default function ReportHistoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-surface rounded" />
            <div className="h-6 w-52 sm:w-60 bg-surface rounded" />
          </div>
          <div className="h-3.5 w-72 sm:w-96 bg-surface/60 rounded" />
        </div>
        <div className="h-9 sm:h-8 w-44 bg-surface rounded" />
      </div>

      {/* Table Container Card */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
          <div className="h-9 w-full sm:w-72 bg-canvas-deep border border-hairline rounded-xs" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-canvas-deep border border-hairline rounded-xs" />
            <div className="h-9 w-24 bg-surface/50 rounded" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="border border-hairline rounded-xs overflow-hidden">
          {/* Table Header */}
          <div className="h-10 bg-canvas-deep border-b border-hairline px-4 flex items-center justify-between">
            <div className="h-3 w-20 bg-surface rounded" />
            <div className="h-3 w-40 bg-surface rounded hidden sm:block" />
            <div className="h-3 w-16 bg-surface rounded" />
            <div className="h-3 w-14 bg-surface rounded" />
          </div>

          {/* 6 Table Rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 px-4 border-b border-hairline last:border-b-0 flex items-center justify-between bg-canvas"
            >
              <div className="h-3.5 w-24 bg-surface rounded" />
              <div className="h-3 w-64 bg-surface/60 rounded hidden sm:block" />
              <div className="h-5 w-20 bg-surface rounded-full" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-surface rounded-xs" />
                <div className="w-7 h-7 bg-surface rounded-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 w-36 bg-surface/50 rounded" />
          <div className="flex items-center gap-1.5">
            <div className="h-8 w-16 bg-surface rounded" />
            <div className="h-8 w-16 bg-surface rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
