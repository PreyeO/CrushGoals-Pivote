import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Crown, Medal, Trophy, TrendingUp, Users, Loader2, Globe, UserPlus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useFriends } from "@/hooks/useFriends";
import { AddFriendModal } from "@/components/AddFriendModal";
import { FriendRequestCard } from "@/components/FriendRequestCard";

type ViewFilter = "global" | "friends";
type TimeFilter = "week" | "alltime";

export default function Leaderboard() {
  const { entries, userRank, isLoading } = useLeaderboard();
  const { friendsWithStats, pendingRequests, isLoading: friendsLoading, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const [viewFilter, setViewFilter] = useState<ViewFilter>("global");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("alltime");
  const [addFriendOpen, setAddFriendOpen] = useState(false);

  if (isLoading || friendsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 min-h-screen flex items-center justify-center">
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
  const rest = displayEntries.slice(3, 10);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {viewFilter === "global" ? "Global Leaderboard 🏆" : "Friends Leaderboard 👥"}
              </h1>
              <p className="text-muted-foreground">
                {viewFilter === "global" 
                  ? "Compete with goal crushers worldwide" 
                  : "See how you rank among friends"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={viewFilter === "global" ? "default" : "outline"} 
                className="gap-2" 
                size="sm"
                onClick={() => setViewFilter("global")}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">Global</span>
              </Button>
              <Button 
                variant={viewFilter === "friends" ? "default" : "outline"} 
                className="gap-2 relative" 
                size="sm"
                onClick={() => setViewFilter("friends")}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-[10px] rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
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

          {/* Pending Friend Requests */}
          {viewFilter === "friends" && pendingRequests.length > 0 && (
            <div className="glass-card p-4 rounded-2xl mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-warning" />
                <h3 className="font-semibold text-sm">Pending Friend Requests ({pendingRequests.length})</h3>
              </div>
              <div className="space-y-2">
                {pendingRequests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    id={request.id}
                    name={request.user_profile?.full_name || 'Unknown'}
                    email={request.user_profile?.email || ''}
                    onAccept={acceptFriendRequest}
                    onReject={rejectFriendRequest}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add Friend Button for Friends Tab */}
          {viewFilter === "friends" && (
            <div className="mb-6">
              <Button onClick={() => setAddFriendOpen(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Friend
              </Button>
            </div>
          )}

          {viewFilter === "friends" && friendsWithStats.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">No Friends Yet</h3>
              <p className="text-muted-foreground mb-4">Add friends to compete on your own leaderboard!</p>
              <Button onClick={() => setAddFriendOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Friend
              </Button>
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
              <div className="text-5xl sm:text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Leaderboard is empty</h3>
              <p className="text-muted-foreground">Be the first to start crushing goals!</p>
            </div>
          ) : (
            <>
              {/* Podium - show when 1+ entries */}
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

              {/* Rankings List */}
              {rest.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden mb-6 lg:mb-8 overflow-x-auto">
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
                      {rest.map((entry) => (
                        <tr key={entry.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 sm:p-4 font-bold text-base sm:text-lg">#{entry.rank}</td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-sm sm:text-base">
                                {entry.avatar}
                              </div>
                              <span className="font-medium text-sm sm:text-base">{entry.name}</span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base">{entry.tasks_completed}</td>
                          <td className="p-3 sm:p-4 text-right">
                            <span className="text-orange-400 text-sm sm:text-base">🔥 {entry.current_streak}</span>
                          </td>
                          <td className="p-3 sm:p-4 text-right text-primary text-sm sm:text-base">{entry.total_xp.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Your Rank Card */}
              {userRank && viewFilter === "global" && (
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
                      {userRank.change > 0 && (
                        <p className="text-success flex items-center gap-1 justify-center sm:justify-end mb-1 text-sm">
                          <TrendingUp className="w-4 h-4" /> Moved up {userRank.change} spots!
                        </p>
                      )}
                      {userRank.rank > 1 && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Keep crushing goals to climb higher! 🔥
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <AddFriendModal 
        open={addFriendOpen} 
        onOpenChange={setAddFriendOpen}
        onSendRequest={sendFriendRequest}
      />
    </div>
  );
}
