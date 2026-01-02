import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays,
  Copy,
  Pause,
  Play,
  HelpCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  tasksToday?: { completed: number; total: number };
  totalRemainingTasks?: number;
  totalTasksCompleted?: number;
  totalTasksCount?: number;
  startDate?: string;
  endDate?: string;
  isPaused?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewCalendar?: () => void;
  onDuplicate?: () => void;
  onPauseToggle?: () => void;
  onWhyBehind?: () => void;
  onShare?: () => void;
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
  totalRemainingTasks,
  totalTasksCompleted,
  totalTasksCount,
  isPaused,
  onClick,
  onEdit,
  onDelete,
  onViewCalendar,
  onDuplicate,
  onPauseToggle,
  onWhyBehind,
  onShare,
}: GoalCardProps) {
  const statusConfig = {
    "on-track": {
      label: "On Track",
      color: "text-success",
      bg: "bg-success/20",
    },
    behind: { label: "Behind", color: "text-warning", bg: "bg-warning/20" },
    ahead: {
      label: "Crushing It!",
      color: "text-success",
      bg: "bg-success/20",
    },
    completed: {
      label: "Completed!",
      color: "text-premium",
      bg: "bg-premium/20",
    },
    paused: { label: "Paused", color: "text-muted-foreground", bg: "bg-muted" },
  };

  const displayStatus = isPaused ? "paused" : status;
  const { label, color, bg } = statusConfig[displayStatus];

  const getVariant = () => {
    if (progress >= 75) return "success";
    if (progress >= 50) return "default";
    if (progress >= 25) return "warning";
    return "danger";
  };

  return (
    <Card
      variant="glass"
      className={cn(
        "w-full p-2 sm:p-3 lg:p-4 hover-lift hover-glow cursor-pointer group relative overflow-hidden h-full",
        isPaused && "opacity-70"
      )}
      onClick={onClick}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col h-full">
        {/* Header with emoji, name and status */}
        <div className="flex items-start justify-between gap-1 sm:gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">
              {isPaused ? "⏸️" : emoji}
            </span>
            <h3
              className={cn(
                "text-sm font-semibold truncate min-w-0",
                isPaused && "text-muted-foreground"
              )}
            >
              {name}
            </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {status === "behind" && !isPaused && onWhyBehind && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWhyBehind();
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors bg-warning/20 text-warning flex-shrink-0"
                title="Why am I behind?"
              >
                <HelpCircle className="w-3 h-3" />
              </button>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap",
                bg,
                color
              )}
            >
              {status === "ahead" && !isPaused && (
                <TrendingUp className="w-3 h-3" />
              )}
              {isPaused && <Pause className="w-3 h-3" />}
              {label}
            </span>
            {(onEdit ||
              onDelete ||
              onViewCalendar ||
              onDuplicate ||
              onPauseToggle ||
              onShare) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors bg-white/5 flex-shrink-0"
                >
                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-card border-white/10 z-[100]"
                >
                  {onViewCalendar && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCalendar();
                      }}
                    >
                      <CalendarDays className="w-4 h-4 mr-2" />
                      View Calendar
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Goal
                    </DropdownMenuItem>
                  )}
                  {onPauseToggle && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onPauseToggle();
                      }}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-2 text-success" />
                          Resume Goal
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2 text-warning" />
                          Pause Goal
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {(onViewCalendar || onDuplicate || onPauseToggle) &&
                    (onEdit || onDelete) && <DropdownMenuSeparator />}
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Goal
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
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
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <ProgressRing
            progress={progress}
            size={40}
            strokeWidth={4}
            variant={getVariant()}
          >
            <div className="text-center">
              <span className="text-xs sm:text-sm font-bold">
                {Math.round(progress)}%
              </span>
            </div>
          </ProgressRing>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="text-sm font-medium truncate">
              {totalTasksCount && totalTasksCount > 0 ? (
                <>
                  <span className="text-primary">
                    {totalTasksCompleted || 0}
                  </span>
                  <span className="text-muted-foreground">
                    /{totalTasksCount} tasks
                  </span>
                </>
              ) : targetValue === "Complete" || !targetValue ? (
                <span>{Math.round(progress)}% complete</span>
              ) : (
                <span className="truncate">
                  {currentValue} / {targetValue}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tasks Info - Show today + remaining */}
        <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-white/10 mt-auto text-xs gap-1 sm:gap-2">
          <div className="flex items-center gap-1 text-muted-foreground min-w-0 flex-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{timeRemaining}</span>
          </div>
          <span className="font-medium flex-shrink-0 sm:whitespace-nowrap text-xs">
            {tasksToday && tasksToday.total > 0 ? (
              <>
                <span className="text-primary">{tasksToday.completed}</span>/
                {tasksToday.total} today
                {totalRemainingTasks !== undefined &&
                  totalRemainingTasks > 0 && (
                    <span className="text-muted-foreground hidden sm:inline">
                      {" "}
                      · {totalRemainingTasks} left
                    </span>
                  )}
              </>
            ) : totalRemainingTasks !== undefined && totalRemainingTasks > 0 ? (
              <span className="text-muted-foreground">
                {totalRemainingTasks} tasks
              </span>
            ) : (
              <span className="text-muted-foreground">No tasks</span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
