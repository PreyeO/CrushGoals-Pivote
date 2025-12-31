import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface TaskItemProps {
  id: string;
  title: string;
  goalName: string;
  goalEmoji: string;
  timeEstimate?: string;
  priority: "high" | "medium" | "low" | null;
  completed?: boolean;
  onComplete?: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskItem({
  id,
  title,
  goalName,
  goalEmoji,
  timeEstimate,
  priority,
  completed = false,
  onComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showXP, setShowXP] = useState(false);
  const { playSound } = useSoundEffects();

  // Sync with prop changes
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleComplete = () => {
    if (isCompleted) return;
    
    setIsCompleted(true);
    setShowXP(true);
    playSound('taskComplete');
    onComplete?.(id);
    
    setTimeout(() => setShowXP(false), 1000);
  };

  const priorityColors = {
    high: "bg-destructive/20 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning border-warning/30",
    low: "bg-success/20 text-success border-success/30",
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all duration-300",
        "bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10",
        "hover:from-white/10 hover:to-white/5 hover:border-white/20",
        isCompleted && "opacity-50"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={isCompleted}
        className={cn(
          "relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "bg-gradient-success border-transparent"
            : "border-white/30 hover:border-primary hover:bg-primary/10"
        )}
      >
        {isCompleted && (
          <Check className="w-4 h-4 text-success-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in" />
        )}
      </button>

      {/* Goal Emoji */}
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <span className="text-base">{goalEmoji || '🎯'}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm sm:text-base font-medium transition-all duration-300 block truncate",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {title}
        </span>
        
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          {timeEstimate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeEstimate}
            </span>
          )}
          {priority && (
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border",
              priorityColors[priority]
            )}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      {(onEdit || onDelete) && !isCompleted && (
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-white/10">
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* XP Animation */}
      {showXP && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-count-up">
          <span className="text-sm font-bold text-success">+10 XP</span>
        </div>
      )}
    </div>
  );
}
