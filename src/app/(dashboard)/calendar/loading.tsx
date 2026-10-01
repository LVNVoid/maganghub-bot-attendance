export default function CalendarLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-6 w-56 sm:w-64 bg-surface rounded" />
        <div className="h-3.5 w-72 sm:w-96 bg-surface/60 rounded" />
      </div>

      {/* Calendar Card Skeleton */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Month Navigator Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-4 w-32 bg-surface rounded" />
            <div className="h-3 w-40 bg-surface/50 rounded hidden sm:block" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 sm:h-7 sm:w-7 bg-surface rounded-xs" />
            <div className="h-8 w-8 sm:h-7 sm:w-7 bg-surface rounded-xs" />
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-3 bg-surface/60 rounded mx-auto w-6" />
          ))}
        </div>

        {/* 35 Calendar Day Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="h-14 sm:h-16 rounded-xs sm:rounded-sm bg-canvas-deep border border-hairline p-1 sm:p-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-4 bg-surface rounded" />
                <div className="w-2.5 h-2.5 rounded-full bg-surface/50" />
              </div>
              <div className="h-2 w-8 bg-surface/40 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend Footer Skeleton */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-md bg-canvas-subtle border border-hairline">
        <div className="h-3 w-20 bg-surface rounded" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-xs bg-surface" />
            <div className="h-3 w-24 bg-surface/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
