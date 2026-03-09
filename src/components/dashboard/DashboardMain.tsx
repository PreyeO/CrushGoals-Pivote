"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { OrganizationGrid } from "./OrganizationGrid";
import { QuickActions } from "./QuickActions";
import { DashboardGoals } from "./DashboardGoals";
import { Organization, OrgInvite, OrgMember } from "@/types";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardMain() {
  const router = useRouter();
  const organizations = useStore(
    useShallow((state: AppState) => state.organizations),
  );
  const members = useStore(useShallow((state: AppState) => state.members));
  const invitations = useStore(
    useShallow((state: AppState) => state.pendingInvitations),
  );
  const memberGoalStatuses = useStore(
    useShallow((state: AppState) => state.memberGoalStatuses),
  );
  const user = useStore(useShallow((state: AppState) => state.user));
  const isLoading = useStore((state: AppState) => state.isLoading);
  const fetchInitialData = useStore(
    (state: AppState) => state.fetchInitialData,
  );

  const STALE_MS = 5 * 24 * 60 * 60 * 1000;
  const [now] = useState(() => Date.now());

  const { blockedCount, staleCount } = useMemo(() => {
    const blocked = memberGoalStatuses.filter(
      (s) => s.status === "blocked",
    ).length;
    const stale = memberGoalStatuses.filter(
      (s) => now - new Date(s.updatedAt).getTime() > STALE_MS,
    ).length;
    return { blockedCount: blocked, staleCount: stale };
  }, [memberGoalStatuses, now, STALE_MS]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const isOwnerOrAdmin = members.some(
    (m: OrgMember) =>
      m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  // NOTE: We previously auto‑redirected members with a single org to that org
  // to avoid showing an 'empty' dashboard.  Removing that behaviour lets any
  // user (including invited members) freely visit the dashboard to create a
  // new org or view pending invites at any time.
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground font-medium">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  const totalGoals = organizations.reduce(
    (s: number, o: Organization) => s + (o.goalCount || 0),
    0,
  );
  const totalMembers = organizations.reduce(
    (s: number, o: Organization) => s + (o.memberCount || 0),
    0,
  );

  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-6xl mx-auto">
      {/* any user can create their own org — gate on payment here later */}
      <DashboardHeader
        organizations={organizations}
        memberCount={totalMembers}
        goalCount={totalGoals}
        showCreateOrg={true}
      />

      {/* Pending invitation banner — always visible while pending invitations exist */}
      {invitations.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                You have {invitations.length} pending invitation
                {invitations.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                You&apos;ve been invited to join{" "}
                {invitations.length === 1
                  ? "an organization"
                  : `${invitations.length} organizations`}{" "}
                on CrushGoals.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            {invitations.map((inv: OrgInvite) => (
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

      {/* Team Pulse — visible to owners/admins when any member statuses are loaded */}
      {isOwnerOrAdmin &&
        organizations.length > 0 &&
        (blockedCount > 0 || staleCount > 0) && (
          <div className="mb-6 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-yellow-400" /> Team Pulse
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {blockedCount > 0 && (
                  <span className="text-destructive font-semibold">
                    {blockedCount} member{blockedCount > 1 ? "s" : ""} blocked
                  </span>
                )}
                {blockedCount > 0 && staleCount > 0 && " · "}
                {staleCount > 0 && (
                  <span className="text-yellow-400 font-semibold">
                    {staleCount} member{staleCount > 1 ? "s" : ""} with stale
                    updates
                  </span>
                )}
                {" — expand a goal card to see details."}
              </p>
            </div>
          </div>
        )}

      <DashboardStats
        orgCount={organizations.length}
        memberCount={totalMembers}
        goalCount={totalGoals}
      />

      <DashboardGoals />

      <OrganizationGrid organizations={organizations} showCreateCard={true} />

      <QuickActions organizations={organizations} />
    </div>
  );
}
