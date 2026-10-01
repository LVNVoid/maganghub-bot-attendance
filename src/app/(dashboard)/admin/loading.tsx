export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-6 w-64 bg-surface rounded" />
        <div className="h-3.5 w-80 sm:w-96 bg-surface/60 rounded" />
      </div>

      {/* 4 Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-canvas-subtle border border-hairline rounded-md p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-surface rounded" />
              <div className="w-4 h-4 bg-surface rounded-xs" />
            </div>
            <div className="h-7 w-16 bg-surface rounded" />
            <div className="h-2.5 w-28 bg-surface/50 rounded" />
          </div>
        ))}
      </div>

      {/* User List Table Card */}
      <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
        <div className="h-4 w-44 bg-surface rounded" />
        <div className="border border-hairline rounded-xs overflow-hidden">
          <div className="h-10 bg-canvas-deep border-b border-hairline px-4 flex items-center justify-between">
            <div className="h-3 w-28 bg-surface rounded" />
            <div className="h-3 w-24 bg-surface rounded hidden sm:block" />
            <div className="h-3 w-24 bg-surface rounded hidden md:block" />
            <div className="h-3 w-16 bg-surface rounded" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 px-4 border-b border-hairline last:border-b-0 flex items-center justify-between bg-canvas"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 bg-surface rounded" />
                  <div className="h-2.5 w-40 bg-surface/50 rounded" />
                </div>
              </div>
              <div className="h-5 w-16 bg-surface rounded-full hidden sm:block" />
              <div className="h-5 w-20 bg-surface rounded-full hidden md:block" />
              <div className="h-5 w-14 bg-surface rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
