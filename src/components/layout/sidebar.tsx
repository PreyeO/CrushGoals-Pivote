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
  Menu,
  X,
  BarChart3,
  Mail,
  Settings,
  CreditCard,
  Share2,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { useStore, type AppState } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Separator } from "@/components/ui/separator";
import type { Organization } from "@/types";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarOrgSwitcher } from "./SidebarOrgSwitcher";
import { SidebarFooter } from "./SidebarFooter";

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

function NavItem({
  collapsed,
  setMobileOpen,
  ...props
}: Omit<
  React.ComponentProps<typeof SidebarNavItem>,
  "collapsed" | "setMobileOpen"
> & {
  collapsed: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <SidebarNavItem
      {...props}
      collapsed={collapsed}
      setMobileOpen={setMobileOpen}
    />
  );
}

export function Sidebar({ currentOrgId: propOrgId }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastOrgId, setLastOrgId] = useState<string | null>(null);

  // Extract orgId from URL if present
  const urlOrgId = pathname.split("/org/")[1]?.split("/")[0];

  useEffect(() => {
    // Use setTimeout to defer setState to the next task, avoiding cascading render warning
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (urlOrgId) {
      if (localStorage.getItem("lastActiveOrgId") !== urlOrgId) {
        localStorage.setItem("lastActiveOrgId", urlOrgId);
      }
      if (lastOrgId !== urlOrgId) {
        // Defer to avoid cascading render
        const timer = setTimeout(() => setLastOrgId(urlOrgId), 0);
        return () => clearTimeout(timer);
      }
    } else {
      const saved = localStorage.getItem("lastActiveOrgId");
      if (saved && lastOrgId !== saved) {
        // Defer to avoid cascading render
        const timer = setTimeout(() => setLastOrgId(saved), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [urlOrgId, lastOrgId]);

  const orgs = useStore(useShallow((state) => state.organizations));
  const members = useStore(useShallow((state) => state.members));
  const user = useStore(useShallow((state) => state.user));
  const collapsed = useStore((state) => state.sidebarCollapsed);
  const setCollapsed = useStore((state) => state.setSidebarCollapsed);

  // Check if user is owner/admin of any organization
  const isOwnerOrAdminAny = members.some(
    (m) => m.userId === user?.id && (m.role === "owner" || m.role === "admin"),
  );

  const resolvedOrgId = urlOrgId || propOrgId || lastOrgId || orgs[0]?.id;
  const currentOrg = orgs.find((o: Organization) => o.id === resolvedOrgId);
  const myMember = members.find(
    (m) => m.userId === user?.id && m.orgId === resolvedOrgId,
  );

  // Permission Fix: Don't downgrade admins/owners during transitions
  // If we don't have myMember for THIS org yet, but we know they are an admin ANYWHERE,
  // we keep the tools visible to prevent flickering "lag"
  const isMemberOnly = myMember
    ? myMember.role === "member"
    : !isOwnerOrAdminAny;

  const orgNavItems = resolvedOrgId
    ? getOrgNavItems(resolvedOrgId).filter(
        (item) =>
          !(
            (isMemberOnly &&
              (item.label === "Settings" ||
                item.label === "Members" ||
                item.label === "Reports" ||
                item.label === "Integrations")) ||
            (currentOrg?.plan === "free" && item.label === "Integrations")
          ),
      )
    : [];

  const pendingInvites = useStore(
    useShallow((state: AppState) => state.pendingInvitations),
  );

  if (!mounted) return null;

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
        <div className="px-5 h-16 flex items-center shrink-0">
          <Logo iconOnly={collapsed} size="sm" href="/" />
        </div>

        {!collapsed && currentOrg && (
          <SidebarOrgSwitcher currentOrg={currentOrg} urlOrgId={urlOrgId} />
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
              collapsed={collapsed}
              setMobileOpen={setMobileOpen}
            />
          )}

          {/* Pending invitations indicator — only shown to users who received an invite */}
          {pendingInvites.length > 0 && (() => {
            const inviteHref =
              pendingInvites.length === 1
                ? `/invite/${pendingInvites[0].token}`
                : `/invitations`;
            return (
              <Link
                href={inviteHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
              >
                <Mail className="w-4.5 h-4.5 shrink-0" />
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
                  collapsed={collapsed}
                  setMobileOpen={setMobileOpen}
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
                collapsed={collapsed}
                setMobileOpen={setMobileOpen}
              />
              <NavItem
                href="/admin/users"
                icon={Users}
                label="Users"
                isActive={pathname === "/admin/users"}
                collapsed={collapsed}
                setMobileOpen={setMobileOpen}
              />
              <NavItem
                href="/admin/organizations"
                icon={Building2}
                label="Organizations"
                isActive={pathname === "/admin/organizations"}
                collapsed={collapsed}
                setMobileOpen={setMobileOpen}
              />
              <NavItem
                href="/admin/subscriptions"
                icon={CreditCard}
                label="Subscriptions"
                isActive={pathname === "/admin/subscriptions"}
                collapsed={collapsed}
                setMobileOpen={setMobileOpen}
              />
            </>
          )}
        </nav>

        <SidebarFooter
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          resolvedOrgId={resolvedOrgId}
        />
      </aside>
    </>
  );
}
