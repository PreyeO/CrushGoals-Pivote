import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  ChevronRight,
  Target,
  Flame,
  Crown,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { OrgMember, OrgGoal, OrgRole } from "@/types";

const roleStyles: Record<
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

interface OrgMembersListProps {
  filteredMembers: OrgMember[];
  goals: OrgGoal[];
  orgId: string;
}

export function OrgMembersList({
  filteredMembers,
  goals,
  orgId,
}: OrgMembersListProps) {
  if (filteredMembers.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          No members match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
      {filteredMembers.map((member) => {
        const r = roleStyles[member.role];
        const memberGoals = goals.filter(
          (g) => g.orgId === orgId && g.assignedTo.includes(member.id),
        );
        const behindGoals = memberGoals.filter((g) => {
          if (g.status === "completed") return false;
          const now = Date.now();
          const start = new Date(g.startDate || g.createdAt).getTime();
          const end = new Date(g.deadline).getTime();
          const totalTime = end - start;
          const elapsed = now - start;
          const expected =
            totalTime > 0 ? Math.round((elapsed / totalTime) * 100) : 0;
          return g.progress < expected - 15;
        });
        const blockedGoals = memberGoals.filter((g) => g.status === "blocked");

        return (
          <Link
            key={member.id}
            href={`/org/${orgId}/members/${member.id}`}
            className="block"
          >
            <div className="glass-card-hover p-5 animate-fade-in-up group cursor-pointer relative overflow-hidden">
              {/* Subtle status indicators */}
              {blockedGoals.length > 0 && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-destructive text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                  {blockedGoals.length} Blocked
                </div>
              )}
              {behindGoals.length > 0 && blockedGoals.length === 0 && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                  {behindGoals.length} Behind
                </div>
              )}

              {/* Profile */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-11 h-11 border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                  <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[13px] truncate group-hover:text-primary transition-colors">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {member.email || "No email"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              <Badge className={`${r.class} text-[9px] gap-1 mb-4`}>
                <r.icon className="w-2.5 h-2.5" /> {r.label}
              </Badge>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Goals
                  </span>
                  <span className="font-bold">
                    {member.goalsCompleted}
                    <span className="text-muted-foreground font-normal">
                      /{member.goalsAssigned}
                    </span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-bold text-primary">
                      {member.completionRate}%
                    </span>
                  </div>
                  <Progress value={member.completionRate} className="h-1.25" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-[oklch(0.72_0.18_55)]" />{" "}
                    Streak
                  </span>
                  <span className="font-bold">{member.currentStreak} days</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/20 text-[9px] text-muted-foreground/50">
                Joined{" "}
                {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
