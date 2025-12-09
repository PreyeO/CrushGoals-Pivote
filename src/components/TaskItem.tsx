import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, Star } from "lucide-react";

interface TaskItemProps {
  id: string;
  title: string;
  goalName: string;
  goalEmoji: string;
  timeEstimate?: string;
  priority: "high" | "medium" | "low";
  completed?: boolean;
  onComplete?: (id: string) => void;
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
}: TaskItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [showXP, setShowXP] = useState(false);

  const handleComplete = () => {
    if (isCompleted) return;
    
    setIsCompleted(true);
    setShowXP(true);
    onComplete?.(id);
    
    setTimeout(() => setShowXP(false), 1000);
  };

  const priorityColors = {
    high: "bg-destructive/20 text-destructive",
    medium: "bg-warning/20 text-warning",
    low: "bg-success/20 text-success",
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
        "bg-white/5 border border-white/10 hover:bg-white/[0.08]",
        isCompleted && "opacity-60"
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

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-base font-medium transition-all duration-300",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-foreground-secondary">
            {goalEmoji} {goalName}
          </span>
          
          {timeEstimate && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeEstimate}
            </span>
          )}
          
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", priorityColors[priority])}>
            <Star className="w-3 h-3" />
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
        </div>
      </div>

      {/* XP Animation */}
      {showXP && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-count-up">
          <span className="text-sm font-bold text-success">+10 XP</span>
        </div>
      )}
    </div>
  );
}
