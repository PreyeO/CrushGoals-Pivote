"use client";

import { use, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { OrgHeader } from "@/components/org/OrgHeader";
import { OrgStats } from "@/components/org/OrgStats";
import { ActiveGoalsList } from "@/components/org/ActiveGoalsList";
import { LeaderboardTable } from "@/components/org/LeaderboardTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { notFound } from "next/navigation";
import { getTeamHealthScore, getOrgLeaderboard } from "@/lib/store-utils";
import type { OrgGoal, OrgMember, Organization } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  Bell,
  AlertCircle,
  Ban,
  Clock,
  ChevronRight,
  Mail,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreateOrgModal } from "@/components/create-org-modal";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      {/* Enhanced Welcome Section for invited members */}
      {pendingInvitations.length > 0 && (
        <div className="mb-8 p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-xl -ml-12 -mb-12" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Welcome to {org.name}!
                </h3>
                <p className="text-sm text-muted-foreground">
                  You have {pendingInvitations.length} pending invitation
                  {pendingInvitations.length > 1 ? "s" : ""} waiting
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Pending Invites Card */}
              <div className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">Pending Invitations</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  You&apos;ve been invited to join{" "}
                  {pendingInvitations.length === 1
                    ? "another organization"
                    : `${pendingInvitations.length} other organizations`}{" "}
                  on CrushGoals.
                </p>
                <div className="flex flex-col gap-2">
                  {pendingInvitations.length === 1 ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/invite/${pendingInvitations[0].token}`)
                      }
                      className="w-full gap-2 gradient-primary text-white font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      <Mail className="w-4 h-4" />
                      View Invitation
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/invite/${pendingInvitations[0].token}`)
                        }
                        className="flex-1 gap-2 gradient-primary text-white font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        View First
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-primary/20 hover:bg-primary/5"
                          >
                            All {pendingInvitations.length}
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {pendingInvitations.map((inv, index) => (
                            <DropdownMenuItem
                              key={inv.id}
                              onClick={() =>
                                router.push(`/invite/${inv.token}`)
                              }
                              className="gap-3"
                            >
                              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  Organization Invite
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Click to accept
                                </p>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>

              {/* Create Org Card */}
              <div className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-accent/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <p className="font-semibold text-sm">Create Your Own Team</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Start your own organization and lead your team to crush goals
                  together.
                </p>
                <CreateOrgModal>
                  <Button
                    size="sm"
                    className="w-full gap-2 gradient-primary text-white font-semibold shadow-md shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Target className="w-4 h-4" />
                    Create Organization
                  </Button>
                </CreateOrgModal>
              </div>
            </div>
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
