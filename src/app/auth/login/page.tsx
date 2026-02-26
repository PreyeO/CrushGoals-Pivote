"use client";

import { AuthLayout } from "@/components/authentication/AuthLayout";
import { LoginForm } from "@/components/authentication/LoginForm";
import Link from "next/link";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Ready to crush some goals today?"
        >
            <LoginForm />
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
