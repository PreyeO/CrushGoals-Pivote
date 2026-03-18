import { Building2, Users, Target } from "lucide-react";

interface DashboardStatsProps {
    orgCount: number;
    memberCount: number;
    goalCount: number;
}

export function DashboardStats({ orgCount, memberCount, goalCount }: DashboardStatsProps) {
    const stats = [
        {
            label: "Organizations",
            value: orgCount,
            icon: Building2,
            color: "text-[oklch(0.82_0.28_150)]",
            bg: "bg-[oklch(0.82_0.28_150)]/10"
        },
        {
            label: "Members",
            value: memberCount,
            icon: Users,
            color: "text-[oklch(0.70_0.20_190)]",
            bg: "bg-[oklch(0.70_0.20_190)]/10"
        },
        {
            label: "Active Goals",
            value: goalCount,
            icon: Target,
            color: "text-[oklch(0.75_0.18_175)]",
            bg: "bg-[oklch(0.75_0.18_175)]/10"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 stagger">
            {stats.map((s) => (
                <div key={s.label} className="glass-card p-6 flex items-center gap-5 group hover:border-primary/40 transition-all duration-300 animate-fade-in-up">
                    <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        <s.icon className={`w-6 h-6 ${s.color}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-black tracking-tight">{s.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{s.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
