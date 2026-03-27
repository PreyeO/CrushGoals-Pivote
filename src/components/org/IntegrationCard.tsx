import { ReactNode } from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  isConnected: boolean;
  statusLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
  actionLabel?: string;
  ActionIcon?: LucideIcon;
  className?: string;
}

export function IntegrationCard({
  name,
  description,
  icon,
  isConnected,
  statusLabel,
  onClick,
  disabled = false,
  comingSoon = false,
  actionLabel,
  ActionIcon = ArrowRight,
  className,
}: IntegrationCardProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "group relative glass-card p-8 flex flex-col items-center text-center gap-6 transition-all duration-500 overflow-hidden",
        !disabled && "cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30",
        disabled && "opacity-60 border-dashed grayscale cursor-not-allowed",
        isConnected && "border-emerald-500/20 bg-emerald-500/2",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-4 right-4 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5",
          isConnected
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            : comingSoon 
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary border border-primary/20",
        )}
      >
        {isConnected ? (statusLabel || "Connected") : (comingSoon ? "Soon" : "Available")}
      </div>

      <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform border border-border/10 overflow-hidden">
        {icon}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">{name}</h2>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2 w-full">
        <Button
          variant={isConnected ? "secondary" : (comingSoon ? "ghost" : "default")}
          disabled={disabled || comingSoon}
          className={cn(
            "w-full h-11 text-[11px] font-black uppercase tracking-widest gap-2",
            !isConnected && !comingSoon && "gradient-primary text-white border-0 shadow-lg shadow-primary/20"
          )}
        >
          {comingSoon ? "Coming Soon" : isConnected ? (actionLabel || "Configure") : "Connect"}
          {!comingSoon && <ActionIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </div>
    </div>
  );
}
