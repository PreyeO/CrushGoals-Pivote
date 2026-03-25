"use client";

import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { CreateOrgModal } from "@/components/create-org-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Organization } from "@/types";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

interface SidebarOrgSwitcherProps {
  currentOrg?: Organization;
  urlOrgId?: string;
}

export function SidebarOrgSwitcher({
  currentOrg,
  urlOrgId,
}: SidebarOrgSwitcherProps) {
  const orgs = useStore(useShallow((state) => state.organizations));
  const user = useStore(useShallow((state) => state.user));

  if (!currentOrg) return null;

  return (
    <div className="px-3 mb-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer bg-accent/40 hover:bg-accent/60 text-foreground border border-border/20 shadow-sm group">
            <span className="text-lg bg-background/50 w-7 h-7 rounded-lg flex items-center justify-center border border-border/40 shadow-inner">
              {currentOrg.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-bold text-[13px] leading-tight">
                {currentOrg.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium opacity-60">
                Switch workspace
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[230px] bg-background/95 backdrop-blur-xl border-border/40 p-1.5 shadow-2xl"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 py-2">
            Your Organizations
          </DropdownMenuLabel>
          {orgs.map((org) => (
            <Link key={org.id} href={`/org/${org.id}`}>
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-0.5",
                  urlOrgId === org.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent",
                )}
              >
                <span className="text-base w-6 h-6 flex items-center justify-center">
                  {org.emoji}
                </span>
                <span className="font-semibold text-xs flex-1">
                  {org.name}
                </span>
                {urlOrgId === org.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            </Link>
          ))}

          <DropdownMenuSeparator className="my-1.5 opacity-40" />

          {/* Org Limit Gating */}
          {(() => {
            const tier = user?.subscriptionTier || "free";
            const orgLimit =
              tier === "free" ? 1 : tier === "pro" ? 3 : Infinity;
            const isLimitReached = orgs.length >= orgLimit;

            return (
              <CreateOrgModal disabled={isLimitReached}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    if (isLimitReached) {
                      e.preventDefault();
                      toast.error(
                        `You have reached the ${tier} limit of ${orgLimit} ${orgLimit === 1 ? "organization" : "organizations"}. Upgrade to create more.`,
                      );
                    } else {
                      e.preventDefault();
                    }
                  }}
                  disabled={isLimitReached}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all",
                    isLimitReached
                      ? "opacity-50 grayscale cursor-not-allowed bg-muted text-muted-foreground"
                      : "text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      isLimitReached
                        ? "bg-muted-foreground/20"
                        : "bg-primary/20",
                    )}
                  >
                    <Plus className="w-3.5 h-3.5 font-black" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-tight">
                    {isLimitReached
                      ? "Limit Reached (Upgrade)"
                      : "New Organization"}
                  </span>
                </DropdownMenuItem>
              </CreateOrgModal>
            );
          })()}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
