"use client";

import { useEffect } from "react";
import { useStore, AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { Organization } from "@/types";
import { DashboardPulse } from "./DashboardPulse";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const OrganizationGrid = dynamic(() =>
  import("./OrganizationGrid").then((mod) => mod.OrganizationGrid),
);
const DashboardGoals = dynamic(() =>
  import("./DashboardGoals").then((mod) => mod.DashboardGoals),
);

export function DashboardMain() {
  const searchParams = useSearchParams();
  const fetchInitialData = useStore((state) => state.fetchInitialData);

  // Payment Success Refresh
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const tier = searchParams.get("tier");

    if (paymentStatus === "success") {
      toast.success(
        `Welcome to the ${tier || "Pro"} plan! Unlocking your features now...`,
      );
      // Force refresh data to show new tier immediately
      fetchInitialData();

      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else if (paymentStatus === "error") {
      toast.error(
        "There was an issue processing your payment. Please contact support.",
      );
    }
  }, [searchParams, fetchInitialData]);

  const organizations = useStore(
    useShallow((state: AppState) => state.organizations),
  );

  const isLoading = useStore((state: AppState) => state.isLoading);

  // NOTE: We previously auto‑redirected members with a single org to that org
  // to avoid showing an 'empty' dashboard.  Removing that behaviour lets any
  // user (including invited members) freely visit the dashboard to create a
  // new org or view pending invites at any time.
  if (isLoading) {
    return <DashboardSkeleton />;
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

      <DashboardPulse organizations={organizations} />

      <DashboardStats
        orgCount={organizations.length}
        memberCount={totalMembers}
        goalCount={totalGoals}
      />

      <DashboardGoals />

      <OrganizationGrid organizations={organizations} showCreateCard={false} />
    </div>
  );
}
