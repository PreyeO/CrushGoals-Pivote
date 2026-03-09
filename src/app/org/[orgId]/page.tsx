"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";
import { MembersInvitesList } from "@/components/org/MembersInvitesList";
import { LoadingState } from "@/components/ui/LoadingState";
import { notFound } from "next/navigation";
import { getTeamHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { OrgGoal, OrgMember, Organization } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  Bell,
  Users,
  AlertCircle,
  Ban,
  Clock,
  ChevronRight,
  Flame,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateOrgModal } from "@/components/create-org-modal";
import { useRouter } from "next/navigation";

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [mounted, setMounted] = useState(false);
  const [showNudge, setShowNudge] = useState(true);
  const [now] = useState(() => Date.now());

  const goals = useStore(
    useShallow((state) =>
      state.goals.filter((g: OrgGoal) => g.orgId === orgId),
    ),
  );
  const membersList = useStore(
    useShallow((state) =>
      state.members.filter((m: OrgMember) => m.orgId === orgId),
    ),
  );
  const org = useStore(
    useShallow((state) =>
      state.organizations.find((o: Organization) => o.id === orgId),
    ),
  );
  const pendingInvitations = useStore(
    useShallow((state) => state.pendingInvitations),
  );
  const fetchInitialData = useStore((state) => state.fetchInitialData);
  const isLoading = useStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetchInitialData(orgId);
  }, [orgId, fetchInitialData]);

  if (!mounted || (isLoading && !org)) return <LoadingState />;
  if (!org) return notFound();

  const health = getTeamHealthScore(orgId, goals, membersList);
  const leaderboard = getOrgLeaderboard(orgId, membersList);

  const activeGoalsCount = goals.filter(
    (g: OrgGoal) => g.status !== "completed",
  ).length;
  const completedGoalsCount = goals.filter(
    (g: OrgGoal) => g.status === "completed",
  ).length;

  // ===== Team Pulse Calculations =====
  const membersWithIssues: {
    member: OrgMember;
    behindCount: number;
    blockedCount: number;
    overdueCount: number;
    staleUpdate: boolean;
  }[] = membersList.map((member) => {
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

    const blockedCount = memberGoals.filter(
      (g: OrgGoal) => g.status === "blocked",
    ).length;
    const overdueCount = memberGoals.filter(
      (g: OrgGoal) =>
        g.status !== "completed" && new Date(g.deadline).getTime() < now,
    ).length;

    // Stale = no goal updates in last 5 days
    const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
    const hasRecentUpdate = memberGoals.some(
      (g: OrgGoal) => new Date(g.updatedAt).getTime() > fiveDaysAgo,
    );
    const staleUpdate = memberGoals.length > 0 && !hasRecentUpdate;

    return { member, behindCount, blockedCount, overdueCount, staleUpdate };
  });

  const needsAttention = membersWithIssues.filter(
    (m) =>
      m.behindCount > 0 ||
      m.blockedCount > 0 ||
      m.overdueCount > 0 ||
      m.staleUpdate,
  );

  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <OrgHeader org={org} />
      </div>

      {/* Pending invitation banner — show for users with pending invites */}
      {pendingInvitations.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                You have {pendingInvitations.length} pending invitation
                {pendingInvitations.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                You&apos;ve been invited to join{" "}
                {pendingInvitations.length === 1
                  ? "an organization"
                  : `${pendingInvitations.length} organizations`}{" "}
                on CrushGoals.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            {pendingInvitations.map((inv) => (
              <Button
                key={inv.id}
                size="sm"
                onClick={() => router.push(`/invite/${inv.token}`)}
                className="gap-1.5 rounded-xl gradient-primary text-white font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                View Invite
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Create Org Banner for invited members */}
      {pendingInvitations.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Create Your Own Organization
              </p>
              <p className="text-xs text-muted-foreground">
                Start your own team and crush goals together. You can create
                unlimited organizations.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            <CreateOrgModal>
              <Button
                size="sm"
                className="gap-1.5 rounded-xl gradient-primary text-white font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                Create Organization
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CreateOrgModal>
          </div>
        </div>
      )}

      {/* Weekly Nudge */}
      {showNudge && goals.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold">Weekly Check-in Time!</p>
              <p className="text-xs text-muted-foreground italic">
                &ldquo;How&apos;s your goal going? Update your progress to keep
                the team aligned.&rdquo;
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="text-xs h-8"
              onClick={() => setShowNudge(false)}
            >
              Update Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8"
              onClick={() => setShowNudge(false)}
            >
              Later
            </Button>
          </div>
        </div>
      )}

      <OrgStats
        activeGoals={activeGoalsCount}
        completedGoals={completedGoalsCount}
        memberCount={membersList.length}
        healthScore={health.overall}
        healthTrend={health.trend}
      />

      {/* Team Pulse — Who needs attention */}
      {needsAttention.length > 0 && (
        <div className="glass-card p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Team Pulse</h3>
                <p className="text-[10px] text-muted-foreground">
                  {needsAttention.length} member
                  {needsAttention.length > 1 ? "s" : ""} need
                  {needsAttention.length === 1 ? "s" : ""} attention
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {needsAttention
              .slice(0, 5)
              .map(
                ({
                  member,
                  behindCount,
                  blockedCount,
                  overdueCount,
                  staleUpdate,
                }) => (
                  <Link
                    key={member.id}
                    href={`/org/${orgId}/members/${member.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-accent/15 border border-border/10 hover:border-primary/20 transition-all group cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 border border-background">
                      <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-black">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        {blockedCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            <Ban className="w-2.5 h-2.5" /> {blockedCount}{" "}
                            blocked
                          </span>
                        )}
                        {overdueCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            <Clock className="w-2.5 h-2.5" /> {overdueCount}{" "}
                            overdue
                          </span>
                        )}
                        {behindCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                            <AlertCircle className="w-2.5 h-2.5" />{" "}
                            {behindCount} behind
                          </span>
                        )}
                        {staleUpdate && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                            <Clock className="w-2.5 h-2.5" /> Stale
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ),
              )}
          </div>

          {needsAttention.length > 5 && (
            <Link
              href={`/org/${orgId}/members`}
              className="block text-center mt-3 text-[11px] font-bold text-primary hover:underline"
            >
              View all {needsAttention.length} members →
            </Link>
          )}
        </div>
      )}

      <Tabs defaultValue="leaderboard" className="w-full space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-1">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Trophy className="w-4 h-4" /> Team Standings
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Target className="w-4 h-4" /> Active Goals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="leaderboard"
          className="mt-0 animate-in fade-in duration-300"
        >
          <LeaderboardTable leaderboard={leaderboard} />
        </TabsContent>

        <TabsContent
          value="goals"
          className="mt-0 animate-in fade-in duration-300"
        >
          <ActiveGoalsList orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
