import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dumbbell, DollarSign, BookOpen, Briefcase, Heart, 
  Palette, Brain, Plane, Edit3, ChevronLeft, ChevronRight,
  Target, Calendar, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (goal: GoalData) => void;
}

interface GoalData {
  category: string;
  emoji: string;
  name: string;
  target: string;
  deadline: string;
  reason: string;
}

const goalCategories = [
  { id: "fitness", label: "Fitness & Health", emoji: "💪", icon: Dumbbell, examples: "Lose 20kg, Run marathon, Exercise 5x/week" },
  { id: "financial", label: "Financial Goals", emoji: "💰", icon: DollarSign, examples: "Save $10,000, Earn side income, Pay off debt" },
  { id: "learning", label: "Learning & Skills", emoji: "📚", icon: BookOpen, examples: "Learn a language, Read 24 books, Get certified" },
  { id: "career", label: "Career & Business", emoji: "🚀", icon: Briefcase, examples: "Get promoted, Launch product, Grow audience" },
  { id: "relationships", label: "Relationships", emoji: "❤️", icon: Heart, examples: "Meet new people, Improve communication, Family time" },
  { id: "creative", label: "Creative Projects", emoji: "🎨", icon: Palette, examples: "Write a book, Create art, Start a podcast" },
  { id: "wellness", label: "Mental Wellness", emoji: "🧘", icon: Brain, examples: "Meditate daily, Reduce stress, Better sleep" },
  { id: "travel", label: "Travel & Adventure", emoji: "✈️", icon: Plane, examples: "Visit 5 countries, Take a road trip, Learn to surf" },
  { id: "custom", label: "Custom Goal", emoji: "✏️", icon: Edit3, examples: "Create your own unique goal" },
];

export function AddGoalModal({ open, onOpenChange, onSuccess }: AddGoalModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof goalCategories[0] | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");

  const handleCategorySelect = (category: typeof goalCategories[0]) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedCategory && goalName) {
      onSuccess?.({
        category: selectedCategory.id,
        emoji: selectedCategory.emoji,
        name: goalName,
        target: goalTarget,
        deadline,
        reason,
      });
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCategory(null);
    setGoalName("");
    setGoalTarget("");
    setDeadline("");
    setReason("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-white/10 backdrop-blur-xl p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold">
                  {step === 1 ? "Choose Your Focus 🎯" : step === 2 ? "Set Your Goal" : "Review & Create"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 
                    ? "What's your #1 priority?" 
                    : step === 2 
                    ? "Define what you want to achieve"
                    : "Let's break it down into actionable tasks"
                  }
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      s <= step ? "bg-primary" : "bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogHeader>

          {step === 1 && (
            <div className="grid grid-cols-3 gap-3">
              {goalCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={cn(
                    "p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left group"
                  )}
                >
                  <span className="text-3xl mb-2 block">{category.emoji}</span>
                  <p className="font-medium text-sm mb-1">{category.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{category.examples}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && selectedCategory && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-3xl">{selectedCategory.emoji}</span>
                <div>
                  <p className="font-medium">{selectedCategory.label}</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.examples}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalName" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  What's your specific goal?
                </Label>
                <Input
                  id="goalName"
                  placeholder="e.g., Lose 20kg by June 2026"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalTarget">
                  Target / Measurement (optional)
                </Label>
                <Input
                  id="goalTarget"
                  placeholder="e.g., 20kg, $10,000, 24 books"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Target Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-premium" />
                  Why does this matter? (boosts motivation by 70%!)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Tell us why this goal is important to you..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-secondary border-border min-h-[80px]"
                />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setStep(3)}
                disabled={!goalName}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 3 && selectedCategory && (
            <div className="space-y-5">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{selectedCategory.emoji}</span>
                  <div>
                    <h3 className="text-lg font-bold">{goalName}</h3>
                    {goalTarget && (
                      <p className="text-sm text-muted-foreground">Target: {goalTarget}</p>
                    )}
                  </div>
                </div>

                {deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    Deadline: {new Date(deadline).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                )}

                {reason && (
                  <div className="p-3 rounded-lg bg-white/5 text-sm">
                    <p className="text-muted-foreground">"{reason}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success mb-1">AI-Powered Breakdown</p>
                    <p className="text-sm text-muted-foreground">
                      We'll automatically create daily tasks and milestones to help you achieve this goal!
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
              >
                🚀 Create Goal & Start Crushing
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
