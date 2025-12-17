import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Trophy, Target, Zap, Users, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";

interface OnboardingFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  completed: boolean;
}

export function OnboardingFlow({ open, onOpenChange, onComplete }: OnboardingFlowProps) {
  const { profile, updateProfile } = useProfile();
  const { updateStats } = useUserStats();
  const [step, setStep] = useState(0);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([
    { id: "welcome", title: "Welcome to Goal Crusher!", description: "You've taken the first step", emoji: "🎉", xp: 10, completed: false },
    { id: "profile", title: "Complete your profile", description: "Add your username", emoji: "👤", xp: 15, completed: !!profile?.username },
    { id: "explore", title: "Explore the dashboard", description: "See where the magic happens", emoji: "🔍", xp: 10, completed: false },
  ]);
  const [earnedXP, setEarnedXP] = useState(0);

  const steps = [
    {
      title: "Welcome, Champion! 🏆",
      subtitle: "Let's get you started with a few quick wins",
      content: "welcome",
    },
    {
      title: "Your Quick Wins",
      subtitle: "Complete these to earn your first XP!",
      content: "quickwins",
    },
    {
      title: "You're All Set! 🚀",
      subtitle: `You earned ${earnedXP} XP!`,
      content: "complete",
    },
  ];

  const handleQuickWin = async (winId: string) => {
    const win = quickWins.find(w => w.id === winId);
    if (!win || win.completed) return;

    setQuickWins(prev => prev.map(w => 
      w.id === winId ? { ...w, completed: true } : w
    ));
    setEarnedXP(prev => prev + win.xp);

    // Award XP
    await updateStats({ total_xp: (win.xp) });
  };

  const handleComplete = async () => {
    // Mark onboarding as complete (could store in profile if needed)
    toast.success(`Amazing! You earned ${earnedXP} XP! 🎉`);
    onComplete();
    onOpenChange(false);
  };

  const completedWins = quickWins.filter(w => w.completed).length;
  const progress = (step / (steps.length - 1)) * 100;

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
          {/* Step Content */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{steps[step].title}</h2>
            <p className="text-muted-foreground mt-2">{steps[step].subtitle}</p>
          </div>

          {/* Welcome Step */}
          {step === 0 && (
            <div className="space-y-6">
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
                onClick={() => {
                  handleQuickWin("welcome");
                  setStep(1);
                }}
              >
                Let's Go! <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Quick Wins Step */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{completedWins}/{quickWins.length}</span>
              </div>

              <div className="space-y-3">
                {quickWins.map((win) => (
                  <button
                    key={win.id}
                    onClick={() => handleQuickWin(win.id)}
                    disabled={win.completed}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all",
                      win.completed
                        ? "border-success/50 bg-success/10"
                        : "border-border hover:border-primary/50 bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                        win.completed ? "bg-success/20" : "bg-primary/20"
                      )}>
                        {win.completed ? <Check className="w-5 h-5 text-success" /> : win.emoji}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          win.completed && "line-through text-muted-foreground"
                        )}>
                          {win.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{win.description}</p>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        win.completed ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                      )}>
                        +{win.xp} XP
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-premium/10 border border-premium/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-premium" />
                  <div>
                    <p className="font-medium text-sm">XP Earned So Far</p>
                    <p className="text-2xl font-bold text-premium">{earnedXP} XP</p>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={() => {
                  handleQuickWin("explore");
                  setStep(2);
                }}
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Complete Step */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-premium to-primary flex items-center justify-center">
                    <Check className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold text-premium mb-2">+{earnedXP} XP</p>
                <p className="text-muted-foreground">
                  You're off to a great start! Now let's create your first goal.
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