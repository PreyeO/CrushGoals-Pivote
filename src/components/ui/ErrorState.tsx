"use client";

import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHome?: boolean;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the information you requested. This might be due to a connection issue or an expired link.",
    onRetry,
    showHome = true
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 stagger">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 animate-in fade-in zoom-in duration-500">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {title}
            </h2>

            <p className="text-muted-foreground max-w-xs mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                {message}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        className="font-bold gap-2 px-6 h-11"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                )}

                {showHome && (
                    <Link href="/">
                        <Button
                            variant="outline"
                            className="font-bold gap-2 px-6 h-11 border-border/60"
                        >
                            <Home className="w-4 h-4" />
                            Return Home
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
