import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Zap, Users, ChevronRight, Sparkles } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";

interface OnboardingFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function OnboardingFlow({ open, onOpenChange, onComplete }: OnboardingFlowProps) {
  const { updateStats } = useUserStats();
  const [step, setStep] = useState(0);
  const xpReward = 25;

  const handleGetStarted = async () => {
    // Award welcome XP
    await updateStats({ total_xp: xpReward });
    setStep(1);
  };

  const handleComplete = async () => {
    toast.success(`You earned ${xpReward} XP! Let's crush some goals! 🎉`);
    onComplete();
    onOpenChange(false);
  };

  const progress = step === 0 ? 0 : 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] bg-card border-white/10 p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Welcome Step */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome, Champion! 🏆</h2>
                <p className="text-muted-foreground mt-2">Let's get you started on your journey</p>
              </div>

              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
                  <Trophy className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Set Goals</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-premium" />
                  <p className="text-xs text-muted-foreground">Earn XP</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="text-xs text-muted-foreground">Compete</p>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Goal Crusher helps you achieve your dreams by breaking big goals into daily tasks. 
                Complete tasks, earn XP, and climb the leaderboard!
              </p>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleGetStarted}
              >
                Let's Go! <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Complete Step */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">You're All Set! 🚀</h2>
                <p className="text-muted-foreground mt-2">You earned your first XP!</p>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-premium to-primary flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold text-premium mb-2">+{xpReward} XP</p>
                <p className="text-muted-foreground">
                  Now let's create your first goal!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                <h4 className="font-medium mb-2">🎯 Next steps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create your first goal to start earning more XP</li>
                  <li>• Complete daily tasks to build your streak</li>
                  <li>• Check the leaderboard to see how you rank</li>
                </ul>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                variant="hero"
                onClick={handleComplete}
              >
                Start Crushing Goals! <Target className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}