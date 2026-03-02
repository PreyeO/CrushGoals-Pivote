"use client";

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
    message?: string;
    fullScreen?: boolean;
}

export function LoadingState({ message = "Loading...", fullScreen = true }: LoadingStateProps) {
    const content = (
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            {content}
        </div>
    );
}
