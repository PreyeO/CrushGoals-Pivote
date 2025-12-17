import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingDown, Calendar, Target, Lightbulb, ArrowRight } from "lucide-react";

interface WhyBehindModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  progress: number;
  expectedProgress: number;
  daysRemaining: number;
  missedTasks: number;
  totalTasks: number;
  onPauseGoal?: () => void;
}

export function WhyBehindModal({
  open,
  onOpenChange,
  goalName,
  progress,
  expectedProgress,
  daysRemaining,
  missedTasks,
  totalTasks,
  onPauseGoal,
}: WhyBehindModalProps) {
  const gap = expectedProgress - progress;
  const catchUpTasksPerDay = totalTasks > 0 ? Math.ceil((missedTasks / daysRemaining) + 1) : 1;

  const getInsight = () => {
    if (missedTasks > 10) {
      return {
        emoji: "🎯",
        title: "Consider adjusting your goal",
        description: "You've missed quite a few tasks. Would it help to pause or extend your deadline?",
        action: "Pause Goal",
      };
    } else if (gap > 30) {
      return {
        emoji: "💪",
        title: "Time to catch up!",
        description: `You're ${Math.round(gap)}% behind schedule. Try completing ${catchUpTasksPerDay} tasks daily to get back on track.`,
        action: "Got it",
      };
    } else {
      return {
        emoji: "⚡",
        title: "Small gap - easy fix!",
        description: "You're slightly behind but can catch up quickly with a bit of extra effort this week.",
        action: "Got it",
      };
    }
  };

  const insight = getInsight();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] w-[95vw] bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-warning" />
            Why Am I Behind?
          </DialogTitle>
          <DialogDescription>
            Understanding your progress on "{goalName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Comparison */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Your progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-warning transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Expected by now</span>
              <span className="font-semibold text-success">{Math.round(expectedProgress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-success/50 transition-all duration-500"
                style={{ width: `${expectedProgress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground">Days left</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{missedTasks}</p>
              <p className="text-xs text-muted-foreground">Missed tasks</p>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 text-center">
              <TrendingDown className="w-4 h-4 mx-auto mb-1 text-warning" />
              <p className="text-lg font-bold">{Math.round(gap)}%</p>
              <p className="text-xs text-muted-foreground">Gap</p>
            </div>
          </div>

          {/* Insight */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.emoji}</span>
              <div>
                <p className="font-medium">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-premium" />
              Quick tips to catch up:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                Focus on completing today's tasks first
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                Try completing 1-2 extra tasks on weekends
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3" />
                Consider pausing if life gets too busy
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {missedTasks > 10 && onPauseGoal ? (
              <>
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Keep Going
                </Button>
                <Button className="flex-1" onClick={onPauseGoal}>
                  Pause Goal
                </Button>
              </>
            ) : (
              <Button className="w-full" onClick={() => onOpenChange(false)}>
                {insight.action}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}