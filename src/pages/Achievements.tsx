import { Sidebar } from "@/components/Sidebar";
import { Trophy, Loader2 } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";
import { AchievementCard } from "@/components/AchievementCard";
import { Card } from "@/components/ui/card";

export default function Achievements() {
  const { isLoading: achievementsLoading, getBadgesWithStatus } = useAchievements();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();

  const isLoading = achievementsLoading || statsLoading || goalsLoading;

  const badges = getBadgesWithStatus(stats, goals);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);

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

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-premium" />
              Achievements
            </h1>
            <p className="text-sm text-muted-foreground">Collect badges as you progress</p>
          </div>

          {/* Stats - Compact */}
          <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up opacity-0" style={{ animationDelay: '50ms' }}>
            <Card variant="glass" className="p-3 text-center">
              <p className="text-xl font-bold text-primary">{unlockedCount}/{badges.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Unlocked</p>
            </Card>
            <Card variant="glass" className="p-3 text-center">
              <p className="text-xl font-bold text-success">+{totalXP.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground uppercase">XP Earned</p>
            </Card>
          </div>

          {/* Unlocked Badges */}
          {unlockedBadges.length > 0 && (
            <div className="mb-6 animate-slide-up opacity-0" style={{ animationDelay: '100ms' }}>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                Unlocked
                <span className="text-xs text-muted-foreground font-normal">({unlockedBadges.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unlockedBadges.map((badge, i) => (
                  <div 
                    key={badge.id}
                    className="animate-slide-up opacity-0"
                    style={{ animationDelay: `${150 + i * 50}ms` }}
                  >
                    <AchievementCard
                      id={badge.id}
                      name={badge.name}
                      description={badge.description}
                      emoji={badge.emoji}
                      rarity={badge.rarity}
                      xpReward={badge.xpReward}
                      unlocked={badge.unlocked}
                      unlockedDate={badge.unlockedDate}
                      progress={badge.progress}
                      progressText={badge.progressText}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          <div className="animate-slide-up opacity-0" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              To Unlock
              <span className="text-xs text-muted-foreground font-normal">({lockedBadges.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lockedBadges.map((badge, i) => (
                <div 
                  key={badge.id}
                  className="animate-slide-up opacity-0"
                  style={{ animationDelay: `${250 + i * 30}ms` }}
                >
                  <AchievementCard
                    id={badge.id}
                    name={badge.name}
                    description={badge.description}
                    emoji={badge.emoji}
                    rarity={badge.rarity}
                    xpReward={badge.xpReward}
                    unlocked={badge.unlocked}
                    unlockedDate={badge.unlockedDate}
                    progress={badge.progress}
                    progressText={badge.progressText}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}