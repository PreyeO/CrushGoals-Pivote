"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import React from "react";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  isActive,
  collapsed,
  setMobileOpen,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={() => setMobileOpen?.(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full gradient-primary" />
      )}
      <Icon
        className={cn(
          "w-4.5 h-4.5 shrink-0 transition-colors",
          isActive && "text-primary",
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
