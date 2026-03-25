"use client";

import { useState } from "react";
import { Trophy, ChevronDown, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrgGoal } from "@/types";
import { cn } from "@/lib/utils";

interface CrushedGoalsSectionProps {
  crushedGoals: OrgGoal[];
}

export function CrushedGoalsSection({ crushedGoals }: CrushedGoalsSectionProps) {
  const [showCrushed, setShowCrushed] = useState(false);

  if (crushedGoals.length === 0) return null;

  return (
    <div className="pt-4 border-t border-border/10">
      <button
        onClick={() => setShowCrushed(!showCrushed)}
        className="flex items-center justify-between w-full py-2 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-left">
            <span className="text-[12px] font-black text-foreground block uppercase tracking-wider">
              Crushed Goals
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {crushedGoals.length} target{crushedGoals.length !== 1 ? 's' : ''} successfully hit
            </span>
          </div>
        </div>
        <div
          className={cn(
            "w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center transition-transform",
            showCrushed ? "rotate-180" : "",
          )}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>

      {showCrushed && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {crushedGoals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card border-emerald-500/20 bg-emerald-500/[0.02] p-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{goal.emoji}</span>
                <div>
                  <h4 className="text-[13px] font-bold text-foreground">
                    {goal.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Successfully reached on{" "}
                    {new Date(goal.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-3">
                <CheckCircle className="w-3 h-3" />
                Crushed
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
