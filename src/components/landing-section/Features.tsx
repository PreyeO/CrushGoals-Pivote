"use client";

import { Layers, Users, BarChart3, Trophy, Shield, Clock } from "lucide-react";

export const features = [
    { icon: Layers, title: "OKR & Goal Frameworks", description: "Structure objectives with key results, SMART templates, and milestone tracking. Guide your team from idea to done." },
    { icon: Users, title: "Team Assignment", description: "Assign goals with clear ownership. Everyone knows what they're responsible for — no confusion, just clarity." },
    { icon: BarChart3, title: "Live Progress Dashboard", description: "Team health scores, completion trends, and bottleneck detection. Know where your team stands at a glance." },
    { icon: Trophy, title: "Team Leaderboard", description: "Friendly competition that drives results. Top performers get recognized, and the whole team stays motivated." },
    { icon: Shield, title: "Status & Accountability", description: "Not started → In progress → Blocked → Done. Real-time status tracking means no goal slips through the cracks." },
    { icon: Clock, title: "Milestones & Deadlines", description: "Break big goals into checkpoints. Track what's on schedule, what's behind, and celebrate every milestone hit." },
];

export function Features() {
    return (
        <section id="features" className="py-24 px-5 sm:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        Everything Teams Need to <span className="text-gradient-primary">Succeed</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        Goal tracking built for collaboration. No more spreadsheets, no more &quot;what are we working on&quot; messages.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
                    {features.map((f) => (
                        <div key={f.title} className="glass-card-hover p-6 animate-fade-in-up group">
                            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm group-hover:glow-primary transition-shadow">
                                <f.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1.5">{f.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
