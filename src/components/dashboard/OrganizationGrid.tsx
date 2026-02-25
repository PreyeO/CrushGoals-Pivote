"use client";

import Link from "next/link";
import { Users, Target, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Organization } from "@/types";
import { CreateOrgModal } from "@/components/create-org-modal";

interface OrganizationGridProps {
    organizations: Organization[];
}

export function OrganizationGrid({ organizations }: OrganizationGridProps) {
    return (
        <>
            <div className="mb-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Organizations</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                {organizations.map((org) => (
                    <Link href={`/org/${org.id}`} key={org.id} className="block">
                        <div className="glass-card-hover p-6 animate-fade-in-up group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-accent/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                    {org.emoji}
                                </div>
                                <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wider">
                                    {org.plan}
                                </span>
                            </div>
                            <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{org.name}</h3>
                            <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                                {org.description}
                            </p>
                            <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> {org.memberCount}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Target className="w-3 h-3" /> {org.goalCount} goals
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-[11px] mb-1.5">
                                    <span className="text-muted-foreground">Goal Completion</span>
                                    <span className="font-bold text-primary">{org.completionRate}%</span>
                                </div>
                                <Progress value={org.completionRate} className="h-1.5" />
                            </div>
                        </div>
                    </Link>
                ))}

                <CreateOrgModal>
                    <div className="glass-card border-dashed !border-2 !border-border/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:!border-primary/30 transition-all animate-fade-in-up group h-full">
                        <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors group-hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Create Organization</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Set up a new team and start tracking goals together.
                        </p>
                    </div>
                </CreateOrgModal>
            </div>
        </>
    );
}
