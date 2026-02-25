"use client";

interface DashboardStatsProps {
    orgCount: number;
    memberCount: number;
    goalCount: number;
}

export function DashboardStats({ orgCount, memberCount, goalCount }: DashboardStatsProps) {
    const stats = [
        { label: "Organizations", value: orgCount, icon: "🏢" },
        { label: "Team Members", value: memberCount, icon: "👥" },
        { label: "Active Goals", value: goalCount, icon: "🎯" },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 mb-8 stagger">
            {stats.map((s) => (
                <div key={s.label} className="glass-card p-5 text-center animate-fade-in-up">
                    <span className="text-2xl mb-2 block">{s.icon}</span>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
            ))}
        </div>
    );
}
