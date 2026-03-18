import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building2, Target, CreditCard, Activity, TrendingUp, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import type { PlatformStats } from "@/lib/services/admin";

interface PlatformActivity {
    id: string;
    type: 'user' | 'org';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

interface AdminDashboardProps {
    stats: PlatformStats;
    activity: PlatformActivity[];
}

export function AdminDashboard({ stats, activity }: AdminDashboardProps) {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-primary-sm">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Platform-wide analytics and performance metrics.</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
                <StatusCard 
                    title="Total Users" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    trend="+12% this month"
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatusCard 
                    title="Organizations" 
                    value={stats.totalOrgs} 
                    icon={Building2} 
                    trend="+5% this month"
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatusCard 
                    title="Active Goals" 
                    value={stats.totalGoals} 
                    icon={Target} 
                    trend="+18% this month"
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatusCard 
                    title="Estimated MRR" 
                    value={`$${stats.billing.mrr.toLocaleString()}`} 
                    icon={DollarSign} 
                    trend="+2% this month"
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Platform Growth
                        </CardTitle>
                        <CardDescription>User and Organization acquisition over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border-t border-border/20 border-dashed m-6 mt-0 rounded-xl bg-accent/20">
                        *Growth chart visualization will be implemented here*
                    </CardContent>
                </Card>

                <Card className="col-span-1 glass-card shadow-sm border-border/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                            Subscription Distribution
                        </CardTitle>
                        <CardDescription>Current active plans across the network.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-emerald-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Free Trial
                                </span>
                                <span className="font-bold">{stats.billing.freeTrialUsers} Users</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full" 
                                    style={{ width: `${Math.max(5, (stats.billing.freeTrialUsers / stats.totalUsers) * 100)}%` }} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-blue-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Pro Plan
                                </span>
                                <span className="font-bold">{stats.billing.proUsers} Users</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-blue-500 rounded-full" 
                                    style={{ width: `${Math.max(2, (stats.billing.proUsers / stats.totalUsers) * 100)}%` }} 
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-purple-500 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Enterprise
                                </span>
                                <span className="font-bold">{stats.billing.enterpriseUsers} Users</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                                <div 
                                    className="absolute inset-y-0 left-0 bg-purple-500 rounded-full" 
                                    style={{ width: `${Math.max(1, (stats.billing.enterpriseUsers / stats.totalUsers) * 100)}%` }} 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 glass-card shadow-sm border-border/40 overflow-hidden flex flex-col">
                    <CardHeader className="pb-3 border-b border-border/5 bg-accent/5">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Recent Platform Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="divide-y divide-border/5">
                            {activity.map((item) => (
                                <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-accent/5 transition-colors group">
                                    <div className={`p-2 rounded-lg ${item.type === 'user' ? 'bg-blue-500/10' : 'bg-amber-500/10'} group-hover:scale-110 transition-transform duration-200`}>
                                        {item.type === 'user' ? (
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                        ) : (
                                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold truncate leading-none mb-1">{item.title}</p>
                                        <p className="text-[11px] text-muted-foreground truncate leading-relaxed">{item.description}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter">
                                            {formatTimeAgo(item.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {activity.length === 0 && (
                                <div className="py-10 text-center text-muted-foreground text-xs italic">
                                    No recent events tracked.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 lg:col-span-3 glass-card shadow-sm border-border/40">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-emerald-500" />
                                    System Health & Core Services
                                </CardTitle>
                                <CardDescription>Real-time status of platform infrastructure.</CardDescription>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse">
                                All Systems Operational
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3 p-6 pt-2">
                        <HealthItem label="Database Cluster" status="Operational" latency="14ms" />
                        <HealthItem label="Authentication Service" status="Operational" latency="8ms" />
                        <HealthItem label="Storage Engine" status="Operational" latency="42ms" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function HealthItem({ label, status, latency }: { label: string, status: string, latency: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-border/5">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                <span className="text-sm font-bold mt-1 inline-flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    {status}
                </span>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Latency</span>
                <p className="text-xs font-black text-emerald-500/80 tracking-tighter">{latency}</p>
            </div>
        </div>
    );
}

function StatusCard({ title, value, icon: Icon, trend, color, bg }: { title: string, value: string | number, icon: any, trend: string, color: string, bg: string }) {
    return (
        <Card className="glass-card shadow-sm hover:shadow-md transition-shadow duration-300 border-border/40 overflow-hidden relative group">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl group-hover:blur-3xl transition-all opacity-50`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-black tracking-tight">{value}</div>
                <p className={`text-xs mt-2 font-medium ${color}`}>{trend}</p>
            </CardContent>
        </Card>
    );
}
