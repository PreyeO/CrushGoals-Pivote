"use client";

import { Star } from "lucide-react";

export const testimonials = [
    { name: "Adeola K.", role: "Startup Founder", text: "We replaced 3 tools with CrushGoals. Our team finally has one place to see all our quarterly targets and who owns what. Game changer.", rating: 5 },
    { name: "Michael T.", role: "School Principal", text: "We use this for teacher development goals. The leaderboard creates healthy competition, and the simplicity means everyone actually uses it.", rating: 5 },
    { name: "Grace O.", role: "Ministry Coordinator", text: "Perfect for our church outreach groups. We track goals, assign volunteers, and see real-time progress. Zero learning curve.", rating: 5 },
];

export function Testimonials() {
    return (
        <section className="py-24 px-5 sm:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Testimonials</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Loved by <span className="text-gradient-primary">Teams Everywhere</span>
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-5 stagger">
                    {testimonials.map((t) => (
                        <div key={t.name} className="glass-card p-6 animate-fade-in-up">
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">&quot;{t.text}&quot;</p>
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
