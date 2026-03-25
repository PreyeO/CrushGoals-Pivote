"use client";

import { Organization } from "@/types";

export function OrgLabel({ orgId, orgs }: { orgId: string; orgs: Organization[] }) {
  const org = orgs.find((o) => o.id === orgId);
  if (!org) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-accent/60 text-muted-foreground">
      {org.emoji} {org.name}
    </span>
  );
}
