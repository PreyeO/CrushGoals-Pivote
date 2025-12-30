import { Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xpReward: number;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  progressText: string;
}

const rarityConfig = {
  common: {
    gradient: "from-slate-400 to-slate-500",
    border: "border-slate-500/30",
    bg: "bg-slate-500/20",
    text: "text-slate-400",
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    border: "border-blue-500/30",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    border: "border-purple-500/30",
    bg: "bg-purple-500/20",
    text: "text-purple-400",
  },
  legendary: {
    gradient: "from-amber-400 to-amber-600",
    border: "border-amber-500/30",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
  },
};

export function AchievementCard({
  name,
  description,
  emoji,
  rarity,
  xpReward,
  unlocked,
  unlockedDate,
  progress,
  progressText,
}: AchievementCardProps) {
  const config = rarityConfig[rarity];

  return (
    <div
      className={cn(
        "glass-card p-3 rounded-xl border transition-all duration-300 relative overflow-hidden hover-scale",
        unlocked
          ? `${config.border} cursor-pointer`
          : "border-white/5 opacity-60"
      )}
    >
      {/* Glow effect for unlocked */}
      {unlocked && (
        <div className={cn(
          "absolute inset-0 opacity-10 bg-gradient-to-br pointer-events-none",
          config.gradient
        )} />
      )}

      <div className="relative">
        <div className="flex items-start gap-3">
          {/* Badge Icon */}
          <div
            className={cn(
              "w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg relative",
              unlocked
                ? `bg-gradient-to-br ${config.gradient}`
                : "bg-white/10"
            )}
          >
            {unlocked ? (
              <>
                {emoji}
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-success-foreground" />
                </div>
              </>
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{name}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{description}</p>
            
            {/* Rarity + XP inline */}
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn(
                "text-[10px] font-medium capitalize",
                config.text
              )}>
                {rarity}
              </span>
              <span className="text-[10px] text-premium font-medium">+{xpReward} XP</span>
            </div>
          </div>
        </div>

        {/* Progress for locked badges */}
        {!unlocked && (
          <div className="mt-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                  config.gradient
                )}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{progressText}</p>
          </div>
        )}

        {/* Unlocked date */}
        {unlocked && unlockedDate && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Unlocked {unlockedDate}
          </p>
        )}
      </div>
    </div>
  );
}