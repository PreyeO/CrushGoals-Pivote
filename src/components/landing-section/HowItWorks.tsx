"use client";

const howItWorks = [
    { step: "01", title: "Launch Your Team", desc: "Set up your workspace in seconds. Give it a name and start defining what winning looks like." },
    { step: "02", title: "Ship Your First Goal", desc: "Use simple templates to set a target and deadline. No complex frameworks — just direct action." },
    { step: "03", title: "Compete & Sync", desc: "Watch the team leaderboard update in real-time. Share context with progress notes to stay aligned." },
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
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-5 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform group-hover:bg-primary group-hover:text-white group-hover:border-0 group-hover:shadow-[0_0_20px_-5px_var(--primary)] text-primary">
                                <span className="text-xl font-bold">{item.step}</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed italic">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
