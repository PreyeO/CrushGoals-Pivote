import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ProgressRing';
import {
  CheckSquare,
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsWidgetProps {
  todaysTasksCount: number;
  activeGoalsCount: number;
  currentStreak: number;
  tasksCompleted: number;
  className?: string;
}

export function StatsCardsWidget({
  todaysTasksCount,
  activeGoalsCount,
  currentStreak,
  tasksCompleted,
  className,
}: StatsCardsWidgetProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4", className)}>
      {/* Today's Tasks */}
      <Card variant="glass" className="p-3 sm:p-4 hover-scale relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5" />
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {todaysTasksCount}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
              Today's Tasks
            </p>
          </div>
        </div>
      </Card>

      {/* Active Goals */}
      <Card variant="glass" className="p-3 sm:p-4 hover-scale relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5" />
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {activeGoalsCount}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
              Active Goals
            </p>
          </div>
        </div>
      </Card>

      {/* Current Streak */}
      <Card variant="glass" className="p-3 sm:p-4 hover-scale relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/5" />
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {currentStreak}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
              Day Streak
            </p>
          </div>
        </div>
      </Card>

      {/* Tasks Completed */}
      <Card variant="glass" className="p-3 sm:p-4 hover-scale relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/5" />
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">
              {tasksCompleted}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide truncate">
              Tasks Done
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface MotivationalQuoteWidgetProps {
  quote: string;
  author: string;
  className?: string;
}

export function MotivationalQuoteWidget({ quote, author, className }: MotivationalQuoteWidgetProps) {
  return (
    <Card variant="glass" className={cn("p-4", className)}>
      <blockquote className="text-center">
        <p className="text-sm italic text-muted-foreground mb-2">"{quote}"</p>
        <footer className="text-xs text-muted-foreground">— {author}</footer>
      </blockquote>
    </Card>
  );
}

interface ProgressOverviewWidgetProps {
  goals: Array<{
    id: string;
    name: string;
    emoji: string;
    progress: number;
    target_value: string;
    current_value: string;
  }>;
  className?: string;
}

export function ProgressOverviewWidget({ goals, className }: ProgressOverviewWidgetProps) {
  const topGoals = goals.slice(0, 3);

  return (
    <Card variant="glass" className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Progress Overview</h3>
      </div>

      {topGoals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No active goals yet</p>
      ) : (
        <div className="space-y-3">
          {topGoals.map((goal) => (
            <div key={goal.id} className="min-w-0">
              <div className="flex items-center justify-between mb-2 gap-2">
                <span className="flex items-center gap-2 text-sm min-w-0 flex-1">
                  <span className="flex-shrink-0">{goal.emoji}</span>
                  <span className="truncate min-w-0">{goal.name}</span>
                </span>
                <span className="text-xs font-medium flex-shrink-0">
                  {goal.progress || 0}%
                </span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

interface QuickActionsWidgetProps {
  onAddGoal: () => void;
  onAddTask: () => void;
  className?: string;
}

export function QuickActionsWidget({ onAddGoal, onAddTask, className }: QuickActionsWidgetProps) {
  return (
    <Card variant="glass" className={cn("p-4", className)}>
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Quick Actions
      </h3>
      <div className="flex gap-2">
        <button
          onClick={onAddGoal}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm"
        >
          <Target className="w-4 h-4" />
          New Goal
        </button>
        <button
          onClick={onAddTask}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition-colors text-sm"
        >
          <CheckSquare className="w-4 h-4" />
          New Task
        </button>
      </div>
    </Card>
  );
}