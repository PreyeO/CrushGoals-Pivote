"use client";

import { AuthLayout } from "@/components/authentication/AuthLayout";
import { ForgotPasswordForm } from "@/components/authentication/ForgotPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your email to receive a password reset link."
        >
            <ForgotPasswordForm />
            
            <div className="mt-6">
                <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-2 w-full text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors h-11"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>
            </div>
        </AuthLayout>
    );
}
