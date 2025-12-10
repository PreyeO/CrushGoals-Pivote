import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalCardProps {
  id: string;
  emoji: string;
  name: string;
  progress: number;
  currentValue: string;
  targetValue: string;
  timeRemaining: string;
  status: "on-track" | "behind" | "ahead" | "completed";
  tasksToday: { completed: number; total: number };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: GoalCardProps) {
  const statusConfig = {
    "on-track": { label: "On Track", color: "text-success", bg: "bg-success/20" },
    "behind": { label: "Behind", color: "text-warning", bg: "bg-warning/20" },
    "ahead": { label: "Crushing It!", color: "text-primary", bg: "bg-primary/20" },
    "completed": { label: "Completed!", color: "text-premium", bg: "bg-premium/20" },
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
      className="p-4 sm:p-5 hover-lift hover-glow cursor-pointer group relative overflow-hidden h-full"
      onClick={onClick}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col h-full">
        {/* Header with emoji, name and status */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <h3 className="text-base font-semibold truncate">{name}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", bg, color)}>
              {status === "ahead" && <TrendingUp className="w-3 h-3" />}
              {label}
            </span>
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/10">
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Goal
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Progress Ring and Stats */}
        <div className="flex items-center gap-4 mb-4">
          <ProgressRing progress={progress} size={70} strokeWidth={6} variant={getVariant()}>
            <div className="text-center">
              <span className="text-lg font-bold">{Math.round(progress)}%</span>
            </div>
          </ProgressRing>

          <div className="flex-1 space-y-2 min-w-0">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Progress</p>
              <p className="text-sm font-medium truncate">
                {currentValue} <span className="text-muted-foreground">/ {targetValue}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Time Left</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{timeRemaining}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Today */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
          <span className="text-sm text-muted-foreground">Tasks today</span>
          <span className="text-sm font-medium">
            <span className={tasksToday.completed === tasksToday.total ? "text-success" : ""}>
              {tasksToday.completed}
            </span>
            /{tasksToday.total}
          </span>
        </div>
      </div>
    </Card>
  );
}
