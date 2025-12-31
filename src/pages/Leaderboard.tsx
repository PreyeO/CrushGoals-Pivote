import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Crown, Medal, Trophy, TrendingUp, Users, Loader2, Globe, UserPlus, Bell, Target, CheckCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useFriends } from "@/hooks/useFriends";
import { useSharedGoals, SharedGoalMember } from "@/hooks/useSharedGoals";
import { InviteFriendModal } from "@/components/InviteFriendModal";
import { FriendRequestCard } from "@/components/FriendRequestCard";
import { SharedGoalDetailModal } from "@/components/SharedGoalDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import { useMainLayout } from "@/hooks/useMainLayout";
import { cn } from "@/lib/utils";

type ViewFilter = "global" | "friends";
type TimeFilter = "week" | "alltime";

export default function Leaderboard() {
  const { user } = useAuth();
  const { mainPaddingClass } = useMainLayout();
  const [viewFilter, setViewFilter] = useState<ViewFilter>("global");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("alltime");
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [selectedSharedGoal, setSelectedSharedGoal] = useState<{ id: string; name: string; isOwner: boolean } | null>(null);
  const [sharedGoalProgress, setSharedGoalProgress] = useState<Record<string, SharedGoalMember[]>>({});
  
  const { entries, userRank, isLoading } = useLeaderboard(timeFilter);
  const { friendsWithStats, pendingRequests, isLoading: friendsLoading, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { sharedGoals, pendingInvites, acceptInvite, declineInvite, getSharedGoalProgress, isLoading: sharedLoading } = useSharedGoals();
  
  // Fetch progress for all shared goals when viewing friends tab
  useEffect(() => {
    const fetchAllProgress = async () => {
      if (viewFilter !== "friends" || sharedGoals.length === 0) return;
      
      const progressMap: Record<string, SharedGoalMember[]> = {};
      for (const sg of sharedGoals) {
        const progress = await getSharedGoalProgress(sg.id);
        progressMap[sg.id] = progress;
      }
      setSharedGoalProgress(progressMap);
    };
    
    fetchAllProgress();
  }, [viewFilter, sharedGoals]);

  if (isLoading || friendsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className={cn("min-h-screen flex items-center justify-center transition-all duration-300", mainPaddingClass)}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Use friends data when viewing friends tab
  const displayEntries = viewFilter === "friends" 
    ? friendsWithStats.map((f, i) => ({
        rank: i + 1,
        user_id: f.user_id,
        name: f.name,
        avatar: f.avatar,
        tasks_completed: f.tasks_completed,
        current_streak: f.current_streak,
        total_xp: f.total_xp,
        level: f.level,
        change: 0,
      }))
    : entries;

  const top3 = displayEntries.slice(0, 3);
  // Show top 10 + current user if not in top 10 (for global view)
  const currentUserId = user?.id;
  const isUserInTop10 = displayEntries.slice(0, 10).some(e => e.user_id === currentUserId);
  const userEntry = !isUserInTop10 ? displayEntries.find(e => e.user_id === currentUserId) : null;
  const top10List = displayEntries.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className={cn("min-h-screen transition-all duration-300", mainPaddingClass)}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Global Leaderboard 🏆
              </h1>
              <p className="text-muted-foreground">
                Top 10 goal crushers worldwide
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="default" 
                className="gap-2" 
                size="sm"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Global</span>
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 relative opacity-50 cursor-not-allowed" 
                size="sm"
                disabled
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
                <span className="text-[10px] text-warning ml-1">Soon</span>
              </Button>
              <div className="w-px bg-border mx-1" />
              <Button 
                variant={timeFilter === "week" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setTimeFilter("week")}
              >
                This Week
              </Button>
              <Button 
                variant={timeFilter === "alltime" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setTimeFilter("alltime")}
              >
                All Time
              </Button>
            </div>
          </div>

          {displayEntries.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">
                {timeFilter === "week" ? "No activity this week" : "Leaderboard is empty"}
              </h3>
              <p className="text-muted-foreground">
                {timeFilter === "week" 
                  ? "Complete tasks to appear on the weekly leaderboard!"
                  : "Be the first to start crushing goals!"}
              </p>
            </div>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length >= 1 && (
                <div className="glass-card p-4 sm:p-8 rounded-2xl mb-6 lg:mb-8">
                  <div className="flex items-end justify-center gap-2 sm:gap-4">
                    {/* 2nd Place */}
                    {top3[1] && (
                      <div className="text-center flex-1 max-w-[120px]">
                        <div className="text-lg sm:text-xl font-bold text-slate-400 mb-2">#2</div>
                        <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-lg sm:text-2xl font-bold text-slate-800 ring-2 sm:ring-4 ring-slate-400/50">
                          {top3[1]?.avatar}
                        </div>
                        <Medal className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-slate-300" />
                        <h3 className="font-semibold text-xs sm:text-base truncate">{top3[1]?.name}</h3>
                        <p className="text-[10px] sm:text-sm text-muted-foreground">{top3[1]?.tasks_completed} tasks</p>
                        <p className="text-primary text-xs">{top3[1]?.total_xp.toLocaleString()} XP</p>
                        <div className="h-16 sm:h-24 w-full bg-gradient-to-t from-slate-500/30 to-transparent rounded-t-lg mt-2 sm:mt-4" />
                      </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                      <div className="text-center flex-1 max-w-[140px] -mt-4 sm:-mt-8">
                        <div className="text-xl sm:text-2xl font-bold text-premium mb-2">#1</div>
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-premium animate-bounce-subtle" />
                        <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl sm:text-3xl font-bold text-amber-900 ring-2 sm:ring-4 ring-premium/50 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                          {top3[0]?.avatar}
                        </div>
                        <h3 className="font-bold text-sm sm:text-lg truncate">{top3[0]?.name}</h3>
                        <p className="text-premium font-semibold text-xs sm:text-base">{top3[0]?.tasks_completed} tasks</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">🔥 {top3[0]?.current_streak} day streak</p>
                        <p className="text-primary text-xs font-medium">{top3[0]?.total_xp.toLocaleString()} XP</p>
                        <div className="h-20 sm:h-32 w-full bg-gradient-to-t from-premium/30 to-transparent rounded-t-lg mt-2 sm:mt-4" />
                      </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                      <div className="text-center flex-1 max-w-[120px]">
                        <div className="text-lg sm:text-xl font-bold text-amber-600 mb-2">#3</div>
                        <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg sm:text-2xl font-bold text-amber-100 ring-2 sm:ring-4 ring-amber-600/50">
                          {top3[2]?.avatar}
                        </div>
                        <Trophy className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-amber-600" />
                        <h3 className="font-semibold text-xs sm:text-base truncate">{top3[2]?.name}</h3>
                        <p className="text-[10px] sm:text-sm text-muted-foreground">{top3[2]?.tasks_completed} tasks</p>
                        <p className="text-primary text-xs">{top3[2]?.total_xp.toLocaleString()} XP</p>
                        <div className="h-12 sm:h-16 w-full bg-gradient-to-t from-amber-700/30 to-transparent rounded-t-lg mt-2 sm:mt-4" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Top 10 Rankings List */}
              {top10List.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden mb-6 lg:mb-8 overflow-x-auto">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold">Top 10 Rankings</h3>
                  </div>
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">Rank</th>
                        <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">Tasks</th>
                        <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">Streak</th>
                        <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top10List.map((entry) => (
                        <tr 
                          key={entry.rank} 
                          className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                            entry.user_id === user?.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2">
                              {entry.rank === 1 && <Crown className="w-4 h-4 text-premium" />}
                              {entry.rank === 2 && <Medal className="w-4 h-4 text-slate-300" />}
                              {entry.rank === 3 && <Trophy className="w-4 h-4 text-amber-600" />}
                              <span className="font-bold text-base sm:text-lg">#{entry.rank}</span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                                entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900' :
                                entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800' :
                                entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100' :
                                'bg-gradient-primary'
                              }`}>
                                {entry.avatar}
                              </div>
                              <div>
                                <span className="font-medium text-sm sm:text-base block">{entry.name}</span>
                                <span className="text-xs text-muted-foreground">Level {entry.level}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base">{entry.tasks_completed}</td>
                          <td className="p-3 sm:p-4 text-right">
                            <span className="text-orange-400 text-sm sm:text-base">🔥 {entry.current_streak}</span>
                          </td>
                          <td className="p-3 sm:p-4 text-right text-primary font-medium text-sm sm:text-base">{entry.total_xp.toLocaleString()}</td>
                        </tr>
                      ))}
                      {/* Show current user if not in top 10 */}
                      {userEntry && (
                        <>
                          <tr className="border-b border-white/10">
                            <td colSpan={5} className="p-2 text-center text-muted-foreground text-xs">...</td>
                          </tr>
                          <tr className="border-b border-white/5 bg-primary/10">
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base sm:text-lg">#{userEntry.rank}</span>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base bg-gradient-primary">
                                  {userEntry.avatar}
                                </div>
                                <div>
                                  <span className="font-medium text-sm sm:text-base block">{userEntry.name} (You)</span>
                                  <span className="text-xs text-muted-foreground">Level {userEntry.level}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base">{userEntry.tasks_completed}</td>
                            <td className="p-3 sm:p-4 text-right">
                              <span className="text-orange-400 text-sm sm:text-base">🔥 {userEntry.current_streak}</span>
                            </td>
                            <td className="p-3 sm:p-4 text-right text-primary font-medium text-sm sm:text-base">{userEntry.total_xp.toLocaleString()}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Your Rank Card - Show if user is not in top 10 */}
              {userRank && userRank.rank > 10 && (
                <div className="glass-card p-4 sm:p-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">#{userRank.rank}</div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-primary flex items-center justify-center text-base sm:text-lg font-bold">
                        {userRank.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">Your Ranking</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {userRank.tasks_completed} tasks • 🔥 {userRank.current_streak} streak • {userRank.total_xp.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {userRank.rank - 10} spots away from top 10! 🔥
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <InviteFriendModal 
        open={addFriendOpen} 
        onOpenChange={setAddFriendOpen}
      />

      <SharedGoalDetailModal
        sharedGoal={selectedSharedGoal}
        onOpenChange={(open) => !open && setSelectedSharedGoal(null)}
      />
    </div>
  );
}
