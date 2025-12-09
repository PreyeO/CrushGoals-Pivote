import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar } from "lucide-react";

interface GoalCardProps {
  id: string;
  emoji: string;
  name: string;
  progress: number;
  currentValue: string;
  targetValue: string;
  timeRemaining: string;
  status: "on-track" | "behind" | "ahead";
  tasksToday: { completed: number; total: number };
  onClick?: () => void;
}

export function GoalCard({
  emoji,
  name,
  progress,
  currentValue,
  targetValue,
  timeRemaining,
  status,
  tasksToday,
  onClick,
}: GoalCardProps) {
  const statusConfig = {
    "on-track": { label: "On Track", color: "text-success", bg: "bg-success/20" },
    "behind": { label: "Behind", color: "text-warning", bg: "bg-warning/20" },
    "ahead": { label: "Crushing It!", color: "text-primary", bg: "bg-primary/20" },
  };

  const { label, color, bg } = statusConfig[status];

  const getVariant = () => {
    if (progress >= 75) return "success";
    if (progress >= 50) return "default";
    if (progress >= 25) return "warning";
    return "danger";
  };

  return (
    <Card
      variant="glass"
      className="p-6 hover-lift hover-glow cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex items-start gap-5">
        {/* Progress Ring */}
        <ProgressRing progress={progress} size={100} strokeWidth={8} variant={getVariant()}>
          <div className="text-center">
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        </ProgressRing>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-lg font-semibold truncate">{name}</h3>
            </div>
            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", bg, color)}>
              {status === "ahead" && <TrendingUp className="w-3 h-3" />}
              {label}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Progress</p>
              <p className="text-sm font-medium">
                {currentValue} <span className="text-muted-foreground">/ {targetValue}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Time Left</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {timeRemaining}
              </p>
            </div>
          </div>

          {/* Tasks Today */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-sm text-muted-foreground">Tasks today</span>
            <span className="text-sm font-medium">
              <span className={tasksToday.completed === tasksToday.total ? "text-success" : ""}>
                {tasksToday.completed}
              </span>
              /{tasksToday.total}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
