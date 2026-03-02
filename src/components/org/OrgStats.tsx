"use client";

interface OrgStatsProps {
    activeGoals: number;
    completedGoals: number;
    memberCount: number;
    healthScore: number;
    healthTrend: "up" | "down" | "stable";
    compact?: boolean;
}

export function OrgStats({ activeGoals, completedGoals, memberCount, healthScore, healthTrend, compact }: OrgStatsProps) {
    const stats = [
        { label: "Goals", value: activeGoals, emoji: "🎯", gradient: "gradient-primary" },
        { label: "Done", value: completedGoals, emoji: "✅", gradient: "gradient-success" },
        { label: "Members", value: memberCount, emoji: "👥", gradient: "gradient-warning" },
        { label: "Health", value: `${healthScore}%`, emoji: healthTrend === "up" ? "📈" : "📊", gradient: "gradient-premium" },
    ];

    if (compact) {
        return (
            <div className="space-y-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-card p-4 flex items-center gap-4 transition-all hover:bg-accent/30">
                        <div className={`w-8 h-8 rounded-lg ${stat.gradient} flex items-center justify-center text-xs shrink-0 shadow-sm border border-white/10`}>
                            {stat.emoji}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{stat.label}</p>
                            <p className="text-sm font-black tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {stats.map((stat) => (
                <div key={stat.label} className="glass-card p-5 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center text-base`}>
                            {stat.emoji}
                        </div>
                        {stat.label === "Health" && (
                            <span className={`text-[10px] font-semibold ${healthTrend === "up" ? "text-[oklch(0.70_0.18_155)]" : "text-muted-foreground"}`}>
                                {healthTrend === "up" ? "↑ Improving" : healthTrend === "stable" ? "→ Stable" : "↓ Declining"}
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight animate-count-up">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label === "Done" ? "Completed" : stat.label === "Goals" ? "Active Goals" : stat.label}</p>
                </div>
            ))}
        </div>
    );
}
