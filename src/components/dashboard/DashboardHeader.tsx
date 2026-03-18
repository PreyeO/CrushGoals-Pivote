"use client";

import { useStore } from "@/lib/store";
import { Organization } from "@/types";
import { CreateOrgModal } from "@/components/create-org-modal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  organizations: Organization[];
  memberCount: number;
  goalCount: number;
  showCreateOrg?: boolean;
}

export function DashboardHeader({
  organizations,
  memberCount,
  goalCount,
  showCreateOrg = true,
}: DashboardHeaderProps) {
  const user = useStore((state) => state.user);

  return (
    <header className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name.split(" ")[0] || "User"}
          </h1>
          <span className="text-2xl">👋</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {showCreateOrg
            ? `You're managing ${organizations.length} organizations with ${memberCount} members and ${goalCount} active goals.`
            : `You're a member of ${organizations.length} organizations with ${goalCount} active goals across them.`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {showCreateOrg && (
          <CreateOrgModal>
            <Button className="gradient-primary text-white border-0 shadow-lg shadow-primary/20 h-10 px-5 font-bold tracking-tight gap-2">
              <Plus className="w-4 h-4" />
              Create Organization
            </Button>
          </CreateOrgModal>
        )}
      </div>
    </header>
  );
}
