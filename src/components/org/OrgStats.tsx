"use client";

interface OrgStatsProps {
    activeGoals: number;
    completedGoals: number;
    memberCount: number;
    healthScore: number;
    healthTrend: "up" | "down" | "stable";
}

export function OrgStats({ activeGoals, completedGoals, memberCount, healthScore, healthTrend }: OrgStatsProps) {
    const stats = [
        { label: "Active Goals", value: activeGoals, emoji: "🎯", gradient: "gradient-primary" },
        { label: "Completed", value: completedGoals, emoji: "✅", gradient: "gradient-success" },
        { label: "Members", value: memberCount, emoji: "👥", gradient: "gradient-warning" },
        { label: "Health Score", value: `${healthScore}%`, emoji: healthTrend === "up" ? "📈" : "📊", gradient: "gradient-premium" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {stats.map((stat) => (
                <div key={stat.label} className="glass-card p-5 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center text-base`}>
                            {stat.emoji}
                        </div>
                        {stat.label === "Health Score" && (
                            <span className={`text-[10px] font-semibold ${healthTrend === "up" ? "text-[oklch(0.70_0.18_155)]" : "text-muted-foreground"}`}>
                                {healthTrend === "up" ? "↑ Improving" : healthTrend === "stable" ? "→ Stable" : "↓ Declining"}
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight animate-count-up">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
    );
}
