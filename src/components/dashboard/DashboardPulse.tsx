"use client";

import { useMemo, useState } from "react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Organization, OrgMember, OrgGoal } from "@/types";
import { Zap, AlertCircle, Ban, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardPulseProps {
  organizations: Organization[];
}

export function DashboardPulse({ organizations }: DashboardPulseProps) {
  const members = useStore(useShallow((state: AppState) => state.members));
  const goals = useStore(useShallow((state: AppState) => state.goals));
  const memberGoalStatuses = useStore(
    useShallow((state: AppState) => state.memberGoalStatuses),
  );
  const user = useStore(useShallow((state: AppState) => state.user));
  
  const STALE_MS = 5 * 24 * 60 * 60 * 1000;
  const [now] = useState(() => Date.now());

  const isOwnerOrAdmin = members.some(
    (m: OrgMember) =>
      m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  const needsAttention = useMemo(() => {
    return members
      .map((member) => {
        const memberGoals = goals.filter((g: OrgGoal) =>
          g.assignedTo.includes(member.id),
        );

        const behindCount = memberGoals.filter((g: OrgGoal) => {
          if (g.status === "completed") return false;
          const start = new Date(g.startDate || g.createdAt).getTime();
          const end = new Date(g.deadline).getTime();
          const totalTime = end - start;
          const elapsed = now - start;
          const expected =
            totalTime > 0 ? Math.round((elapsed / totalTime) * 100) : 0;
          return g.progress < expected - 15;
        }).length;

        const mBlockedCount = memberGoals.filter(
          (g: OrgGoal) => g.status === "blocked",
        ).length;
        
        const overdueCount = memberGoals.filter(
          (g: OrgGoal) =>
            g.status !== "completed" && new Date(g.deadline).getTime() < now,
        ).length;

        const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
        const hasRecentUpdate = memberGoals.some(
          (g: OrgGoal) => new Date(g.updatedAt).getTime() > fiveDaysAgo,
        );
        const staleUpdate = memberGoals.length > 0 && !hasRecentUpdate;

        return {
          member,
          behindCount,
          blockedCount: mBlockedCount,
          overdueCount,
          staleUpdate,
        };
      })
      .filter(
        (m) =>
          m.behindCount > 0 ||
          m.blockedCount > 0 ||
          m.overdueCount > 0 ||
          m.staleUpdate,
      );
  }, [members, goals, now]);

  if (!isOwnerOrAdmin || needsAttention.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shadow-[0_0_15px_-5px_rgba(234,179,8,0.3)]">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
              Pulse
              <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {needsAttention.length} {needsAttention.length === 1 ? "member needs" : "members need"} attention
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {needsAttention
          .slice(0, 3)
          .map(
            ({
              member,
              behindCount,
              blockedCount: mBlockedCount,
              overdueCount,
              staleUpdate,
            }) => (
              <Link
                key={member.id}
                href={`/org/${member.orgId}/members/${member.id}`}
                className="group relative flex flex-col p-4 rounded-2xl glass-card border-border/40 hover:border-yellow-500/40 hover:bg-yellow-500/[0.02] transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <Avatar className="w-10 h-10 border-2 border-background shadow-xl scale-100 group-hover:scale-110 transition-transform duration-500">
                    <AvatarFallback className="bg-yellow-500/10 text-yellow-600 text-[11px] font-black uppercase">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black truncate group-hover:text-yellow-600 transition-colors">
                      {member.name}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {organizations.find(o => o.id === member.orgId)?.name || "Member"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all duration-500" />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
                  {mBlockedCount > 0 && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 border border-white/10">
                      <Ban className="w-2.5 h-2.5" /> {mBlockedCount} Blocked
                    </div>
                  )}
                  {overdueCount > 0 && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 transition-colors">
                      <Clock className="w-2.5 h-2.5" /> {overdueCount} Overdue
                    </div>
                  )}
                  {behindCount > 0 && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-600 border border-yellow-500/20">
                      <AlertCircle className="w-2.5 h-2.5" /> {behindCount} Behind
                    </div>
                  )}
                  {staleUpdate && (
                    <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-accent border border-border/40 text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" /> Stale
                    </div>
                  )}
                </div>
              </Link>
            ),
          )}
      </div>
    </div>
  );
}
