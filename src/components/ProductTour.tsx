import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, ChevronRight, X, Sparkles, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductTourProps {
  open: boolean;
  onComplete: () => void;
}

export function ProductTour({ open, onComplete }: ProductTourProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'welcome' | 'create'>('welcome');

  const handleCreateGoal = () => {
    onComplete();
    // Trigger the add goal modal by dispatching a custom event
    window.dispatchEvent(new CustomEvent('openAddGoalModal'));
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] animate-fade-in">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border/50 shadow-2xl animate-scale-in">
          {step === 'welcome' ? (
            <>
              {/* Welcome Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-md">
                  <Rocket className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to CrushGoals!</h2>
                <p className="text-muted-foreground">
                  You're one step away from crushing your first goal. Let's get you set up!
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Create Your First Goal</h3>
                      <p className="text-sm text-muted-foreground">
                        Set a goal you want to achieve. We'll break it down into daily tasks to keep you on track.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => setStep('create')}
                >
                  Let's Go
                  <ChevronRight className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={handleSkip}
                >
                  I'll explore on my own
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Create Goal Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Ready to Crush It?</h2>
                <p className="text-muted-foreground">
                  Create your first goal and start your journey to success!
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleCreateGoal}
                >
                  <Target className="w-5 h-5" />
                  Create My First Goal
                </Button>

              </div>
            </>
          )}
        </Card>
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
        onClick={handleSkip}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>,
    document.body
  );
}
