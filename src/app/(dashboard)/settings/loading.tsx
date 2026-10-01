export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-6 w-52 sm:w-60 bg-surface rounded" />
        <div className="h-3.5 w-72 sm:w-96 bg-surface/60 rounded" />
      </div>

      <div className="space-y-6">
        {/* Card 1: AI Config Card Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-44 bg-surface rounded" />
              <div className="h-3 w-64 bg-surface/50 rounded" />
            </div>
            <div className="h-6 w-24 bg-surface rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-surface rounded" />
              <div className="h-9 bg-canvas-deep border border-hairline rounded-xs" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-surface rounded" />
              <div className="h-9 bg-canvas-deep border border-hairline rounded-xs" />
            </div>
          </div>
        </div>

        {/* Card 2: MagangHub Credential Card Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-52 bg-surface rounded" />
              <div className="h-3 w-72 bg-surface/50 rounded" />
            </div>
            <div className="h-6 w-20 bg-surface rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="h-3 w-24 bg-surface rounded" />
              <div className="h-9 bg-canvas-deep border border-hairline rounded-xs" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-surface rounded" />
              <div className="h-9 bg-canvas-deep border border-hairline rounded-xs" />
            </div>
          </div>
        </div>

        {/* Card 3: GitHub Repo Card Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-48 bg-surface rounded" />
              <div className="h-3 w-64 bg-surface/50 rounded" />
            </div>
            <div className="h-6 w-28 bg-surface rounded-full" />
          </div>
          <div className="h-9 bg-canvas-deep border border-hairline rounded-xs" />
          <div className="space-y-2 pt-1">
            <div className="h-12 bg-canvas-deep border border-hairline rounded-xs" />
          </div>
        </div>

        {/* Card 4: Automation Config Card Skeleton */}
        <div className="bg-canvas-subtle border border-hairline rounded-md p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-56 bg-surface rounded" />
              <div className="h-3 w-72 bg-surface/50 rounded" />
            </div>
            <div className="h-6 w-11 bg-surface rounded-full" />
          </div>
          <div className="h-20 bg-canvas-deep border border-hairline rounded-xs" />
        </div>
      </div>
    </div>
  );
}
