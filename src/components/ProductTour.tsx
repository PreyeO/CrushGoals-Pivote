import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Target, Users, Trophy, BarChart3, Settings,
  ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: "top" | "bottom" | "left" | "right";
  route?: string; // Navigate to this route before showing
  action?: string; // Description of action user should take
  icon: React.ElementType;
  highlight?: boolean; // Whether to pulse the target
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to CrushGoals! 🏆",
    description: "Let's take a quick tour to help you become a goal-crushing champion. This will only take a minute!",
    target: "body",
    position: "bottom",
    route: "/dashboard",
    icon: Sparkles,
  },
  {
    id: "new-goal",
    title: "Create Your First Goal",
    description: "Click the 'New Goal' button to start your journey. Goals are broken into daily tasks to make them achievable.",
    target: "[data-tour='new-goal']",
    position: "bottom",
    route: "/dashboard",
    action: "Click 'New Goal' to continue",
    icon: Target,
    highlight: true,
  },
  {
    id: "goals-page",
    title: "Your Goals Hub",
    description: "This is where all your goals live. Track progress, see streaks, and celebrate wins!",
    target: "[data-tour='nav-goals']",
    position: "right",
    route: "/goals",
    icon: Target,
    highlight: true,
  },
  {
    id: "tasks-page",
    title: "Daily Tasks",
    description: "Your daily missions appear here. Complete them to earn XP and build your streak!",
    target: "[data-tour='nav-tasks']",
    position: "right",
    route: "/tasks",
    icon: CheckCircle2,
    highlight: true,
  },
  {
    id: "leaderboard",
    title: "Compete with Friends",
    description: "See how you rank against other goal crushers. Invite friends to compete!",
    target: "[data-tour='nav-leaderboard']",
    position: "right",
    route: "/leaderboard",
    icon: Users,
    highlight: true,
  },
  {
    id: "achievements",
    title: "Earn Achievements",
    description: "Unlock badges as you hit milestones. Collect them all to become a legend!",
    target: "[data-tour='nav-achievements']",
    position: "right",
    route: "/achievements",
    icon: Trophy,
    highlight: true,
  },
  {
    id: "analytics",
    title: "Track Your Progress",
    description: "Dive deep into your stats. See patterns, track consistency, and optimize your routine.",
    target: "[data-tour='nav-analytics']",
    position: "right",
    route: "/analytics",
    icon: BarChart3,
    highlight: true,
  },
  {
    id: "settings",
    title: "Personalize Your Experience",
    description: "Customize notifications, themes, and more to make CrushGoals truly yours.",
    target: "[data-tour='nav-settings']",
    position: "right",
    route: "/settings",
    icon: Settings,
    highlight: true,
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "You've earned 50 XP for completing the tour! Now go crush your first goal.",
    target: "body",
    position: "bottom",
    route: "/dashboard",
    icon: Sparkles,
  },
];

interface ProductTourProps {
  open: boolean;
  onComplete: () => void;
}

export function ProductTour({ open, onComplete }: ProductTourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStats } = useUserStats();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const updatePosition = useCallback(() => {
    if (!step) return;

    const target = document.querySelector(step.target);
    if (target && step.target !== "body") {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate tooltip position based on step.position
      let top = 0;
      let left = 0;
      const tooltipWidth = 340;
      const tooltipHeight = 200;
      const padding = 16;

      switch (step.position) {
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
      top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

      setTooltipPosition({ top, left });
    } else {
      // Center for body target
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 170,
      });
    }
  }, [step]);

  // Navigate to correct route when step changes
  useEffect(() => {
    if (!open || !step) return;

    if (step.route && location.pathname !== step.route) {
      setIsTransitioning(true);
      navigate(step.route);
      // Wait for navigation to complete
      setTimeout(() => {
        setIsTransitioning(false);
        updatePosition();
      }, 300);
    } else {
      updatePosition();
    }
  }, [currentStep, open, step, navigate, location.pathname, updatePosition]);

  // Update position on resize
  useEffect(() => {
    if (!open) return;

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [open, updatePosition]);

  // Re-calculate position after DOM updates
  useEffect(() => {
    if (!open || isTransitioning) return;

    const timer = setTimeout(updatePosition, 100);
    return () => clearTimeout(timer);
  }, [open, isTransitioning, updatePosition]);

  const handleNext = async () => {
    if (currentStep === tourSteps.length - 1) {
      // Complete the tour
      await updateStats({ total_xp: 50 });
      toast.success("Tour complete! You earned 50 XP 🎉");
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!open) return null;

  const Icon = step.icon;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Spotlight on target */}
      {targetRect && (
        <div
          className="absolute bg-transparent transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            borderRadius: "12px",
          }}
        >
          {/* Pulsing ring for highlighted elements */}
          {step.highlight && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse" />
          )}
        </div>
      )}

      {/* Tooltip */}
      <Card
        className="absolute w-[340px] p-5 bg-card border-border/50 shadow-2xl animate-fade-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          zIndex: 101,
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

        {step.action && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {step.action}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
            {currentStep < tourSteps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  );
}
