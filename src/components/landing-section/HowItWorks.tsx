"use client";

const howItWorks = [
    { step: "01", title: "Create Your Org", desc: "Set up your team in 30 seconds. Give it a name, invite members by email." },
    { step: "02", title: "Set & Assign Goals", desc: "Create OKRs or simple goals with deadlines. Assign to team members with clear ownership." },
    { step: "03", title: "Track & Celebrate", desc: "Watch progress in real-time. Spot blockers early. Celebrate wins on the leaderboard." },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-5 sm:px-8 gradient-subtle">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">How It Works</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Three Steps to <span className="text-gradient-primary">Aligned Teams</span>
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-10 stagger">
                    {howItWorks.map((item) => (
                        <div key={item.step} className="text-center animate-fade-in-up group">
                            <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-5 flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
                                <span className="text-xl font-bold text-white">{item.step}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
