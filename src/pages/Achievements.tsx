import { Sidebar } from "@/components/Sidebar";
import { Trophy, Share2, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";

const rarityColors = {
  common: "from-slate-400 to-slate-500",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-amber-400 to-amber-600",
};

const rarityBorders = {
  common: "border-slate-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-amber-500/30",
};

export default function Achievements() {
  const { isLoading: achievementsLoading, getBadgesWithStatus } = useAchievements();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();

  const isLoading = achievementsLoading || statsLoading || goalsLoading;

  const badges = getBadgesWithStatus(stats, goals);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);
  const epicBadges = badges.filter(b => b.unlocked && b.rarity === 'epic').length;
  const legendaryBadges = badges.filter(b => b.unlocked && b.rarity === 'legendary').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Achievements 🏆</h1>
            <p className="text-muted-foreground">Collect badges and show off your accomplishments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{unlockedCount}/{badges.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Badges Unlocked</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-success">+{totalXP.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">XP from Badges</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400">{epicBadges}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Epic Badges</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-2xl sm:text-3xl font-bold text-premium">{legendaryBadges}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Legendary Badges</p>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`glass-card p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                  badge.unlocked 
                    ? `${rarityBorders[badge.rarity]} hover:scale-105 cursor-pointer` 
                    : "border-white/5 opacity-60"
                }`}
              >
                <div className="text-center">
                  {/* Badge Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg`
                      : "bg-white/10"
                  }`}>
                    {badge.unlocked ? badge.emoji : <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                  </div>

                  {/* Badge Name */}
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{badge.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{badge.description}</p>

                  {/* Rarity */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs capitalize ${
                    badge.rarity === "legendary" ? "bg-amber-500/20 text-amber-400" :
                    badge.rarity === "epic" ? "bg-purple-500/20 text-purple-400" :
                    badge.rarity === "rare" ? "bg-blue-500/20 text-blue-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {"⭐".repeat(badge.rarity === "legendary" ? 4 : badge.rarity === "epic" ? 3 : badge.rarity === "rare" ? 2 : 1)}
                    <span className="hidden sm:inline">{badge.rarity}</span>
                  </div>

                  {/* Status */}
                  {badge.unlocked ? (
                    <div className="mt-3 sm:mt-4">
                      <p className="text-[10px] sm:text-xs text-success mb-1 sm:mb-2">Unlocked {badge.unlockedDate}</p>
                      <p className="text-[10px] sm:text-xs text-premium">+{badge.xpReward} XP</p>
                      <Button variant="ghost" size="sm" className="mt-2 gap-1 text-[10px] sm:text-xs h-7 sm:h-8">
                        <Share2 className="w-3 h-3" /> Share
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 sm:mt-4">
                      <div className="h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{badge.progressText}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
