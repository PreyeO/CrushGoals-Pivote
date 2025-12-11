import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Target, Flame, TrendingUp, Share2, Calendar } from "lucide-react";
import { startOfWeek, endOfWeek, format, subWeeks } from "date-fns";
import { toast } from "sonner";

interface WeeklySummaryData {
  tasksCompleted: number;
  totalTasks: number;
  goalsProgress: { name: string; progress: number; emoji: string }[];
  streakDays: number;
  xpEarned: number;
  perfectDays: number;
  achievementsEarned: { badge_name: string; badge_emoji: string }[];
  weekStart: string;
  weekEnd: string;
}

interface WeeklySummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeeklySummary({ open, onOpenChange }: WeeklySummaryProps) {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<WeeklySummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchWeeklySummary();
    }
  }, [open, user]);

  const fetchWeeklySummary = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const now = new Date();
      const weekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');

      // Fetch tasks for the week
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', startStr)
        .lte('due_date', endStr);

      const completedTasks = tasks?.filter(t => t.completed) || [];
      const totalTasks = tasks?.length || 0;

      // Calculate perfect days (days where all tasks were completed)
      const tasksByDay = tasks?.reduce((acc, task) => {
        const day = task.due_date;
        if (!acc[day]) acc[day] = { total: 0, completed: 0 };
        acc[day].total++;
        if (task.completed) acc[day].completed++;
        return acc;
      }, {} as Record<string, { total: number; completed: number }>) || {};

      const perfectDays = Object.values(tasksByDay).filter(
        day => day.total > 0 && day.completed === day.total
      ).length;

      // Fetch goals progress
      const { data: goals } = await supabase
        .from('goals')
        .select('name, progress, emoji')
        .eq('user_id', user.id)
        .neq('status', 'completed');

      // Fetch achievements earned this week
      const { data: achievements } = await supabase
        .from('achievements')
        .select('badge_name, badge_emoji')
        .eq('user_id', user.id)
        .gte('earned_at', startStr)
        .lte('earned_at', endStr);

      // Calculate XP earned (rough estimate: 10 XP per task)
      const xpEarned = completedTasks.length * 10 + perfectDays * 100;

      setSummary({
        tasksCompleted: completedTasks.length,
        totalTasks,
        goalsProgress: goals?.map(g => ({ 
          name: g.name, 
          progress: g.progress || 0, 
          emoji: g.emoji || '🎯' 
        })) || [],
        streakDays: perfectDays,
        xpEarned,
        perfectDays,
        achievementsEarned: achievements || [],
        weekStart: format(weekStart, 'MMM d'),
        weekEnd: format(weekEnd, 'MMM d, yyyy'),
      });
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!summary) return;

    const completionRate = summary.totalTasks > 0 
      ? Math.round((summary.tasksCompleted / summary.totalTasks) * 100) 
      : 0;

    const shareText = `📊 My Goal Crusher Weekly Summary\n\n` +
      `📅 ${summary.weekStart} - ${summary.weekEnd}\n` +
      `✅ ${summary.tasksCompleted}/${summary.totalTasks} tasks (${completionRate}%)\n` +
      `🔥 ${summary.perfectDays} perfect days\n` +
      `⚡ ${summary.xpEarned} XP earned\n` +
      `${summary.achievementsEarned.length > 0 ? `🏆 ${summary.achievementsEarned.length} new badges!\n` : ''}` +
      `\n#GoalCrusher #WeeklySummary #Productivity`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Weekly Summary', text: shareText });
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

  const completionRate = summary && summary.totalTasks > 0 
    ? Math.round((summary.tasksCompleted / summary.totalTasks) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-white/10 p-0">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">Weekly Summary</DialogTitle>
                {summary && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {summary.weekStart} - {summary.weekEnd}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your summary...</p>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              {/* Main Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card variant="glass" className="p-3 sm:p-4 text-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xl sm:text-2xl font-bold">{summary.tasksCompleted}/{summary.totalTasks}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Tasks Completed</p>
                </Card>
                <Card variant="glass" className="p-3 sm:p-4 text-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-success" />
                  <p className="text-xl sm:text-2xl font-bold">{completionRate}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Completion Rate</p>
                </Card>
                <Card variant="glass" className="p-3 sm:p-4 text-center">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-orange-400" />
                  <p className="text-xl sm:text-2xl font-bold">{summary.perfectDays}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Perfect Days</p>
                </Card>
                <Card variant="glass" className="p-3 sm:p-4 text-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-premium" />
                  <p className="text-xl sm:text-2xl font-bold">{summary.xpEarned}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">XP Earned</p>
                </Card>
              </div>

              {/* Goals Progress */}
              {summary.goalsProgress.length > 0 && (
                <Card variant="glass" className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-3 text-sm">Goals Progress</h3>
                  <div className="space-y-3">
                    {summary.goalsProgress.slice(0, 3).map((goal, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm flex items-center gap-2 truncate flex-1 mr-2">
                            <span>{goal.emoji}</span>
                            <span className="truncate">{goal.name}</span>
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Achievements */}
              {summary.achievementsEarned.length > 0 && (
                <Card variant="glass" className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-3 text-sm">Badges Earned This Week</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.achievementsEarned.map((achievement, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-1.5 px-2 py-1 bg-premium/20 rounded-full"
                      >
                        <span className="text-sm">{achievement.badge_emoji}</span>
                        <span className="text-xs font-medium">{achievement.badge_name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Share Button */}
              <Button 
                variant="glass" 
                className="w-full gap-2" 
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                Share Summary
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No data for last week</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
