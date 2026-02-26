"use client";

import { statsData } from "@/data/landing.data";

export function StatsBar() {
    return (
        <section className="border-y border-border/30 bg-card/40">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px">
                {statsData.map((s, i) => (
                    <div key={i} className="text-center py-8 px-4">
                        <p className="text-2xl sm:text-3xl font-extrabold text-gradient-primary">{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
