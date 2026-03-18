"use client";

import { AuthLayout } from "@/components/authentication/AuthLayout";
import { UpdatePasswordForm } from "@/components/authentication/UpdatePasswordForm";

export default function UpdatePasswordPage() {
    return (
        <AuthLayout
            title="Create New Password"
            subtitle="Enter a new, secure password for your account."
        >
            <UpdatePasswordForm />
        </AuthLayout>
    );
}
