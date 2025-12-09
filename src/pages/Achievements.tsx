import { Sidebar } from "@/components/Sidebar";
import { Trophy, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedDate?: string;
  xpReward: number;
  progress?: number;
  requirement?: string;
}

const badges: Badge[] = [
  { id: "1", name: "Fire Starter", description: "Maintain a 1-day streak", icon: "🔥", rarity: "common", unlocked: true, unlockedDate: "Jan 1, 2026", xpReward: 50 },
  { id: "2", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "⚔️", rarity: "common", unlocked: true, unlockedDate: "Jan 7, 2026", xpReward: 200 },
  { id: "3", name: "Fortnight Fighter", description: "Maintain a 14-day streak", icon: "🛡️", rarity: "rare", unlocked: true, unlockedDate: "Jan 14, 2026", xpReward: 500 },
  { id: "4", name: "Month Master", description: "Maintain a 30-day streak", icon: "👑", rarity: "epic", unlocked: false, progress: 77, requirement: "23/30 days", xpReward: 1000 },
  { id: "5", name: "Quarter Champion", description: "Reach 25% of any goal", icon: "🎯", rarity: "common", unlocked: true, unlockedDate: "Jan 5, 2026", xpReward: 300 },
  { id: "6", name: "Halfway Hero", description: "Reach 50% of any goal", icon: "🦸", rarity: "rare", unlocked: false, progress: 68, requirement: "34% / 50%", xpReward: 750 },
  { id: "7", name: "Task Rookie", description: "Complete 10 tasks", icon: "✅", rarity: "common", unlocked: true, unlockedDate: "Jan 2, 2026", xpReward: 100 },
  { id: "8", name: "Task Hunter", description: "Complete 100 tasks", icon: "🎯", rarity: "rare", unlocked: true, unlockedDate: "Jan 12, 2026", xpReward: 500 },
  { id: "9", name: "Task Master", description: "Complete 500 tasks", icon: "🏆", rarity: "epic", unlocked: false, progress: 50, requirement: "247/500 tasks", xpReward: 1500 },
  { id: "10", name: "Perfect Day", description: "Complete all tasks in one day", icon: "⭐", rarity: "common", unlocked: true, unlockedDate: "Jan 3, 2026", xpReward: 200 },
  { id: "11", name: "Perfect Week", description: "7 perfect days in a row", icon: "🌟", rarity: "rare", unlocked: false, progress: 43, requirement: "3/7 days", xpReward: 1000 },
  { id: "12", name: "Early Bird", description: "Complete morning tasks 7 days", icon: "🌅", rarity: "rare", unlocked: true, unlockedDate: "Jan 10, 2026", xpReward: 400 },
  { id: "13", name: "Consistency King", description: "100-day streak", icon: "💎", rarity: "legendary", unlocked: false, progress: 23, requirement: "23/100 days", xpReward: 5000 },
  { id: "14", name: "Goal Crusher", description: "Complete a goal 100%", icon: "🏅", rarity: "epic", unlocked: false, progress: 34, requirement: "Best: 34%", xpReward: 2000 },
  { id: "15", name: "Photo Proof", description: "Upload 1 evidence photo", icon: "📸", rarity: "common", unlocked: true, unlockedDate: "Jan 4, 2026", xpReward: 100 },
  { id: "16", name: "Level 10", description: "Reach XP Level 10", icon: "🔟", rarity: "rare", unlocked: false, progress: 70, requirement: "Level 7/10", xpReward: 1000 },
];

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
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.xpReward, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Achievements 🏆</h1>
            <p className="text-muted-foreground">Collect badges and show off your accomplishments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-primary">{unlockedCount}/{badges.length}</p>
              <p className="text-sm text-muted-foreground">Badges Unlocked</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-success">+{totalXP.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">XP from Badges</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-purple-400">2</p>
              <p className="text-sm text-muted-foreground">Epic Badges</p>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-premium">0</p>
              <p className="text-sm text-muted-foreground">Legendary Badges</p>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`glass-card p-6 rounded-2xl border-2 transition-all duration-300 ${
                  badge.unlocked 
                    ? `${rarityBorders[badge.rarity]} hover:scale-105 cursor-pointer` 
                    : "border-white/5 opacity-60"
                }`}
              >
                <div className="text-center">
                  {/* Badge Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg`
                      : "bg-white/10"
                  }`}>
                    {badge.unlocked ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>

                  {/* Badge Name */}
                  <h3 className="font-semibold mb-1">{badge.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>

                  {/* Rarity */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize ${
                    badge.rarity === "legendary" ? "bg-amber-500/20 text-amber-400" :
                    badge.rarity === "epic" ? "bg-purple-500/20 text-purple-400" :
                    badge.rarity === "rare" ? "bg-blue-500/20 text-blue-400" :
                    "bg-slate-500/20 text-slate-400"
                  }`}>
                    {"⭐".repeat(badge.rarity === "legendary" ? 4 : badge.rarity === "epic" ? 3 : badge.rarity === "rare" ? 2 : 1)}
                    {badge.rarity}
                  </div>

                  {/* Status */}
                  {badge.unlocked ? (
                    <div className="mt-4">
                      <p className="text-xs text-success mb-2">Unlocked {badge.unlockedDate}</p>
                      <p className="text-xs text-premium">+{badge.xpReward} XP</p>
                      <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs">
                        <Share2 className="w-3 h-3" /> Share
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{badge.requirement}</p>
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
