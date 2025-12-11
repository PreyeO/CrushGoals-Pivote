import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface StreakCounterProps {
  streak: number;
  longestStreak?: number;
  className?: string;
  showShare?: boolean;
}

export function StreakCounter({ streak, longestStreak, className, showShare = true }: StreakCounterProps) {
  const isOnFire = streak >= 3;
  const isBlazing = streak >= 7;
  const isLegendary = streak >= 30;

  const handleShare = async () => {
    const label = isLegendary ? 'Legendary' : isBlazing ? 'Blazing' : isOnFire ? 'On Fire' : 'Growing';
    const shareText = `🔥 ${streak} Day Streak on Goal Crusher!\n\n${label} streak - I'm crushing my goals every day!\n\n#GoalCrusher #Streak #Productivity`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${streak} Day Streak!`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className={cn("relative h-full", className)}>
      <div className={cn(
        "glass-card p-3 sm:p-6 rounded-2xl text-center overflow-hidden relative h-full flex flex-col justify-center",
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
        <div className="relative mb-1 sm:mb-3">
          <span className={cn(
            "text-3xl sm:text-5xl inline-block",
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
            "text-2xl sm:text-4xl font-bold mb-0.5 sm:mb-1",
            isLegendary && "text-premium",
            isBlazing && !isLegendary && "text-orange-400"
          )}>
            {streak}
          </p>
          <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">
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
          
          {/* Share button */}
          {showShare && streak > 0 && (
            <button
              onClick={handleShare}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-3 h-3" />
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}