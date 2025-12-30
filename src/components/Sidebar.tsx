import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  BarChart3,
  Trophy,
  Users,
  Settings,
  Crown,
  Flame,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", tourId: "nav-dashboard" },
  { icon: Target, label: "My Goals", path: "/goals", tourId: "nav-goals" },
  { icon: CheckSquare, label: "Today's Tasks", path: "/tasks", tourId: "nav-tasks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics", tourId: "nav-analytics" },
  { icon: Trophy, label: "Achievements", path: "/achievements", tourId: "nav-achievements" },
  { icon: Users, label: "Leaderboard", path: "/leaderboard", tourId: "nav-leaderboard" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile, stats, subscription, isAdmin } = useAuth();

  // Use real data from auth context
  const userName = profile?.full_name || "Champion";
  const streak = stats?.current_streak || 0;
  const tasksCompleted = stats?.tasks_completed || 0;
  const isPremium = subscription?.plan === 'monthly' || subscription?.plan === 'annual';

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar border border-sidebar-border lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Goal Crusher
            </span>
          )}
        </div>

        {/* User Profile */}
        <div className={cn("p-4 border-b border-sidebar-border", collapsed && "flex justify-center")}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
              {userName.charAt(0)}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{userName}</p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-destructive/20 text-destructive border border-destructive/30">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-xs text-premium">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Free Trial</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Streak & Tasks */}
          {!collapsed && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{streak}</span>
                <span className="text-muted-foreground text-xs">day streak</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{tasksCompleted} tasks</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                data-tour={item.tourId}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", !isActive && "group-hover:scale-110 transition-transform")} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-2 border-t border-sidebar-border">
          {/* Admin Dashboard Link - Only for admins */}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                location.pathname === "/admin"
                  ? "bg-destructive/20 text-destructive border border-destructive/30"
                  : "text-destructive/80 hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20",
                collapsed && "justify-center"
              )}
            >
              <Shield className="w-5 h-5" />
              {!collapsed && <span className="font-medium">Admin Panel</span>}
            </NavLink>
          )}

          {/* Streak */}
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20",
            collapsed && "justify-center"
          )}>
            <Flame className="w-5 h-5 text-orange-500 animate-pulse-glow" />
            {!collapsed && (
              <span className="font-bold text-orange-500">{streak} days</span>
            )}
          </div>

          {/* Settings */}
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            data-tour="nav-settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
              location.pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center"
            )}
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </NavLink>

          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-200",
              "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
