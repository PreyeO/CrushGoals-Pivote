import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface StatCardProps {
  icon?: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "progress" | "streak";
  progress?: number;
  className?: string;
  delay?: number;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  variant = "default",
  progress,
  className,
  delay = 0,
}: StatCardProps) {
  return (
    <Card
      variant="glass"
      className={cn("p-5 animate-slide-up opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {variant === "progress" && progress !== undefined ? (
        <div className="flex items-center gap-4">
          <ProgressRing
            progress={progress}
            size={64}
            strokeWidth={6}
            variant={progress >= 70 ? "success" : progress >= 40 ? "default" : "warning"}
          >
            <span className="text-xs font-bold">{Math.round(progress)}%</span>
          </ProgressRing>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      ) : variant === "streak" ? (
        <div className="text-center">
          <div className="text-4xl mb-2 animate-bounce-subtle">🔥</div>
          <p className="text-3xl font-bold mb-1">{value}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
            <p className="text-2xl font-bold mb-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-2 flex items-center gap-1",
                trend.positive ? "text-success" : "text-destructive"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
