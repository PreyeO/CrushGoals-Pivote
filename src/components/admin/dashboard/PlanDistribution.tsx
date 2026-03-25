"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

interface PlanDistributionProps {
  stats: {
    totalOrgs: number;
    billing: {
      free: number;
      pro: number;
      business: number;
    };
  };
}

export function PlanDistribution({ stats }: PlanDistributionProps) {
    const { totalOrgs, billing } = stats;
    
    return (
        <Card className="col-span-1 glass-card shadow-sm border-border/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-500" />
                    Plan Distribution
                </CardTitle>
                <CardDescription>Active organizations by subscription tier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <PlanProgress 
                    label="Free" 
                    count={billing.free} 
                    total={totalOrgs} 
                    color="text-emerald-500" 
                    barBg="bg-emerald-500" 
                    dotBg="bg-emerald-500"
                />
                <PlanProgress 
                    label="Pro" 
                    count={billing.pro} 
                    total={totalOrgs} 
                    color="text-blue-500" 
                    barBg="bg-blue-500" 
                    dotBg="bg-blue-500"
                />
                <PlanProgress 
                    label="Business" 
                    count={billing.business} 
                    total={totalOrgs} 
                    color="text-purple-500" 
                    barBg="bg-purple-500" 
                    dotBg="bg-purple-500"
                />
            </CardContent>
        </Card>
    );
}

function PlanProgress({ label, count, total, color, barBg, dotBg }: { label: string, count: number, total: number, color: string, barBg: string, dotBg: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className={`font-semibold ${color} flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full ${dotBg}`} /> {label}
                </span>
                <span className="font-bold">{count} Orgs</span>
            </div>
            <div className="w-full h-2 rounded-full bg-accent relative overflow-hidden">
                <div 
                    className={`absolute inset-y-0 left-0 ${barBg} rounded-full transition-all duration-1000`} 
                    style={{ width: `${Math.max(count > 0 ? 2 : 0, pct)}%` }} 
                />
            </div>
        </div>
    );
}
