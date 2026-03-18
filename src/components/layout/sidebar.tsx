"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Users,
  Trophy,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BarChart3,
  Mail,
  Settings,
  UserCircle,
  ShieldAlert,
  CreditCard,
  Share2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useStore, type AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut } from "lucide-react";
import type { Organization } from "@/types";
import { CreateOrgModal } from "@/components/create-org-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  currentOrgId?: string;
}

const getOrgNavItems = (orgId: string) => [
  { icon: Building2, label: "Overview", path: `/org/${orgId}` },
  { icon: Target, label: "Goals", path: `/org/${orgId}/goals` },
  { icon: Users, label: "Members", path: `/org/${orgId}/members` },
  { icon: Trophy, label: "Leaderboard", path: `/org/${orgId}/leaderboard` },
  { icon: BarChart3, label: "Reports", path: `/org/${orgId}/reports` },
  { icon: Share2, label: "Integrations", path: `/org/${orgId}/integrations` },
  { icon: Settings, label: "Settings", path: `/org/${orgId}/settings` },
];

export function Sidebar({ currentOrgId }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const orgs = useStore(useShallow((state) => state.organizations));
  const members = useStore(useShallow((state) => state.members));
  const invitations = useStore(useShallow((state) => state.invitations));
  const user = useStore(useShallow((state) => state.user));
  const signOut = useStore((state) => state.signOut);
  const collapsed = useStore((state) => state.sidebarCollapsed);
  const setCollapsed = useStore((state) => state.setSidebarCollapsed);

  // Check if user is owner/admin of any organization
  const isOwnerOrAdminAny = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  const resolvedOrgId = currentOrgId || orgs[0]?.id;
  const currentOrg = orgs.find((o: Organization) => o.id === resolvedOrgId);
  const myMember = members.find(
    (m) => m.userId === user?.id && m.orgId === resolvedOrgId,
  );

  // Permission Fix: Default to member-only if myMember isn't loaded yet to prevent flashes of restricted UI
  const isMemberOnly = !myMember || myMember.role === "member";

  const orgNavItems = resolvedOrgId
    ? getOrgNavItems(resolvedOrgId).filter(
        (item) =>
          !(
            isMemberOnly &&
            (item.label === "Settings" ||
              item.label === "Members" ||
              item.label === "Reports" ||
              item.label === "Integrations")
          ),
      )
    : [];

  const pendingInvites = useStore(
    useShallow((state: AppState) => state.pendingInvitations),
  );

  if (!mounted) return null;

  const NavItem = ({
    href,
    icon: Icon,
    label,
    isActive,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-primary" />
      )}
      <Icon
        className={cn(
          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
          isActive && "text-primary",
        )}
      />
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
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="px-5 h-16 flex items-center flex-shrink-0">
          <Logo iconOnly={collapsed} size="sm" href="/" />
        </div>

        {/* Org Switcher */}
        {!collapsed && currentOrg && (
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
                        currentOrgId === org.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <span className="text-base w-6 h-6 flex items-center justify-center">{org.emoji}</span>
                      <span className="font-semibold text-xs flex-1">{org.name}</span>
                      {currentOrgId === org.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                  </Link>
                ))}
                
                <DropdownMenuSeparator className="my-1.5 opacity-40" />
                
                <CreateOrgModal>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all"
                  >
                    <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 font-black" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-tight">New Organization</span>
                  </DropdownMenuItem>
                </CreateOrgModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}


        <Separator className="mx-4 w-auto opacity-20 my-2" />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-thin py-1">
          {/* Dashboard should be accessible only to owners/admins */}
          {isOwnerOrAdminAny && (
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
            />
          )}

          {/* Pending invitations indicator */}
          {(() => {
            const hasReceived = pendingInvites.length > 0;
            const myMemberInCurrent = members.find(m => m.userId === user?.id && m.orgId === resolvedOrgId);
            const isAdminInCurrent = myMemberInCurrent && (myMemberInCurrent.role === 'owner' || myMemberInCurrent.role === 'admin');
            const hasSent = isAdminInCurrent && resolvedOrgId && invitations.length > 0;
            
            if (hasReceived) {
              const inviteHref = pendingInvites.length === 1
                ? `/invite/${pendingInvites[0].token}`
                : `/invitations`;
              return (
                <Link
                  href={inviteHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  <Mail className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1">
                      {pendingInvites.length === 1
                        ? "Pending Invite"
                        : `${pendingInvites.length} Pending Invites`}
                    </span>
                  )}
                  {!collapsed && (
                    <span className="ml-auto text-[10px] font-black bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingInvites.length}
                    </span>
                  )}
                </Link>
              );
            }

            if (hasSent) {
              const sentCount = invitations.length;
              return (
                <Link
                  href={`/org/${resolvedOrgId}/members`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative text-[oklch(0.70_0.18_155)] bg-[oklch(0.70_0.18_155)]/10 hover:bg-[oklch(0.70_0.18_155)]/20"
                >
                  <Mail className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1">
                      {sentCount === 1
                        ? "Review Invite"
                        : `Review Invites (${sentCount})`}
                    </span>
                  )}
                </Link>
              );
            }

            return null;
          })()}

          {resolvedOrgId && orgNavItems.length > 0 && (
            <div className="pt-2">
              {orgNavItems.map((item) => (
                <NavItem
                  key={item.path}
                  href={item.path}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.path}
                />
              ))}
            </div>
          )}

          {/* Super Admin Link */}
          {user?.email === "ayibakep@gmail.com" && (
            <>
              <div className="pt-3 pb-1 mt-2">
                {!collapsed && (
                  <p className="px-3 text-[10px] font-semibold text-primary/70 uppercase tracking-[0.15em]">
                    Platform Admin
                  </p>
                )}
              </div>
              <NavItem
                href="/admin"
                icon={LayoutDashboard}
                label="Overview"
                isActive={pathname === "/admin"}
              />
              <NavItem
                href="/admin/users"
                icon={Users}
                label="Users"
                isActive={pathname === "/admin/users"}
              />
              <NavItem
                href="/admin/organizations"
                icon={Building2}
                label="Organizations"
                isActive={pathname === "/admin/organizations"}
              />
              <NavItem
                href="/admin/subscriptions"
                icon={CreditCard}
                label="Subscriptions"
                isActive={pathname === "/admin/subscriptions"}
              />
            </>
          )}
        </nav>

        {/* Bottom user + collapse */}
        <div className="flex-shrink-0 p-3 space-y-2">
          <Separator className="opacity-15" />
          {!collapsed && user && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent/30">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-bold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
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
      </aside>
    </>
  );
}
