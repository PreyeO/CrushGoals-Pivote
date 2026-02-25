"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Organization } from "@/types";

interface QuickActionsProps {
    organizations: Organization[];
}

export function QuickActions({ organizations }: QuickActionsProps) {
    const firstOrg = organizations[0];

    const actions = [
        { label: `Go to ${firstOrg?.name || "your org"}`, desc: "View dashboard and goals", href: `/org/${firstOrg?.id || ""}` },
        { label: "View Team Goals", desc: "Track progress and milestones", href: `/org/${firstOrg?.id || ""}/goals` },
        { label: "Team Leaderboard", desc: "See who's crushing it", href: `/org/${firstOrg?.id || ""}/leaderboard` },
    ];

    return (
        <div className="mt-8 glass-card p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                Quick Actions
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
                {actions.map((action) => (
                    <Link key={action.label} href={action.href}>
                        <div className="p-4 rounded-xl bg-accent/30 hover:bg-accent/60 transition-colors group/action cursor-pointer h-full">
                            <p className="font-medium text-[13px] mb-0.5 group-hover/action:text-primary transition-colors">{action.label}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                {action.desc}
                                <ArrowRight className="w-3 h-3 opacity-0 group-hover/action:opacity-100 transition-opacity" />
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
