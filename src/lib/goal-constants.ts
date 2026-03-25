import {
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Ban,
} from "lucide-react";
import type { GoalStatus, GoalPriority, MemberGoalStatusValue } from "@/types";

export const STALE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export const statusStyles: Record<
  GoalStatus,
  {
    label: string;
    dotColor: string;
    badgeClass: string;
    icon: React.ElementType;
  }
> = {
  not_started: {
    label: "Not Started",
    dotColor: "bg-muted-foreground",
    badgeClass: "bg-muted/60 text-muted-foreground",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    dotColor: "bg-[oklch(0.70_0.18_250)]",
    badgeClass: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]",
    icon: TrendingUp,
  },
  blocked: {
    label: "Blocked",
    dotColor: "bg-[oklch(0.62_0.24_25)]",
    badgeClass: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    dotColor: "bg-[oklch(0.65_0.20_155)]",
    badgeClass: "bg-[oklch(0.55_0.18_155_/_0.15)] text-[oklch(0.70_0.18_155)]",
    icon: CheckCircle,
  },
};

export const priorityStyles: Record<GoalPriority, { label: string; class: string }> = {
  high: {
    label: "High",
    class: "bg-[oklch(0.55_0.20_25_/_0.15)] text-[oklch(0.70_0.20_25)]",
  },
  medium: {
    label: "Medium",
    class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.75_0.15_80)]",
  },
  low: {
    label: "Low",
    class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]",
  },
};

export const memberStatusConfig: Record<
  MemberGoalStatusValue,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  on_track: {
    label: "On Track",
    badgeClass: "bg-primary/10 text-primary",
    icon: TrendingUp,
  },
  behind: {
    label: "Behind",
    badgeClass: "bg-yellow-500/10 text-yellow-400",
    icon: Clock,
  },
  blocked: {
    label: "Blocked",
    badgeClass: "bg-destructive/10 text-destructive",
    icon: Ban,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-400",
    icon: CheckCircle,
  },
};
