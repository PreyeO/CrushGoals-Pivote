import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Target, Users, Trophy, BarChart3, Settings,
  ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2, ListTodo, Rocket
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  route?: string;
  icon: React.ElementType;
  highlight?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to CrushGoals! 🏆",
    description: "Let's take a quick tour to help you become a goal-crushing champion. This will only take a minute!",
    target: "",
    position: "center",
    route: "/dashboard",
    icon: Rocket,
  },
  {
    id: "dashboard-overview",
    title: "Your Command Center",
    description: "This is your dashboard — see today's tasks, your streak, active goals, and weekly progress all in one place.",
    target: "[data-tour='new-goal']",
    position: "bottom",
    route: "/dashboard",
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
    icon: ListTodo,
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
    description: "You've earned 50 XP for completing the tour! Now create your first goal to start crushing it!",
    target: "",
    position: "center",
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
  const [isReady, setIsReady] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const updatePosition = useCallback(() => {
    if (!step) return;

    // Center position for welcome/complete steps
    if (step.position === "center" || !step.target) {
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 180,
      });
      setIsReady(true);
      return;
    }

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);

      const tooltipWidth = 360;
      const tooltipHeight = 220;
      const padding = 20;

      let top = 0;
      let left = 0;

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
      setIsReady(true);
    } else {
      // Fallback to center if target not found
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 120,
        left: window.innerWidth / 2 - 180,
      });
      setIsReady(true);
    }
  }, [step]);

  // Navigate and wait for elements
  useEffect(() => {
    if (!open || !step) return;

    setIsReady(false);

    // Clear any pending timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
      // Wait for navigation and DOM to settle
      navigationTimeoutRef.current = setTimeout(() => {
        // Additional delay for sidebar animations
        setTimeout(updatePosition, 300);
      }, 100);
    } else {
      // Already on correct route, just update position
      navigationTimeoutRef.current = setTimeout(updatePosition, 100);
    }

    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [currentStep, open, step, navigate, location.pathname, updatePosition]);

  // Update position on resize
  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, updatePosition]);

  const handleNext = async () => {
    if (currentStep === tourSteps.length - 1) {
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300" />

      {/* Spotlight on target */}
      {targetRect && isReady && (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
            borderRadius: "12px",
            pointerEvents: "none",
          }}
        >
          {step.highlight && (
            <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse" />
          )}
        </div>
      )}

      {/* Tooltip */}
      {isReady && (
        <Card
          className="absolute w-[360px] p-6 bg-card border-border/50 shadow-2xl animate-fade-in"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 101,
          }}
        >
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
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
          <h3 className="text-xl font-bold mb-3">{step.title}</h3>
          <p className="text-muted-foreground mb-5 leading-relaxed">{step.description}</p>

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
              {currentStep === tourSteps.length - 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>,
    document.body
  );
}
