"use client";

import { AuthLayout } from "@/components/authentication/AuthLayout";
import { SignUpForm } from "@/components/authentication/SignUpForm";
import Link from "next/link";
import { Suspense } from "react";

export default function SignUpPage() {
    return (
        <AuthLayout
            title="Start Your Journey"
            subtitle="Start tracking your organization's progress for free."
        >
            <Suspense fallback={<div className="h-48 flex items-center justify-center font-black animate-pulse opacity-20 uppercase tracking-widest text-[10px]">Preparing Workspace...</div>}>
                <SignUpForm />
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
                href="/auth/login"
                className="block w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors h-11 leading-[44px]"
            >
                Already have an account? Sign in
            </Link>
        </AuthLayout>
    );
}
