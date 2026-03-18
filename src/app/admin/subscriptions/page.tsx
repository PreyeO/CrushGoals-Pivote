"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, BarChart3, ArrowUpRight, Zap, Target, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSubscriptionsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center glow-primary-sm">
                        <CreditCard className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-indigo">Billing & Revenue</h1>
                        <p className="text-muted-foreground text-sm">Monitor platform subscriptions, revenue, and payout status.</p>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 stagger">
                <MetricCard 
                    title="Live MRR" 
                    value="$12,450" 
                    trend="+8.2%" 
                    icon={DollarSign} 
                    color="text-emerald-500" 
                    bg="bg-emerald-500/10" 
                />
                <MetricCard 
                    title="Churn Rate" 
                    value="2.4%" 
                    trend="-0.5%" 
                    icon={TrendingUp} 
                    color="text-rose-500" 
                    bg="bg-rose-500/10" 
                    inverse
                />
                <MetricCard 
                    title="Avg Revenue (ARPU)" 
                    value="$42.50" 
                    trend="+1.2%" 
                    icon={BarChart3} 
                    color="text-blue-500" 
                    bg="bg-blue-500/10" 
                />
                <MetricCard 
                    title="Active Subs" 
                    value="428" 
                    trend="+12" 
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
                                <CardTitle className="text-lg font-bold">Plan Tiers & Performance</CardTitle>
                                <CardDescription>Conversion rates and popularity by plan.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-indigo-500/5 text-indigo-500 border-indigo-500/20 px-3 py-1">
                                Real-time Feed
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/5">
                            <PlanRow name="Free Trial" users={342} price="$0" growth="+12%" />
                            <PlanRow name="Pro Plan" users={68} price="$12/mo" growth="+5%" recommended />
                            <PlanRow name="Enterprise" users={18} price="Custom" growth="+2%" />
                        </div>
                    </CardContent>
                </Card>

                {/* Stripe Connection Placeholder */}
                <Card className="col-span-1 glass-card shadow-sm border-border/40 overflow-hidden relative group">
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-indigo-500" />
                            Stripe Integration
                        </CardTitle>
                        <CardDescription>Direct payout and tax management.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
                            <CreditCard className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-foreground">Connect your Stripe account</p>
                            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed mx-auto">
                                Enable live payments and automated subscription handling for your platform.
                            </p>
                        </div>
                        <button className="w-full h-10 rounded-xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                            Verify & Connect Stripe
                        </button>
                    </CardContent>
                </Card>
            </div>
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
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${inverse ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </Card>
    );
}

function PlanRow({ name, users, price, growth, recommended }: any) {
    return (
        <div className="flex items-center justify-between p-6 hover:bg-accent/5 transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border/10 shadow-sm ${recommended ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-accent/20 text-muted-foreground'}`}>
                    {recommended ? <Zap className="w-5 h-5 fill-indigo-500/20" /> : <Box className="w-5 h-5" />}
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
                <p className="text-sm font-black">{users} <span className="text-[10px] text-muted-foreground font-normal">Active</span></p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-500 font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    {growth}
                </div>
            </div>
        </div>
    );
}
