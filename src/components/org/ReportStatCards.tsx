import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, XCircle, Activity } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subtext: string;
}

const StatCard = ({ title, value, icon: Icon, subtext }: StatCardProps) => (
    <Card className="glass-card-hover border-border/40 overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-4 h-4 text-primary" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] text-muted-foreground mt-1 font-medium">{subtext}</div>
        </CardContent>
    </Card>
);

interface ReportStatCardsProps {
    avgProgress: number;
    completedGoalsCount: number;
    blockedGoalsCount: number;
    monthlyVelocity: number;
}

export function ReportStatCards({
    avgProgress,
    completedGoalsCount,
    blockedGoalsCount,
    monthlyVelocity
}: ReportStatCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={TrendingUp} subtext="Across all active goals" />
            <StatCard title="Total Crushed" value={completedGoalsCount} icon={Target} subtext="Historical total" />
            <StatCard title="Active Blockers" value={blockedGoalsCount} icon={XCircle} subtext={blockedGoalsCount > 0 ? "Action required" : "Clear skies"} />
            <StatCard title="Monthly Velocity" value={monthlyVelocity} icon={Activity} subtext="Completions this month" />
        </div>
    );
}
