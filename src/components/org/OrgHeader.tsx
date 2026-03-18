"use client";

import { Organization } from "@/types";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

interface OrgHeaderProps {
  org: Organization;
}

export function OrgHeader({ org }: OrgHeaderProps) {
  const members = useStore(useShallow((state) => state.members));
  const user = useStore((state) => state.user);
  const myMember = members.find(
    (m) => m.userId === user?.id && m.orgId === org.id,
  );
  const isMemberOnly = myMember?.role === "member";

  return (
    <header className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/20 pb-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{org.emoji}</span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {org.name}
        </h1>
      </div>

      {!isMemberOnly && (
        <div className="flex items-center gap-3 ml-auto">
          <InviteMemberModal orgId={org.id}>
            <Button
              variant="outline"
              className="border-border/60 hover:bg-accent/60 px-6 h-10 text-xs font-semibold gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Invite Teammate
            </Button>
          </InviteMemberModal>
          <CreateGoalModal orgId={org.id}>
            <Button className="gradient-primary text-white border-0 px-6 h-10 text-xs font-semibold glow-primary gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </CreateGoalModal>
        </div>
      )}
    </header>
  );
}
