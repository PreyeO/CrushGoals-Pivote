"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border/40">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary-sm transition-shadow group-hover:glow-primary">
                        <Target className="w-[18px] h-[18px] text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">CrushGoals</span>
                </Link>
                <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                    <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
                    <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button size="sm" className="gradient-primary text-white border-0 hover:opacity-90 glow-primary-sm text-xs px-4">
                            Get Started Free
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
