"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { GrowthPoint } from "@/lib/services/admin";

interface GrowthChartProps {
  data: GrowthPoint[];
}

export function GrowthChart({ data }: GrowthChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2 glass-card shadow-sm border-border/40">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Platform Growth
                </CardTitle>
                <CardDescription>User and Organization acquisition (Last 30 days).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOrgs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888' }}
                            minTickGap={30}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                fontSize: '12px'
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
    );
}
