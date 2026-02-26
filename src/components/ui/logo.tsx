"use client";

import { Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    iconOnly?: boolean;
    size?: "sm" | "md" | "lg";
    href?: string;
}

export function Logo({ className, iconOnly = false, size = "md", href = "/" }: LogoProps) {
    const sizeClasses = {
        sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-base" },
        md: { container: "w-9 h-9", icon: "w-[18px] h-[18px]", text: "text-lg" },
        lg: { container: "w-10 h-10", icon: "w-5 h-5", text: "text-xl" },
    };

    const content = (
        <div className={cn("flex items-center gap-2.5 group", className)}>
            <div className={cn(
                "rounded-xl gradient-primary flex items-center justify-center glow-primary-sm transition-shadow group-hover:glow-primary flex-shrink-0",
                sizeClasses[size].container
            )}>
                <Target className={cn("text-white", sizeClasses[size].icon)} />
            </div>
            {!iconOnly && (
                <span className={cn("font-bold tracking-tight", sizeClasses[size].text)}>
                    CrushGoals
                </span>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}
