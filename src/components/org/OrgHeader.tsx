"use client";

import { Badge } from "@/components/ui/badge";
import { Organization } from "@/types";

interface OrgHeaderProps {
    org: Organization;
}

export function OrgHeader({ org }: OrgHeaderProps) {
    return (
        <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">{org.emoji}</span>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{org.name}</h1>
                        <Badge variant="outline" className="capitalize text-[10px] font-semibold border-primary/30 text-primary">{org.plan}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{org.description}</p>
                </div>
            </div>
        </header>
    );
}
