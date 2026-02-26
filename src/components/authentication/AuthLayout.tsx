"use client";

import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      {/* Left side: Form */}
      <div className="flex flex-col items-center justify-center px-8 sm:px-12 relative z-10">
        <div className="w-full max-sm:max-w-xs max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>

          <div className="space-y-4">{children}</div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:flex relative bg-accent/20 items-center justify-center p-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-float" />
          <div
            className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-chart-2/10 blur-[100px] animate-float"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative z-10 glass-card p-12 max-w-lg space-y-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)] border-primary/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <Sparkles className="w-3 h-3" />
            <span>V1 Launch Edition</span>
          </div>
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-tight">
              &ldquo;This tool changed how our team works. No more complex OKR
              academic talk — just simple, actionable goals and
              accountability.&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center font-bold text-white shadow-lg">
                JD
              </div>
              <div>
                <div className="font-bold">Jordan Doe</div>
                <div className="text-sm text-muted-foreground">
                  Founder, TechSprint
                </div>
              </div>
            </footer>
          </blockquote>
        </div>

        {/* Decorative floating goal card */}
        <div className="absolute bottom-24 right-12 glass-card p-4 w-64 shadow-2xl animate-float-slow border-primary/30 rotate-3 group hover:rotate-0 transition-transform duration-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🚀</span>
            <div className="font-bold text-sm">Launch Product V1</div>
          </div>
          <div className="h-2 w-full bg-accent/30 rounded-full mb-2 overflow-hidden">
            <div className="h-full bg-primary w-[80%] rounded-full shadow-[0_0_10px_var(--primary)]" />
          </div>
          <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase">
            <span>Progress</span>
            <span className="text-primary font-black">80%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
