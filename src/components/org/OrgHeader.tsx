"use client";

import { Organization } from "@/types";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

interface OrgHeaderProps {
    org: Organization;
}

export function OrgHeader({ org }: OrgHeaderProps) {
    const members = useStore(useShallow((state) => state.members));
    const user = useStore((state) => state.user);
    const myMember = members.find(m => m.userId === user?.id && m.orgId === org.id);
    const isMemberOnly = myMember?.role === "member";

    return (
        <header className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-3">
                <span className="text-3xl">{org.emoji}</span>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{org.name}</h1>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{org.description}</p>
                </div>
            </div>

            {!isMemberOnly && (
                <CreateGoalModal orgId={org.id}>
                    <Button className="gradient-primary text-white border-0 px-6 h-10 text-xs font-semibold glow-primary gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Goal
                    </Button>
                </CreateGoalModal>
            )}
        </header>
    );
}
