import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Trophy, Loader2, Share2 } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import { useGoals } from "@/hooks/useGoals";
import { AchievementCard } from "@/components/AchievementCard";
import { SocialShareModal } from "@/components/SocialShareModal";
import { Button } from "@/components/ui/button";

export default function Achievements() {
  const { isLoading: achievementsLoading, getBadgesWithStatus } = useAchievements();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { goals, isLoading: goalsLoading } = useGoals();
  const [shareModal, setShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    type: 'achievement' | 'streak' | 'goal' | 'milestone';
    title: string;
    description: string;
    emoji?: string;
    stat?: string;
  } | null>(null);

  const isLoading = achievementsLoading || statsLoading || goalsLoading;

  const badges = getBadgesWithStatus(stats, goals);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);
  const epicBadges = badges.filter(b => b.unlocked && b.rarity === 'epic').length;
  const legendaryBadges = badges.filter(b => b.unlocked && b.rarity === 'legendary').length;

  const handleShareBadge = (badge: typeof badges[0]) => {
    setShareData({
      type: 'achievement',
      title: badge.name,
      description: badge.description,
      emoji: badge.emoji,
      stat: `+${badge.xpReward} XP`,
    });
    setShareModal(true);
  };

  const handleShareProgress = () => {
    setShareData({
      type: 'milestone',
      title: `${unlockedCount} Badges Unlocked!`,
      description: `I've earned ${totalXP.toLocaleString()} XP from badges on Goal Crusher!`,
      emoji: '🏆',
      stat: `Level ${stats?.level || 1}`,
    });
    setShareModal(true);
  };

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

  // Separate unlocked and locked badges
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <>
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-premium" />
                Achievements
              </h1>
              <p className="text-muted-foreground">Collect badges and share your accomplishments</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleShareProgress}
              disabled={unlockedCount === 0}
            >
              <Share2 className="w-4 h-4" />
              Share Progress
            </Button>
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

          {/* Unlocked Badges */}
          {unlockedBadges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏆 Unlocked Badges
                <span className="text-sm text-muted-foreground font-normal">({unlockedBadges.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {unlockedBadges.map((badge) => (
                  <AchievementCard
                    key={badge.id}
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
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🔒 Badges to Unlock
              <span className="text-sm text-muted-foreground font-normal">({lockedBadges.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {lockedBadges.map((badge) => (
                <AchievementCard
                  key={badge.id}
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
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    
    {/* Share Modal */}
    {shareData && (
      <SocialShareModal
        open={shareModal}
        onOpenChange={setShareModal}
        shareData={shareData}
      />
    )}
    </>
  );
}
