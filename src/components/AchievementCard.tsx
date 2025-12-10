import { Lock, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    stars: 1,
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    border: "border-blue-500/30",
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    stars: 2,
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    border: "border-purple-500/30",
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    stars: 3,
  },
  legendary: {
    gradient: "from-amber-400 to-amber-600",
    border: "border-amber-500/30",
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    stars: 4,
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

  const handleShare = async () => {
    const shareText = `🏆 I just unlocked the "${name}" badge on Goal Crusher!\n\n${emoji} ${description}\n\n⭐ ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badge\n💫 +${xpReward} XP\n\n#GoalCrusher #Achievement`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Achievement Unlocked: ${name}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== "AbortError") {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard! Share your achievement 🎉");
  };

  return (
    <div
      className={cn(
        "glass-card p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
        unlocked
          ? `${config.border} hover:scale-[1.02] cursor-pointer`
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

      <div className="relative text-center">
        {/* Badge Icon */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl relative",
            unlocked
              ? `bg-gradient-to-br ${config.gradient} shadow-lg`
              : "bg-white/10"
          )}
        >
          {unlocked ? (
            <>
              {emoji}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                <Check className="w-3 h-3 text-success-foreground" />
              </div>
            </>
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Badge Name */}
        <h3 className="font-bold mb-1 text-sm sm:text-base">{name}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[32px]">
          {description}
        </p>

        {/* Rarity Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize",
            config.bg,
            config.text
          )}
        >
          {"⭐".repeat(config.stars)}
          <span>{rarity}</span>
        </div>

        {/* Status Section */}
        {unlocked ? (
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-[11px] sm:text-xs text-muted-foreground mb-1">
              Unlocked {unlockedDate}
            </p>
            <p className="text-sm font-semibold text-premium mb-3">+{xpReward} XP</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                  config.gradient
                )}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              {progressText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
