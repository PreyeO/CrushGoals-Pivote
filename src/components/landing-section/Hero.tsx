"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
    return (
        <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 px-5 sm:px-8 overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.20_285_/_0.12)] blur-[120px] animate-float" />
                <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-[oklch(0.50_0.18_250_/_0.08)] blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[oklch(0.55_0.22_330_/_0.06)] blur-[80px] animate-float" style={{ animationDelay: "5s" }} />
                {/* Orbiting dots */}
                <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-primary/40 animate-orbit" />
                <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-chart-2/40 animate-orbit" style={{ animationDelay: "-5s" }} />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-8 animate-fade-in">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground">The goal platform built for teams</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 animate-fade-in-up">
                    <span className="text-gradient-hero">Align Your Team.</span>
                    <br />
                    <span className="text-gradient-primary">Crush Every Goal.</span>
                </h1>

                {/* Subhead */}
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "120ms" }}>
                    Set objectives, assign ownership, and track progress — without the complexity of enterprise tools. From startups to school clubs, teams get aligned in minutes.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <Link href="/dashboard">
                        <Button size="lg" className="gradient-primary text-white border-0 px-8 h-12 text-sm font-semibold animate-pulse-glow hover:opacity-90 gap-2">
                            Start Free — No Card Required
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <a href="#how-it-works">
                        <Button size="lg" variant="outline" className="h-12 text-sm font-semibold border-border/60 hover:bg-accent/60 gap-2">
                            See How It Works
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                    </a>
                </div>

                {/* Social proof row */}
                <div className="flex items-center justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: "500ms" }}>
                    <div className="flex -space-x-2.5">
                        {["P", "A", "T", "C", "J"].map((letter, i) => (
                            <div key={i} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-white border-2 border-background ring-1 ring-primary/20">
                                {letter}
                            </div>
                        ))}
                    </div>
                    <div className="text-left">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Loved by 180+ teams</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
