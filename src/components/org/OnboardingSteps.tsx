"use client";

import { CheckCircle2, Circle, Target, Users, Layout, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { InviteMemberModal } from "@/components/invite-member-modal";

interface OnboardingStepsProps {
  orgId: string;
  orgName: string;
  goalsCount: number;
  membersCount: number;
}

export function OnboardingSteps({ orgId, orgName, goalsCount, membersCount }: OnboardingStepsProps) {
  const steps = [
    {
      id: "create-org",
      title: "Create Organization",
      description: `Setup "${orgName}" workspace`,
      icon: Layout,
      isCompleted: true,
    },
    {
      id: "invite-team",
      title: "Invite your team",
      description: "Crush goals together",
      icon: Users,
      isCompleted: membersCount > 1,
      action: (
        <InviteMemberModal orgId={orgId}>
          <button className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
            Invite Member <ArrowRight className="w-3 h-3" />
          </button>
        </InviteMemberModal>
      ),
    },
    {
      id: "create-goal",
      title: "Set your first goal",
      description: "Define what success looks like",
      icon: Target,
      isCompleted: goalsCount > 0,
      action: (
        <CreateGoalModal orgId={orgId}>
          <button className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
            Create Goal <ArrowRight className="w-3 h-3" />
          </button>
        </CreateGoalModal>
      ),
    },
  ];

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-border/20 bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Getting Started</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete these steps to set up your workspace
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-primary">{Math.round(progress)}%</span>
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Progress</p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={cn(
              "p-4 rounded-xl transition-all border border-transparent",
              step.isCompleted ? "bg-accent/30" : "bg-background/40 hover:border-primary/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                step.isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn(
                    "text-sm font-bold truncate",
                    step.isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">
                  {step.description}
                </p>
                {!step.isCompleted && step.action && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                    {step.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
