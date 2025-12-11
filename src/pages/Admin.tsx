import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, CreditCard, Target, TrendingUp, 
  Search, ChevronLeft, ChevronRight, Crown,
  Shield, History
} from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuditLog } from "@/hooks/useAuditLog";
interface UserData {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    trial_ends_at: string | null;
  };
  stats?: {
    total_xp: number;
    level: number;
    current_streak: number;
  };
  goals_count?: number;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

export default function Admin() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    trialUsers: 0,
    totalGoals: 0,
  });
  const usersPerPage = 10;
  const { logAction } = useAuditLog();

  useEffect(() => {
    // Log admin dashboard access
    logAction({
      action: 'admin_dashboard_accessed',
      target_table: 'admin_audit_logs',
    });
    
    fetchUsers();
    fetchStats();
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: subscribersCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .in('plan', ['monthly', 'annual'])
        .eq('status', 'active');

      const { count: trialCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'trial');

      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        activeSubscribers: subscribersCount || 0,
        trialUsers: trialCount || 0,
        totalGoals: goalsCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan, status, trial_ends_at')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          const { data: userStats } = await supabase
            .from('user_stats')
            .select('total_xp, level, current_streak')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          const { count: goalsCount } = await supabase
            .from('goals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id);

          return {
            id: profile.user_id,
            full_name: profile.full_name,
            email: profile.email,
            created_at: profile.created_at,
            subscription: subscription || undefined,
            stats: userStats || undefined,
            goals_count: goalsCount || 0,
          };
        })
      );

      setUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-success/20 text-success">Active</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs rounded-full bg-warning/20 text-warning">Trial</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-destructive/20 text-destructive">Cancelled</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Expired</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Free</span>;
    }
  };

  const getPlanBadge = (plan: string | undefined) => {
    switch (plan) {
      case 'annual':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-premium/20 text-premium">
            <Crown className="w-3 h-3" /> Annual
          </span>
        );
      case 'monthly':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
            Monthly
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">Free</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard 🛡️</h1>
            <p className="text-muted-foreground">Manage users, subscriptions, and analytics</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
            <Card variant="glass" className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.activeSubscribers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Paid Subscribers</p>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.trialUsers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">On Trial</p>
                </div>
              </div>
            </Card>
            <Card variant="glass" className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{stats.totalGoals}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Goals</p>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <History className="w-4 h-4" />
                Audit Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card variant="glass" className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold">All Users</h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Goals</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Level</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.map((user) => (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
                                    {user.full_name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.full_name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">{getPlanBadge(user.subscription?.plan)}</td>
                              <td className="py-4 px-4">{getStatusBadge(user.subscription?.status)}</td>
                              <td className="py-4 px-4">{user.goals_count}</td>
                              <td className="py-4 px-4">
                                <span className="text-primary font-medium">Lvl {user.stats?.level || 1}</span>
                              </td>
                              <td className="py-4 px-4 text-muted-foreground">
                                {format(new Date(user.created_at), 'MMM d, yyyy')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                      {paginatedUsers.map((user) => (
                        <div key={user.id} className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {getPlanBadge(user.subscription?.plan)}
                            {getStatusBadge(user.subscription?.status)}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="p-2 bg-white/5 rounded-lg">
                              <p className="font-medium">{user.goals_count}</p>
                              <p className="text-xs text-muted-foreground">Goals</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                              <p className="font-medium text-primary">Lvl {user.stats?.level || 1}</p>
                              <p className="text-xs text-muted-foreground">Level</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                              <p className="font-medium">{user.stats?.current_streak || 0}</p>
                              <p className="text-xs text-muted-foreground">Streak</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-muted-foreground">
                          Showing {(currentPage - 1) * usersPerPage + 1} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm px-3">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card variant="glass" className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">Admin Audit Logs</h2>
                </div>

                {auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No audit logs yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Admin actions will be recorded here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{log.action}</p>
                            {log.target_table && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Table: {log.target_table}
                                {log.target_id && ` • ID: ${log.target_id.slice(0, 8)}...`}
                              </p>
                            )}
                            {log.new_values && (
                              <p className="text-xs text-primary mt-1">
                                Changes: {JSON.stringify(log.new_values).slice(0, 100)}...
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}