import { Sidebar } from "@/components/Sidebar";
import { Crown, Medal, Trophy, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  tasks: number;
  streak: number;
  xp: number;
  change: number;
  verified: boolean;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: "JapaQueen247", avatar: "J", tasks: 847, streak: 45, xp: 12450, change: 0, verified: true },
  { rank: 2, name: "HustleKing", avatar: "H", tasks: 783, streak: 38, xp: 10230, change: 2, verified: true },
  { rank: 3, name: "FitQueen9ja", avatar: "F", tasks: 721, streak: 32, xp: 9450, change: -1, verified: true },
  { rank: 4, name: "GoalGetter", avatar: "G", tasks: 698, streak: 29, xp: 8920, change: 1, verified: false },
  { rank: 5, name: "DisciplinedDave", avatar: "D", tasks: 654, streak: 27, xp: 8340, change: 3, verified: true },
  { rank: 6, name: "MotivatedMary", avatar: "M", tasks: 612, streak: 24, xp: 7890, change: -2, verified: false },
  { rank: 7, name: "StreakMaster", avatar: "S", tasks: 587, streak: 41, xp: 7650, change: 0, verified: true },
  { rank: 8, name: "ProductivityPro", avatar: "P", tasks: 545, streak: 19, xp: 7120, change: 4, verified: false },
  { rank: 9, name: "FocusedFemi", avatar: "F", tasks: 523, streak: 21, xp: 6890, change: -1, verified: true },
  { rank: 10, name: "AchievementAce", avatar: "A", tasks: 498, streak: 18, xp: 6540, change: 1, verified: false },
];

const userRank = {
  rank: 47,
  name: "You",
  avatar: "C",
  tasks: 387,
  streak: 23,
  xp: 4560,
  change: 5,
  gapToNext: 23,
  gapToTop10: 111,
};

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="pl-64 min-h-screen">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Global Leaderboard 🏆</h1>
              <p className="text-muted-foreground">Compete with goal crushers across Nigeria</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Users className="w-4 h-4" />
                Friends Only
              </Button>
              <Button variant="ghost">This Week</Button>
              <Button variant="ghost">This Month</Button>
              <Button variant="ghost">All Time</Button>
            </div>
          </div>

          {/* Podium */}
          <div className="glass-card p-8 rounded-2xl mb-8">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-2xl font-bold text-slate-800 ring-4 ring-slate-400/50">
                  {leaderboardData[1].avatar}
                </div>
                <Medal className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                <h3 className="font-semibold">{leaderboardData[1].name}</h3>
                <p className="text-sm text-muted-foreground">{leaderboardData[1].tasks} tasks</p>
                <div className="h-24 w-24 bg-gradient-to-t from-slate-500/30 to-transparent rounded-t-lg mt-4" />
              </div>

              {/* 1st Place */}
              <div className="text-center -mt-8">
                <Crown className="w-8 h-8 mx-auto mb-2 text-premium animate-bounce-subtle" />
                <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-amber-900 ring-4 ring-premium/50 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                  {leaderboardData[0].avatar}
                </div>
                <h3 className="font-bold text-lg">{leaderboardData[0].name}</h3>
                <p className="text-premium font-semibold">{leaderboardData[0].tasks} tasks</p>
                <p className="text-xs text-muted-foreground">🔥 {leaderboardData[0].streak} day streak</p>
                <div className="h-32 w-28 bg-gradient-to-t from-premium/30 to-transparent rounded-t-lg mt-4" />
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl font-bold text-amber-100 ring-4 ring-amber-600/50">
                  {leaderboardData[2].avatar}
                </div>
                <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <h3 className="font-semibold">{leaderboardData[2].name}</h3>
                <p className="text-sm text-muted-foreground">{leaderboardData[2].tasks} tasks</p>
                <div className="h-16 w-24 bg-gradient-to-t from-amber-700/30 to-transparent rounded-t-lg mt-4" />
              </div>
            </div>
          </div>

          {/* Rankings List */}
          <div className="glass-card rounded-2xl overflow-hidden mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Tasks</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Streak</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">XP</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.slice(3).map((entry) => (
                  <tr key={entry.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-lg">#{entry.rank}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold">
                          {entry.avatar}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                        {entry.verified && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">Verified</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold">{entry.tasks}</td>
                    <td className="p-4 text-right">
                      <span className="text-orange-400">🔥 {entry.streak}</span>
                    </td>
                    <td className="p-4 text-right text-primary">{entry.xp.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {entry.change > 0 ? (
                        <span className="text-success flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4" /> +{entry.change}
                        </span>
                      ) : entry.change < 0 ? (
                        <span className="text-danger">↓ {Math.abs(entry.change)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Your Rank Card */}
          <div className="glass-card p-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary">#{userRank.rank}</div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                  {userRank.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">
                    {userRank.tasks} tasks • 🔥 {userRank.streak} streak • {userRank.xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-success flex items-center gap-1 justify-end mb-1">
                  <TrendingUp className="w-4 h-4" /> Moved up {userRank.change} spots this week!
                </p>
                <p className="text-sm text-muted-foreground">
                  Complete {userRank.gapToNext} more tasks to reach #{userRank.rank - 1}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userRank.gapToTop10} tasks away from top 10! 🔥
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
