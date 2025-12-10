import { cn } from "@/lib/utils";

interface StreakCounterProps {
  streak: number;
  longestStreak?: number;
  className?: string;
}

export function StreakCounter({ streak, longestStreak, className }: StreakCounterProps) {
  const isOnFire = streak >= 3;
  const isBlazing = streak >= 7;
  const isLegendary = streak >= 30;

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "glass-card p-6 rounded-2xl text-center overflow-hidden relative",
        isLegendary && "border-premium/50 bg-premium/10",
        isBlazing && !isLegendary && "border-orange-500/50 bg-orange-500/10",
        isOnFire && !isBlazing && "border-primary/50"
      )}>
        {/* Background glow effect */}
        {isOnFire && (
          <div className={cn(
            "absolute inset-0 opacity-20",
            isLegendary 
              ? "bg-gradient-to-t from-premium/50 via-transparent to-transparent"
              : isBlazing
              ? "bg-gradient-to-t from-orange-500/50 via-transparent to-transparent"
              : "bg-gradient-to-t from-primary/50 via-transparent to-transparent"
          )} />
        )}

        {/* Fire emoji with animation */}
        <div className="relative mb-3">
          <span className={cn(
            "text-5xl inline-block",
            isOnFire && "animate-fire-pulse",
            isBlazing && "animate-fire-shake"
          )}>
            🔥
          </span>
          
          {/* Multiple fires for higher streaks */}
          {isBlazing && (
            <>
              <span className="absolute -left-3 top-1 text-3xl opacity-70 animate-fire-float" style={{ animationDelay: '0.2s' }}>🔥</span>
              <span className="absolute -right-3 top-1 text-3xl opacity-70 animate-fire-float" style={{ animationDelay: '0.5s' }}>🔥</span>
            </>
          )}
          
          {isLegendary && (
            <>
              <span className="absolute -left-6 top-3 text-2xl opacity-50 animate-fire-float" style={{ animationDelay: '0.3s' }}>✨</span>
              <span className="absolute -right-6 top-3 text-2xl opacity-50 animate-fire-float" style={{ animationDelay: '0.7s' }}>✨</span>
            </>
          )}
        </div>

        {/* Streak count */}
        <div className="relative z-10">
          <p className={cn(
            "text-4xl font-bold mb-1",
            isLegendary && "text-premium",
            isBlazing && !isLegendary && "text-orange-400"
          )}>
            {streak}
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Day{streak !== 1 ? 's' : ''} Streak
          </p>
          
          {/* Streak label */}
          {isLegendary && (
            <span className="inline-block px-3 py-1 rounded-full bg-premium/20 text-premium text-xs font-medium animate-pulse">
              🏆 Legendary!
            </span>
          )}
          {isBlazing && !isLegendary && (
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
              🌟 Blazing!
            </span>
          )}
          {isOnFire && !isBlazing && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
              On Fire!
            </span>
          )}
          {!isOnFire && streak > 0 && (
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-muted-foreground text-xs font-medium">
              Keep going!
            </span>
          )}
          
          {/* Longest streak */}
          {longestStreak !== undefined && longestStreak > streak && (
            <p className="text-xs text-muted-foreground mt-3">
              Best: {longestStreak} days 🏅
            </p>
          )}
        </div>
      </div>
    </div>
  );
}