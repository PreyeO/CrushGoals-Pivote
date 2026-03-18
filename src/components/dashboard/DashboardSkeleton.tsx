import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Sparkles } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Goals Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
             My Active Goals
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 flex flex-col justify-between min-h-[220px]">
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Skeleton className="h-10 w-10 rounded-xl" />
                     <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-md" />
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                  <Skeleton className="h-3 w-5/6 rounded-md" />
               </div>
               <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                     <Skeleton className="h-3 w-16 rounded-md" />
                     <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizations Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
             Your Organizations
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
           {[1, 2].map((i) => (
              <div key={i} className="glass-card p-6 min-h-[200px]">
                 <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                 <Skeleton className="h-5 w-48 rounded-md mb-2" />
                 <Skeleton className="h-3 w-full rounded-md mb-4" />
                 <div className="flex gap-4 mb-4">
                    <Skeleton className="h-3 w-12 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                 </div>
                 <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
           ))}
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-muted-foreground/30" />
            <Skeleton className="h-4 w-24 rounded-md" />
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
           {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-accent/30 space-y-2">
                 <Skeleton className="h-4 w-32 rounded-md" />
                 <Skeleton className="h-3 w-48 rounded-md" />
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
