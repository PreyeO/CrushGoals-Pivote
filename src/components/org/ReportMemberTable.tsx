import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportMemberTableProps {
    memberStats: {
        name: string;
        total: number;
        done: number;
        blocked: number;
        rate: number;
        status: string;
    }[];
}

export function ReportMemberTable({ memberStats }: ReportMemberTableProps) {
    return (
        <Card className="lg:col-span-3 glass-card border-border/40 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Member Performance Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20">
                            <th className="px-6 py-4">Member</th>
                            <th className="px-6 py-4 text-center">Active</th>
                            <th className="px-6 py-4 text-center">Done</th>
                            <th className="px-6 py-4 text-center">Blocked</th>
                            <th className="px-6 py-4 text-right">Success Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                        {memberStats.map((member, i) => (
                            <tr key={i} className="hover:bg-accent/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                                            {member.name[0]}
                                        </div>
                                        <span className="text-sm font-bold tracking-tight">{member.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-sm font-medium">{member.total - member.done}</td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-emerald-500">{member.done}</td>
                                <td className="px-6 py-4 text-center text-sm font-bold text-destructive">{member.blocked}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className={cn(
                                            "text-sm font-black",
                                            member.rate > 70 ? "text-emerald-500" : member.rate > 30 ? "text-amber-500" : "text-destructive"
                                        )}>
                                            {member.rate}%
                                        </span>
                                        <span className="text-lg leading-none">{member.status}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
