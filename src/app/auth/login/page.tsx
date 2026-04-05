"use client";

import { AuthLayout } from "@/components/authentication/AuthLayout";
import { LoginForm } from "@/components/authentication/LoginForm";
import Link from "next/link";
import { Suspense } from "react";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Ready to crush some goals today?"
            testimonial={{
                quote: "CrushGoals transformed how our organization executes. No more guessing or endless meetings — just clear goals, ownership, and real accountability.",
                author: "Preye Omusuku",
                role: "Founder, Letscr8t"
            }}
        >
            <Suspense fallback={<div className="h-48 flex items-center justify-center font-black animate-pulse opacity-20 uppercase tracking-widest text-[10px]">Scanning Identity...</div>}>
                <LoginForm />
            </Suspense>
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
            </div>
            <Link
                href="/auth/signup"
                className="block w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors h-11 leading-[44px]"
            >
                Don&apos;t have an account? Create one
            </Link>
        </AuthLayout>
    );
}
