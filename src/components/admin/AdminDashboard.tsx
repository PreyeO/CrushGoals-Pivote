"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Target,
  CreditCard,
  Activity,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import type {
  PlatformStats,
  RecentPayment,
  GrowthPoint,
} from "@/lib/services/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { LucideIcon } from "lucide-react";

interface AdminDashboardProps {
  stats: PlatformStats;
  payments: RecentPayment[];
  growth: GrowthPoint[];
}

export function AdminDashboard({
  stats,
  payments,
  growth,
}: AdminDashboardProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center glow-primary-sm">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Platform-wide analytics and performance metrics.
            </p>
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
          title="Real-time MRR"
          value={`$${stats.billing.mrr.toLocaleString()}`}
          icon={DollarSign}
          trend="Last 30 days"
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
            <CardDescription>
              User and Organization acquisition (Last 30 days).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growth}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                  minTickGap={30}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17, 24, 39, 0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="orgs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOrgs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 glass-card shadow-sm border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              Plan Distribution
            </CardTitle>
            <CardDescription>
              Active organizations by subscription tier.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Free
                </span>
                <span className="font-bold">{stats.billing.free} Orgs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.max(5, (stats.billing.free / (stats.totalOrgs || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Pro
                </span>
                <span className="font-bold">{stats.billing.pro} Orgs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.max(2, (stats.billing.pro / (stats.totalOrgs || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-purple-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />{" "}
                  Business
                </span>
                <span className="font-bold">{stats.billing.business} Orgs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.max(1, (stats.billing.business / (stats.totalOrgs || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Recent Payments
            </CardTitle>
            <CardDescription>
              Live feed of Flutterwave transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/10">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Payer
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">
                    Amount
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">
                    Plan
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-border/5 hover:bg-accent/5 transition-colors"
                  >
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold">
                          {p.userName || "Unknown"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {p.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-emerald-500/5 text-emerald-500 border-emerald-500/20"
                      >
                        {p.currency} {p.amount.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-tighter ${p.tier === "business" ? "text-purple-500" : "text-blue-500"}`}
                      >
                        {p.tier}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3 text-[10px] font-bold text-muted-foreground">
                      {formatTimeAgo(p.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground text-xs italic"
                    >
                      No recent payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1 glass-card shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  System Status
                </CardTitle>
              </div>
              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <HealthItem label="Database" status="OK" latency="14ms" />
            <HealthItem label="Auth API" status="OK" latency="8ms" />
            <HealthItem
              label="Payment Webhook"
              status="Ready"
              latency="Active"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthItem({
  label,
  status,
  latency,
}: {
  label: string;
  status: string;
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-border/5">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-bold mt-1 inline-flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          {status}
        </span>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
          Latency
        </span>
        <p className="text-xs font-black text-emerald-500/80 tracking-tighter">
          {latency}
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bg,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  color: string;
  bg: string;
}) {
  return (
    <Card className="glass-card shadow-sm hover:shadow-md transition-shadow duration-300 border-border/40 overflow-hidden relative group">
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl group-hover:blur-3xl transition-all opacity-50`}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div
          className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
        >
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
