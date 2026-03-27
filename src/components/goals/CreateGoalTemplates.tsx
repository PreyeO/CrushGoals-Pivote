import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { GOAL_TEMPLATES } from "@/lib/templates";

interface CreateGoalTemplatesProps {
  applyTemplate: (templateId: string) => void;
}

export function CreateGoalTemplates({
  applyTemplate,
}: CreateGoalTemplatesProps) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-accent/20 border border-border/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <Label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80">
            Quick Start Templates
          </Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          {GOAL_TEMPLATES.map((template) => (
            <Tooltip key={template.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className={cn(
                    "group relative flex items-center gap-2 px-3 h-9 rounded-lg border text-[11px] font-semibold transition-all duration-300 cursor-pointer",
                    "bg-background/40 border-border/40 hover:border-primary/50 hover:bg-primary/5",
                    "hover:shadow-[0_0_15px_-5px_var(--primary)] hover:scale-[1.02] active:scale-[0.98]",
                  )}
                >
                  <span className="text-sm scale-110 group-hover:rotate-12 transition-transform">
                    {template.emoji}
                  </span>
                  <span className="truncate max-w-30 text-muted-foreground group-hover:text-foreground transition-colors">
                    {template.title}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="glass-card border-border/40 p-3 max-w-50 shadow-2xl animate-in zoom-in-95">
                <p className="font-bold text-xs mb-1 text-primary">
                  {template.title}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
