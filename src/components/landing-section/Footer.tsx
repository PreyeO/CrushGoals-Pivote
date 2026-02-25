"use client";

import Link from "next/link";
import { Target } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-8 px-5 sm:px-8 border-t border-border/30">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                        <Target className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold">CrushGoals</span>
                </Link>
                <p className="text-xs text-muted-foreground">© 2026 CrushGoals by LetsCr8t. All rights reserved.</p>
            </div>
        </footer>
    );
}
