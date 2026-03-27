"use client";

import {
  Target,
  CheckCircle,
  TrendingUp,
  UserPlus,
  MessageSquare,
  AlertCircle,
  Activity,
} from "lucide-react";
import { ActivityItem } from "@/types";

const activityIcons: Record<string, React.ElementType> = {
  goal_created: Target,
  goal_completed: CheckCircle,
  milestone_hit: TrendingUp,
  member_joined: UserPlus,
  comment: MessageSquare,
  status_change: AlertCircle,
  goal_assigned: Target,
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div
      className="glass-card p-5 animate-slide-in-right"
      style={{ animationDelay: "160ms" }}
    >
      <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        Recent Activity
      </h2>
      <div className="space-y-3">
        {activities.map((act) => {
          const Icon = activityIcons[act.type] || Target;
          return (
            <div key={act.id} className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] leading-relaxed">
                  <span className="font-semibold">{act.userName}</span>{" "}
                  <span className="text-muted-foreground">{act.message}</span>
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  {new Date(act.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
