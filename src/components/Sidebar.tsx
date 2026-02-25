"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, Target, Users, Trophy, Building2,
    ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getOrganizations, getOrganization, currentUser } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
    currentOrgId?: string;
}

const getOrgNavItems = (orgId: string) => [
    { icon: LayoutDashboard, label: "Dashboard", path: `/org/${orgId}` },
    { icon: Target, label: "Goals", path: `/org/${orgId}/goals` },
    { icon: Users, label: "Members", path: `/org/${orgId}/members` },
    { icon: Trophy, label: "Leaderboard", path: `/org/${orgId}/leaderboard` },
];

export function Sidebar({ currentOrgId }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const orgs = getOrganizations();
    const currentOrg = currentOrgId ? getOrganization(currentOrgId) : null;
    const orgNavItems = currentOrgId ? getOrgNavItems(currentOrgId) : [];

    const NavItem = ({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) => (
        <Link
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
        >
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-primary" />
            )}
            <Icon className={cn("w-[18px] h-[18px] flex-shrink-0 transition-colors", isActive && "text-primary")} />
            {!collapsed && <span>{label}</span>}
        </Link>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass-card flex items-center justify-center"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-border/40 transition-all duration-300",
                    collapsed ? "w-[72px]" : "w-[260px]",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 h-16 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-primary-sm flex-shrink-0">
                        <Target className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-[15px] tracking-tight text-gradient-primary">CrushGoals</span>
                    )}
                </div>

                {/* Org Switcher */}
                {!collapsed && orgs.length > 0 && (
                    <div className="px-3 mb-1">
                        <div className="space-y-0.5">
                            {orgs.map((org) => (
                                <Link key={org.id} href={`/org/${org.id}`} onClick={() => setMobileOpen(false)}>
                                    <div className={cn(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer",
                                        currentOrgId === org.id
                                            ? "bg-accent/80 text-foreground"
                                            : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                                    )}>
                                        <span className="text-base">{org.emoji}</span>
                                        <span className="truncate font-medium text-[13px]">{org.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <Separator className="mx-4 w-auto opacity-20 my-2" />

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin py-1">
                    <NavItem href="/dashboard" icon={Building2} label="My Organizations" isActive={pathname === "/dashboard"} />

                    {currentOrgId && orgNavItems.length > 0 && (
                        <>
                            <div className="pt-3 pb-1">
                                {!collapsed && (
                                    <p className="px-3 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em]">
                                        {currentOrg?.name || "Team"}
                                    </p>
                                )}
                            </div>
                            {orgNavItems.map((item) => (
                                <NavItem key={item.path} href={item.path} icon={item.icon} label={item.label} isActive={pathname === item.path} />
                            ))}
                        </>
                    )}
                </nav>

                {/* Bottom user + collapse */}
                <div className="flex-shrink-0 p-3 space-y-2">
                    <Separator className="opacity-15" />
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent/30">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-bold">
                                    {currentUser.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-medium truncate">{currentUser.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{currentUser.email}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-muted-foreground/50 hover:text-foreground hidden lg:flex h-8"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>
            </aside>
        </>
    );
}
