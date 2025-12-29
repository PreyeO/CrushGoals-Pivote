import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { cn } from "@/lib/utils";
import { TrendingUp, Calendar, MoreVertical, Pencil, Trash2, Plus, CalendarDays, Copy, Pause, Play, HelpCircle, Users } from "lucide-react";
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
  tasksToday: { completed: number; total: number };
  startDate?: string;
  endDate?: string;
  isPaused?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTask?: () => void;
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
  startDate,
  endDate,
  isPaused,
  onClick,
  onEdit,
  onDelete,
  onAddTask,
  onViewCalendar,
  onDuplicate,
  onPauseToggle,
  onWhyBehind,
  onShare,
}: GoalCardProps) {
  const statusConfig = {
    "on-track": { label: "On Track", color: "text-success", bg: "bg-success/20" },
    "behind": { label: "Behind", color: "text-warning", bg: "bg-warning/20" },
    "ahead": { label: "Crushing It!", color: "text-primary", bg: "bg-primary/20" },
    "completed": { label: "Completed!", color: "text-premium", bg: "bg-premium/20" },
    "paused": { label: "Paused", color: "text-muted-foreground", bg: "bg-muted" },
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
        "p-3 sm:p-4 hover-lift hover-glow cursor-pointer group relative overflow-hidden h-full",
        isPaused && "opacity-70"
      )}
      onClick={onClick}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col h-full">
        {/* Header with emoji, name and status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xl flex-shrink-0">{isPaused ? "⏸️" : emoji}</span>
            <h3 className={cn("text-sm font-semibold truncate", isPaused && "text-muted-foreground")}>{name}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {status === "behind" && !isPaused && onWhyBehind && (
              <button
                onClick={(e) => { e.stopPropagation(); onWhyBehind(); }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors bg-warning/20 text-warning"
                title="Why am I behind?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", bg, color)}>
              {status === "ahead" && !isPaused && <TrendingUp className="w-3 h-3" />}
              {isPaused && <Pause className="w-3 h-3" />}
              {label}
            </span>
            {(onEdit || onDelete || onAddTask || onViewCalendar || onDuplicate || onPauseToggle || onShare) && (
              <DropdownMenu>
                <DropdownMenuTrigger 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors bg-white/5"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-white/10 z-50">
                  {onAddTask && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddTask(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </DropdownMenuItem>
                  )}
                  {onViewCalendar && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewCalendar(); }}>
                      <CalendarDays className="w-4 h-4 mr-2" />
                      View Calendar
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      Share with Friends
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Goal
                    </DropdownMenuItem>
                  )}
                  {onPauseToggle && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPauseToggle(); }}>
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
                  {(onAddTask || onViewCalendar || onDuplicate || onPauseToggle || onShare) && (onEdit || onDelete) && <DropdownMenuSeparator />}
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
        <div className="flex items-center gap-3 mb-3">
          <ProgressRing progress={progress} size={56} strokeWidth={5} variant={getVariant()}>
            <div className="text-center">
              <span className="text-sm font-bold">{Math.round(progress)}%</span>
            </div>
          </ProgressRing>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="text-sm font-medium truncate">
              {currentValue} <span className="text-muted-foreground">/ {targetValue}</span>
            </p>
          </div>
        </div>

        {/* Tasks Info - Simplified */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{timeRemaining}</span>
          </div>
          <span className="font-medium">
            {tasksToday.total > 0 ? (
              <><span className="text-primary">{tasksToday.completed}</span> of {tasksToday.total} today</>
            ) : (
              <span className="text-muted-foreground">No tasks today</span>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
}
