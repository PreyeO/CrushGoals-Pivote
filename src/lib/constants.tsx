import { Crown, ShieldCheck, Shield, Clock, TrendingUp, Ban, CheckCircle } from "lucide-react";
import { OrgRole } from "@/types";

export const roleStyles: Record<
  OrgRole,
  { label: string; class: string; icon: React.ElementType }
> = {
  owner: {
    label: "Owner",
    class: "bg-[oklch(0.60_0.16_80_/_0.15)] text-[oklch(0.78_0.14_80)]",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    class: "bg-[oklch(0.55_0.20_250_/_0.15)] text-[oklch(0.70_0.18_250)]",
    icon: ShieldCheck,
  },
  member: {
    label: "Member",
    class: "bg-muted/60 text-muted-foreground",
    icon: Shield,
  },
};

export const goalStatusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  not_started: {
    label: "Not Started",
    color: "text-muted-foreground bg-muted/40",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    color: "text-[oklch(0.70_0.18_250)] bg-[oklch(0.55_0.20_250_/_0.15)]",
    icon: TrendingUp,
  },
  blocked: {
    label: "Blocked",
    color: "text-destructive bg-destructive/10",
    icon: Ban,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-500 bg-emerald-500/10",
    icon: CheckCircle,
  },
};
