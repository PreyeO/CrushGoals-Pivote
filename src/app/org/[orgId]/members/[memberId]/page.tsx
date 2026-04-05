"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { ArrowLeft } from "lucide-react";
import { MemberProfileHeader } from "@/components/org/MemberProfileHeader";
import { MemberStatsRow } from "@/components/org/MemberStatsRow";
import { MemberAlertBadges } from "@/components/org/MemberAlertBadges";
import { MemberGoalsList } from "@/components/org/MemberGoalsList";

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; memberId: string }>;
}) {
  const { orgId, memberId } = use(params);
  const [now] = useState(() => Date.now());

  const isLoading = useStore((state) => state.isLoading);
  const members = useStore(useShallow((state) => state.members));
  const goals = useStore(useShallow((state) => state.goals));
  const fetchMemberStatuses = useStore((state) => state.fetchMemberStatuses);
  const memberGoalStatuses = useStore(
    useShallow((state) => state.memberGoalStatuses),
  );

  const member = members.find((m) => m.id === memberId && m.orgId === orgId);
  const memberGoals = goals.filter(
    (g) => g.orgId === orgId && g.assignedTo?.includes(memberId),
  );

  useEffect(() => {
    if (memberGoals.length > 0) {
      fetchMemberStatuses(orgId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberGoals.length]);

  if (members.length === 0 || (isLoading && !member))
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh] animate-pulse text-muted-foreground text-sm tracking-widest uppercase font-bold">
        Loading member...
      </div>
    );

  if (!member) return notFound();

  // Derived Alerts
  const blockedGoals = memberGoals.filter((g) => g.status === "blocked");
  const overdueGoals = memberGoals.filter(
    (g) => g.status !== "completed" && new Date(g.deadline).getTime() < now,
  );
  const behindGoals = memberGoals.filter((g) => {
    if (g.status === "completed") return false;
    const start = new Date(g.startDate || g.createdAt).getTime();
    const end = new Date(g.deadline).getTime();
    const expected =
      end - start > 0
        ? Math.min(
            100,
            Math.max(0, Math.round(((now - start) / (end - start)) * 100)),
          )
        : 0;
    return g.progress < expected - 15;
  });

  return (
    <div className="p-5 pt-16 lg:pt-8 lg:p-8 max-w-5xl mx-auto">
      <Link
        href={`/org/${orgId}/members`}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-primary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
      </Link>

      <MemberProfileHeader member={member} />

      <MemberStatsRow member={member} />

      <MemberAlertBadges
        blockedGoals={blockedGoals}
        behindGoals={behindGoals}
        overdueGoals={overdueGoals}
      />

      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <MemberGoalsList
          memberGoals={memberGoals}
          member={member}
          memberGoalStatuses={memberGoalStatuses}
          now={now}
        />
      </div>
    </div>
  );
}
