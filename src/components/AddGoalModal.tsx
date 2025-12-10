import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dumbbell, DollarSign, BookOpen, Briefcase, Heart, 
  Palette, Brain, Plane, Edit3, ChevronLeft, ChevronRight,
  Target, Calendar, Sparkles, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (goal: GoalData) => void;
}

export interface GoalData {
  category: string;
  emoji: string;
  name: string;
  target: string;
  startDate: string;
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

// Calculate days between two dates
const getDaysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function AddGoalModal({ open, onOpenChange, onSuccess }: AddGoalModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof goalCategories[0] | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");

  const handleCategorySelect = (category: typeof goalCategories[0]) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedCategory && goalName && startDate) {
      onSuccess?.({
        category: selectedCategory.id,
        emoji: selectedCategory.emoji,
        name: goalName,
        target: goalTarget,
        startDate,
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
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline("");
    setReason("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const daysToAchieve = getDaysBetween(startDate, deadline);
  const canProceed = goalName && startDate && deadline && daysToAchieve > 0;

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
                  {step === 1 ? "Choose Your Focus 🎯" : step === 2 ? "Define Your Goal" : "Ready to Crush It!"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 
                    ? "What's your #1 priority?" 
                    : step === 2 
                    ? "Set clear dates to track your journey"
                    : "Review your goal and let's go!"
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
                  placeholder="e.g., Lose 20kg, Save $10,000, Learn Spanish"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalTarget" className="flex items-center gap-2">
                  <span>Measurable Target</span>
                  <span className="text-xs text-muted-foreground">(for smart daily breakdown)</span>
                </Label>
                <Input
                  id="goalTarget"
                  placeholder="e.g., 30 pages, 10kg, 5000 words, 24 chapters"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Enter a number with unit (e.g., "30 pages") and we'll calculate your daily target automatically!
                </p>
              </div>

              {/* Date Selection - Clear Start & End */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="font-medium">When will you work on this?</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-secondary border-border h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm text-muted-foreground">
                      Target End Date
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-secondary border-border h-12"
                    />
                  </div>
                </div>

                {/* Duration Indicator */}
                {startDate && deadline && daysToAchieve > 0 && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
                    <Calendar className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      {daysToAchieve} days to crush this goal!
                    </span>
                  </div>
                )}

                {startDate && deadline && daysToAchieve <= 0 && (
                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <span className="text-sm text-destructive">
                      End date must be after start date
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-premium" />
                  Why does this matter to you?
                </Label>
                <Textarea
                  id="reason"
                  placeholder="This motivates you on tough days... (e.g., 'I want to be healthy for my kids')"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-secondary border-border min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground">
                  Writing your "why" increases success rate by 70%!
                </p>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => setStep(3)}
                disabled={!canProceed}
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">
                      {new Date(startDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">
                      {new Date(deadline).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm mb-3">
                  <div className="flex-1 h-2 rounded-full bg-white/10">
                    <div className="h-full w-0 rounded-full bg-gradient-primary animate-pulse" />
                  </div>
                  <span className="text-primary font-medium">{daysToAchieve} days</span>
                </div>

                {reason && (
                  <div className="p-3 rounded-lg bg-white/5 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Your Why:</p>
                    <p className="text-foreground-secondary italic">"{reason}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-success mb-1">🚀 Daily Tasks Auto-Generated!</p>
                    <p className="text-sm text-muted-foreground">
                      {goalTarget ? (
                        <>We'll create {daysToAchieve} daily tasks breaking down "{goalTarget}" into achievable chunks. Check your Tasks page to see today's mission!</>
                      ) : (
                        <>We'll create daily reminder tasks for each day. Complete them to build momentum and earn XP!</>
                      )}
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
