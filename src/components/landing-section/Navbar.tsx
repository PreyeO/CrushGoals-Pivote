"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
        <Logo size="md" />
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              size="sm"
              className="cursor-pointer gradient-primary text-white border-0 hover:opacity-90 glow-primary-sm text-xs px-4"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
