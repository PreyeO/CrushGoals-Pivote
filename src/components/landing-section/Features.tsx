"use client";

import { featuresData } from "@/data/landing.data";

export function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Team Execution,{" "}
            <span className="text-gradient-primary">Simplified</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            CrushGoals gives your team clarity, ownership, and visibility
            without heavy project management tools.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {featuresData.map((f) => (
            <div
              key={f.title}
              className="glass-card-hover p-6 animate-fade-in-up group"
            >
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm group-hover:glow-primary transition-shadow">
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
