import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { OrgGoal } from "@/types";

interface GoalStandardProgressProps {
  goal: OrgGoal;
  isOverdue: boolean;
}

export function GoalStandardProgress({
  goal,
  isOverdue,
}: GoalStandardProgressProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-widest">
          Overall Progress
        </span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          {goal.targetNumber
            ? `${goal.currentValue} / ${goal.targetNumber} ${goal.unit}`
            : goal.targetValue}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Progress
            value={goal.progress}
            className={cn(
              "h-3 rounded-full",
              isOverdue ? "bg-destructive/20" : "",
            )}
          />
        </div>
        <span
          className={cn(
            "text-lg font-black w-12 text-right tracking-tighter",
            isOverdue ? "text-destructive" : "text-primary",
          )}
        >
          {goal.progress}%
        </span>
      </div>
    </div>
  );
}
