"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, ArrowRight, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { heroData } from "@/data/landing.data";

export function Hero() {
  const [teamName, setTeamName] = useState("");

  return (
    <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 px-5 sm:px-8 overflow-hidden">
      {/* Ambient blobs */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] rounded-full bg-[oklch(0.50_0.20_150_/_0.12)] blur-[120px] animate-float" />
        <div
          className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-[oklch(0.55_0.18_175_/_0.08)] blur-[100px] animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[oklch(0.60_0.15_130_/_0.06)] blur-[80px] animate-float"
          style={{ animationDelay: "5s" }}
        />
        {/* Orbiting dots */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-primary/40 animate-orbit" />
        <div
          className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-chart-2/40 animate-orbit"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-8 animate-fade-in shadow-sm border-primary/20 bg-primary/5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground font-medium">
            {heroData.badge}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-8 animate-fade-in-up">
          <span className="text-gradient-hero">{heroData.headline.part1}</span>
          <br />
          <span className="text-gradient-primary">{heroData.headline.part2}</span>
        </h1>

        {/* Subhead */}
        <p
          className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          {heroData.subhead}
        </p>

        {/* Enhanced CTA with Team Name Input */}
        <div
          className="max-w-lg mx-auto mb-12 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl glass-card border-primary/20 bg-primary/5 shadow-2xl backdrop-blur-3xl group transition-all hover:bg-primary/10 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/40">
            <Input
              type="text"
              placeholder={heroData.cta.placeholder}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="h-12 border-0 bg-transparent text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 text-base sm:text-lg flex-1 shadow-none"
            />
            <Link
              href={`/auth/login?team=${encodeURIComponent(teamName || "My Team")}`}
            >
              <Button
                size="lg"
                className="cursor-pointer gradient-primary text-white border-0 px-8 h-12 text-sm font-bold shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all gap-2 w-full sm:w-auto"
              >
                {heroData.cta.buttonText}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-3 uppercase tracking-widest font-bold">
            {heroData.cta.subtext}
          </p>
        </div>

        {/* How it works shortcut or Social proof */}
        <div className="flex flex-col items-center gap-12">
          <a
            href="#how-it-works"
            className="group flex flex-col items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.2em] animate-bounce-slow"
          >
            How it works
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>

          {/* Social proof row */}
          <div
            className="flex items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "500ms" }}
          >
            <div className="flex -space-x-2.5">
              {heroData.socialProof.avatarLetters.map((letter, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-background flex items-center justify-center text-[11px] font-bold text-primary border-2 border-primary/20 shadow-sm ring-1 ring-primary/10"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">
                {Array.from({ length: heroData.socialProof.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {heroData.socialProof.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
