"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SystemStatus() {
    return (
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
                <HealthItem label="Payment Webhook" status="Ready" latency="Active" />
            </CardContent>
        </Card>
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
