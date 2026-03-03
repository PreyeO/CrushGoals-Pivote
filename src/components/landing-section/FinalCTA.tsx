"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 px-5 sm:px-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.50_0.20_150_/_0.08)] blur-[150px]" />
      </div>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
          Ready to Crush Goals
          <br />
          as a Team?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Stay aligned, accountable, and motivated
        </p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className=" cursor-pointer gradient-primary text-white border-0 px-10 h-12 text-sm font-semibold animate-pulse-glow hover:opacity-90 gap-2"
          >
            Start Free Today
            <Zap className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
