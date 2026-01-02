import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  progress: number;
  className?: string;
}

export const PullToRefreshIndicator = ({
  isRefreshing,
  progress,
  className,
}: PullToRefreshIndicatorProps) => {
  if (!isRefreshing && progress === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center",
        "w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20",
        "transition-all duration-200 ease-out",
        className
      )}
      style={{
        transform: `translateX(-50%) translateY(${Math.max(
          0,
          progress - 100
        )}px)`,
        opacity: Math.min(progress / 100, 1),
      }}
    >
      <RefreshCw
        className={cn(
          "w-6 h-6 text-primary transition-transform duration-200",
          isRefreshing && "animate-spin"
        )}
        style={{
          transform: `rotate(${progress * 3.6}deg)`,
        }}
      />
    </div>
  );
};
