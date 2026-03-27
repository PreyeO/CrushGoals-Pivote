"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

interface SidebarFooterProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  resolvedOrgId?: string;
}

export function SidebarFooter({
  collapsed,
  setCollapsed,
  resolvedOrgId,
}: SidebarFooterProps) {
  const user = useStore(useShallow((state) => state.user));

  return (
    <div className="shrink-0 p-3 space-y-2">
      <Separator className="opacity-15" />
      {!collapsed && user && (
        <Link
          href={`/org/${resolvedOrgId}/account`}
          className="flex flex-col gap-2 group cursor-pointer hover:bg-accent/40 rounded-xl transition-all"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-black uppercase">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold truncate group-hover:text-primary transition-colors">
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate opacity-60">
                My Account
              </p>
            </div>
          </div>
        </Link>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-center text-muted-foreground/50 hover:text-foreground hidden lg:flex h-8"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
