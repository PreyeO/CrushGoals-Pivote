"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeSkeleton() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-card p-10 space-y-6 animate-pulse">
        {/* Icon Skeleton */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 overflow-hidden">
          <Skeleton className="w-full h-full opacity-20" />
        </div>
        
        <div className="space-y-3">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-48 mx-auto rounded-lg" />
          
          {/* Subtext Skeletons */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded-md opacity-60" />
            <Skeleton className="h-4 w-5/6 mx-auto rounded-md opacity-60" />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="pt-2">
          <Skeleton className="h-12 w-full rounded-xl opacity-80" />
        </div>
      </div>
    </div>
  );
}
