import { Skeleton } from "@/components/ui/skeleton";

export function OrgDashboardSkeleton() {
  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>

      {/* Pulse UI Skeleton */}
      <Skeleton className="h-35 w-full rounded-xl" />

      {/* Tabs Layout Skeleton */}
      <div className="w-full space-y-6">
        <div className="flex gap-6 border-b border-border/40 pb-1">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-6 w-28 mb-2" />
        </div>

        {/* Leaderboard Table Skeleton */}
        <div className="rounded-xl border border-border">
          <div className="border-b border-border p-4">
            <div className="flex gap-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 border-b border-border last:border-0 flex gap-4"
            >
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
