import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, MoreVertical, Pencil, Trash2, Sparkles, Lock, Pause, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredOverlay } from "@/components/TrialExpiredOverlay";
import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
  id: string;
  title: string;
  goalName: string;
  goalEmoji: string;
  goalAction?: string; // e.g., "Read for 30 mins"
  timeEstimate?: string;
  priority: "high" | "medium" | "low" | null;
  completed?: boolean;
  status?: 'pending' | 'completed' | 'missed' | 'paused';
  onComplete?: (id: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskItem({
  id,
  title,
  goalName,
  goalEmoji,
  goalAction,
  timeEstimate,
  priority,
  completed = false,
  status = 'pending',
  onComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showXP, setShowXP] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTrialOverlay, setShowTrialOverlay] = useState(false);
  const { playSound } = useSoundEffects();
  const { canPerformActions } = useTrialStatus();

  // Sync with prop changes
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const handleComplete = () => {
    if (isCompleted) return;
    
    if (!canPerformActions) {
      setShowTrialOverlay(true);
      return;
    }
    
    setIsCompleted(true);
    setShowXP(true);
    playSound('taskComplete');
    onComplete?.(id);
    
    setTimeout(() => setShowXP(false), 1000);
  };

  const priorityConfig = {
    high: { 
      bg: "bg-destructive/10", 
      border: "border-destructive/30",
      text: "text-destructive",
      dot: "bg-destructive"
    },
    medium: { 
      bg: "bg-warning/10", 
      border: "border-warning/30",
      text: "text-warning",
      dot: "bg-warning"
    },
    low: { 
      bg: "bg-success/10", 
      border: "border-success/30",
      text: "text-success",
      dot: "bg-success"
    },
  };

  const statusConfig = {
    completed: { 
      label: 'Done', 
      className: 'bg-success/10 text-success border-success/20',
      icon: Check
    },
    missed: { 
      label: 'Missed', 
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertCircle
    },
    paused: { 
      label: 'Paused', 
      className: 'bg-warning/10 text-warning border-warning/20',
      icon: Pause
    },
    pending: null,
  };

  const priorityStyle = priority ? priorityConfig[priority] : null;
  const statusBadge = status !== 'pending' ? statusConfig[status] : null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl transition-all duration-300 group",
        "bg-gradient-to-r from-card/80 to-card/40",
        "border border-border/50",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        isCompleted && "opacity-50 hover:opacity-60"
      )}
    >
      {/* Priority indicator line */}
      {priorityStyle && !isCompleted && (
        <div className={cn(
          "absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300",
          priorityStyle.dot,
          isHovered && "w-1.5"
        )} />
      )}

      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={isCompleted}
        className={cn(
          "relative flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-300",
          "flex items-center justify-center",
          isCompleted
            ? "bg-gradient-to-br from-success to-success/80 border-transparent shadow-lg shadow-success/20"
            : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10 hover:scale-110"
        )}
      >
        {isCompleted && (
          <Check className="w-4 h-4 text-success-foreground animate-scale-in" />
        )}
      </button>

      {/* Goal Emoji with glow effect */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
        "bg-gradient-to-br from-white/10 to-white/5 border border-white/10",
        isHovered && !isCompleted && "scale-105 shadow-lg"
      )}>
        <span className="text-lg">{goalEmoji || '🎯'}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm sm:text-base font-medium transition-all duration-300 block truncate",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {title}
        </span>
        
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Goal Action Badge */}
          {goalAction && (
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {goalAction}
            </Badge>
          )}
          {timeEstimate && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
              "bg-muted/50 text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              {timeEstimate}
            </span>
          )}
          {priority && priorityStyle && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
              priorityStyle.bg,
              priorityStyle.text
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
          )}
          {/* Status Badge */}
          {statusBadge && (
            <Badge variant="outline" className={cn("text-xs gap-1", statusBadge.className)}>
              <statusBadge.icon className="w-3 h-3" />
              {statusBadge.label}
            </Badge>
          )}
        </div>
      </div>

      {/* XP Badge - shows on hover for incomplete tasks */}
      {!isCompleted && isHovered && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-premium/10 border border-premium/20 animate-fade-in">
          <Sparkles className="w-3 h-3 text-premium" />
          <span className="text-xs font-semibold text-premium">+10 XP</span>
        </div>
      )}

      {/* Actions Menu */}
      {(onEdit || onDelete) && !isCompleted && (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "p-2 rounded-lg transition-all duration-200 flex-shrink-0",
            "hover:bg-white/10",
            isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            {onEdit && (
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Pencil className="w-4 h-4" />
                Edit Task
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Task
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* XP Animation on complete */}
      {showXP && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-count-up pointer-events-none">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
            <Sparkles className="w-4 h-4 text-success" />
            <span className="text-sm font-bold text-success">+10 XP</span>
          </div>
        </div>
      )}

      {/* Trial Expired Overlay */}
      <TrialExpiredOverlay 
        open={showTrialOverlay} 
        onOpenChange={setShowTrialOverlay}
        actionType="complete"
      />
    </div>
  );
}
