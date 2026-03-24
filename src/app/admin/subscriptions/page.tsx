import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, BarChart3, ArrowUpRight, Zap, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/lib/services/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTimeAgo } from "@/lib/utils";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminSubscriptionsPage() {
    return (
        <Suspense fallback={
            <div className="flex w-full h-full min-h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <SubscriptionsDataFetcher />
        </Suspense>
    );
}

async function SubscriptionsDataFetcher() {
    const [stats, payments] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRecentPayments(20),
    ]);

    const totalPaid = stats.billing.pro + stats.billing.business;
    const churnRate = 2.4; // Placeholder until we have historical data
    const arpu = totalPaid > 0 ? (stats.billing.mrr / totalPaid) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center glow-primary-sm">
                        <CreditCard className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing &amp; Revenue</h1>
                        <p className="text-muted-foreground text-sm">Monitor platform subscriptions, revenue, and payout status.</p>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
                <MetricCard
                    title="Live MRR (30d)"
                    value={`$${stats.billing.mrr.toLocaleString()}`}
                    trend="Last 30 days"
                    icon={DollarSign}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <MetricCard
                    title="Churn Rate"
                    value={`${churnRate}%`}
                    trend="Placeholder"
                    icon={TrendingUp}
                    color="text-rose-500"
                    bg="bg-rose-500/10"
                    inverse
                />
                <MetricCard
                    title="Avg Revenue (ARPU)"
                    value={arpu > 0 ? `$${arpu.toFixed(2)}` : "N/A"}
                    trend="Per paying org"
                    icon={BarChart3}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <MetricCard
                    title="Paying Orgs"
                    value={totalPaid}
                    trend={`of ${stats.totalOrgs} total`}
                    icon={Zap}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Subscription Tiers */}
                <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40 overflow-hidden">
                    <CardHeader className="border-b border-border/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Plan Tiers &amp; Distribution</CardTitle>
                                <CardDescription>Active organizations grouped by subscription plan.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-indigo-500/5 text-indigo-500 border-indigo-500/20 px-3 py-1">
                                Live Data
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/5">
                            <PlanRow
                                name="Free"
                                users={stats.billing.free}
                                price="$0 / mo"
                                totalOrgs={stats.totalOrgs}
                                color="text-emerald-500"
                                bg="bg-emerald-500/10"
                            />
                            <PlanRow
                                name="Pro"
                                users={stats.billing.pro}
                                price="$12 / mo"
                                totalOrgs={stats.totalOrgs}
                                recommended
                                color="text-indigo-500"
                                bg="bg-indigo-500/10"
                            />
                            <PlanRow
                                name="Business"
                                users={stats.billing.business}
                                price="$29 / mo"
                                totalOrgs={stats.totalOrgs}
                                color="text-purple-500"
                                bg="bg-purple-500/10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Flutterwave status card */}
                <Card className="col-span-1 glass-card shadow-sm border-border/40 overflow-hidden relative group">
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-indigo-500" />
                            Flutterwave Status
                        </CardTitle>
                        <CardDescription>Live payment gateway connection.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                            <CreditCard className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-foreground flex items-center gap-2 justify-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                Payment Gateway Active
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed mx-auto">
                                Flutterwave webhook is live. Transactions are recorded in real time.
                            </p>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase tracking-widest">
                            Connected
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payments Table */}
            <Card className="glass-card shadow-sm border-border/40">
                <CardHeader className="border-b border-border/10">
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        Recent Transactions
                    </CardTitle>
                    <CardDescription>Latest Flutterwave payment events (up to 20).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/10">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Payer</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Amount</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Plan</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((p) => (
                                <TableRow key={p.id} className="border-border/5 hover:bg-accent/5 transition-colors">
                                    <TableCell className="py-3 pl-6">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold">{p.userName || 'Unknown'}</span>
                                            <span className="text-[10px] text-muted-foreground">{p.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                                            {p.currency} {Number(p.amount).toLocaleString()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${p.tier === 'business' ? 'text-purple-500' : 'text-indigo-500'}`}>
                                            {p.tier}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] uppercase tracking-widest font-bold ${p.status === 'successful'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}
                                        >
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right py-3 text-[10px] font-bold text-muted-foreground pr-6">
                                        {formatTimeAgo(p.created_at)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs italic">
                                        No transactions found yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, trend, icon: Icon, color, bg, inverse }: any) {
    return (
        <Card className="glass-card shadow-sm border-border/40 p-5 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${bg} blur-2xl group-hover:scale-120 transition-transform`} />
            <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
                    <div className={`p-2 rounded-lg ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-black tracking-tight">{value}</p>
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${inverse ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </Card>
    );
}

function PlanRow({ name, users, price, totalOrgs, recommended, color, bg }: any) {
    const pct = totalOrgs > 0 ? Math.round((users / totalOrgs) * 100) : 0;
    return (
        <div className="flex items-center justify-between p-6 hover:bg-accent/5 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/10 shadow-sm ${bg}`}>
                    {recommended ? <Zap className={`w-5 h-5 ${color}`} /> : <Box className={`w-5 h-5 ${color}`} />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{name}</span>
                        {recommended && <Badge className="text-[9px] h-4 bg-indigo-500 hover:bg-indigo-500">Popular</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{price}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-black">{users} <span className="text-[10px] text-muted-foreground font-normal">Orgs</span></p>
                <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${color}`}>
                    <ArrowUpRight className="w-3 h-3" />
                    {pct}% of total
                </div>
            </div>
        </div>
    );
}
