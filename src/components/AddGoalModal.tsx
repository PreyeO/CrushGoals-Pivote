import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dumbbell, DollarSign, BookOpen, Briefcase, Heart, 
  Palette, Brain, Plane, Edit3, ChevronLeft, ChevronRight,
  Target, Calendar, Sparkles, CalendarDays, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GoalTemplates, GoalTemplate, goalTemplates } from "./GoalTemplates";
import { addDays, format } from "date-fns";

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
  frequency: 'daily' | 'weekly' | 'monthly';
}

// Category-specific content
const categoryConfig: Record<string, {
  label: string;
  emoji: string;
  icon: any;
  examples: string;
  targetLabel: string;
  targetPlaceholder: string;
  targetHint: string;
  timelineLabel: string;
  frequencyTip: string;
  breakdownPrefix: string;
}> = {
  fitness: {
    label: "Fitness & Health",
    emoji: "💪",
    icon: Dumbbell,
    examples: "Transform your body, build strength, improve endurance",
    targetLabel: "Your fitness target",
    targetPlaceholder: "e.g., '10 kg loss' or '50 km running'",
    targetHint: "Enter your measurable goal (weight, distance, reps)",
    timelineLabel: "When do you want to achieve this?",
    frequencyTip: "Daily works best for habits. Weekly for workout schedules.",
    breakdownPrefix: "Progress",
  },
  financial: {
    label: "Financial Goals",
    emoji: "💰",
    icon: DollarSign,
    examples: "Save for emergency fund, pay off debt, build investments",
    targetLabel: "Enter the total amount",
    targetPlaceholder: "e.g., '$10,000' or '₦500,000'",
    targetHint: "Enter the exact amount you want to save or pay off",
    timelineLabel: "When do you want to reach this?",
    frequencyTip: "Monthly works best for payday-aligned savings. Daily for micro-savings habits.",
    breakdownPrefix: "Save",
  },
  learning: {
    label: "Learning & Skills",
    emoji: "📚",
    icon: BookOpen,
    examples: "Master a language, read books, get certified",
    targetLabel: "What will you complete?",
    targetPlaceholder: "e.g., '12 books' or '365 lessons'",
    targetHint: "Enter books, lessons, courses, or hours to complete",
    timelineLabel: "When will you finish learning?",
    frequencyTip: "Daily for language learning. Weekly/monthly for courses and books.",
    breakdownPrefix: "Complete",
  },
  career: {
    label: "Career & Business",
    emoji: "🚀",
    icon: Briefcase,
    examples: "Launch your project, grow your network, get promoted",
    targetLabel: "Your milestone target",
    targetPlaceholder: "e.g., '1 launch' or '12 connections'",
    targetHint: "Enter launches, connections, or milestones",
    timelineLabel: "When is your deadline?",
    frequencyTip: "Daily for ongoing projects. Weekly for networking and reviews.",
    breakdownPrefix: "Complete",
  },
  relationships: {
    label: "Relationships",
    emoji: "❤️",
    icon: Heart,
    examples: "Quality time with family, meet new people, reconnect",
    targetLabel: "Your relationship goal",
    targetPlaceholder: "e.g., '12 date nights' or '52 family dinners'",
    targetHint: "Enter activities or quality time sessions",
    timelineLabel: "Over what period?",
    frequencyTip: "Weekly for date nights. Monthly for bigger gatherings.",
    breakdownPrefix: "Schedule",
  },
  creative: {
    label: "Creative Projects",
    emoji: "🎨",
    icon: Palette,
    examples: "Write a book, create art, start a podcast",
    targetLabel: "Your creative output",
    targetPlaceholder: "e.g., '50000 words' or '12 pieces'",
    targetHint: "Enter words, pieces, episodes, or creations",
    timelineLabel: "When will you finish?",
    frequencyTip: "Daily for writing. Weekly for larger creative pieces.",
    breakdownPrefix: "Create",
  },
  wellness: {
    label: "Mental Wellness",
    emoji: "🧘",
    icon: Brain,
    examples: "Meditate daily, reduce stress, sleep better",
    targetLabel: "Your wellness target",
    targetPlaceholder: "e.g., '30 sessions' or '21 nights'",
    targetHint: "Enter sessions, nights, or practice days",
    timelineLabel: "How long will you practice?",
    frequencyTip: "Daily works best for meditation and sleep habits.",
    breakdownPrefix: "Complete",
  },
  travel: {
    label: "Travel & Adventure",
    emoji: "✈️",
    icon: Plane,
    examples: "Visit countries, take trips, explore locally",
    targetLabel: "Your adventure goal",
    targetPlaceholder: "e.g., '5 countries' or '12 trips'",
    targetHint: "Enter destinations or adventures planned",
    timelineLabel: "By when?",
    frequencyTip: "Monthly for regular trips. Weekly for local adventures.",
    breakdownPrefix: "Experience",
  },
  custom: {
    label: "Custom Goal",
    emoji: "✏️",
    icon: Edit3,
    examples: "Create your own unique goal",
    targetLabel: "Your measurable target",
    targetPlaceholder: "e.g., '30 days' or '100 units'",
    targetHint: "Enter a number with unit for smart breakdown",
    timelineLabel: "When will you achieve this?",
    frequencyTip: "Choose based on your goal type.",
    breakdownPrefix: "Complete",
  },
};

const goalCategories = Object.entries(categoryConfig).map(([id, config]) => ({
  id,
  ...config,
}));

// Calculate days between two dates
const getDaysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Generate breakdown preview based on category and frequency
const getBreakdownPreview = (
  category: string,
  targetValue: string, 
  days: number, 
  frequency: 'daily' | 'weekly' | 'monthly'
): string => {
  if (!targetValue || days <= 0) return '';
  
  const match = targetValue.match(/^\$?₦?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(.*)$/);
  if (!match) return '';
  
  const value = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].trim() || 'units';
  const config = categoryConfig[category] || categoryConfig.custom;
  
  let periodsCount: number;
  let periodLabel: string;
  
  switch (frequency) {
    case 'daily':
      periodsCount = days;
      periodLabel = 'day';
      break;
    case 'weekly':
      periodsCount = Math.ceil(days / 7);
      periodLabel = 'week';
      break;
    case 'monthly':
      periodsCount = Math.ceil(days / 30);
      periodLabel = 'month';
      break;
  }
  
  const perPeriod = value / periodsCount;
  const displayValue = perPeriod % 1 === 0 ? perPeriod : perPeriod.toFixed(2);
  
  // Format currency nicely
  const isCurrency = targetValue.startsWith('$') || targetValue.startsWith('₦');
  const currencySymbol = targetValue.startsWith('₦') ? '₦' : '$';
  
  if (isCurrency) {
    return `${config.breakdownPrefix} ${currencySymbol}${Number(displayValue).toLocaleString()} per ${periodLabel}`;
  }
  
  return `${config.breakdownPrefix} ${displayValue} ${unit} per ${periodLabel}`;
};

const taskFrequencies = [
  { id: 'daily', label: 'Daily', desc: 'Every day' },
  { id: 'weekly', label: 'Weekly', desc: 'Once a week' },
  { id: 'monthly', label: 'Monthly', desc: 'Once a month' },
] as const;

export function AddGoalModal({ open, onOpenChange, onSuccess }: AddGoalModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const config = selectedCategory ? categoryConfig[selectedCategory] : null;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleTemplateSelect = (template: GoalTemplate) => {
    setSelectedCategory(template.category);
    setGoalName(template.name);
    setGoalTarget(template.target);
    setFrequency(template.frequency);
    setReason(template.reason);
    const start = new Date();
    const end = addDays(start, template.durationDays);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setDeadline(format(end, 'yyyy-MM-dd'));
    setStep(2);
  };

  const handleCreateCustom = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (selectedCategory && goalName && startDate && config) {
      onSuccess?.({
        category: selectedCategory,
        emoji: config.emoji,
        name: goalName,
        target: goalTarget,
        startDate,
        deadline,
        reason,
        frequency,
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
    setFrequency('daily');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const daysToAchieve = getDaysBetween(startDate, deadline);
  const canProceed = goalName && startDate && deadline && daysToAchieve > 0;
  const breakdownPreview = config ? getBreakdownPreview(selectedCategory!, goalTarget, daysToAchieve, frequency) : '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh] overflow-y-auto bg-card border-white/10 backdrop-blur-xl p-0">
        <div className="p-4 sm:p-6">
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
                  {step === 1 ? "Get Started in 30 Seconds 🎯" : step === 2 ? "Define Your Goal" : "Ready to Crush It!"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 
                    ? "Pick a template or create your own" 
                    : step === 2 
                    ? config?.examples || "Set your goal details"
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
            <div className="space-y-6">
              {/* Quick Templates Section */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Quick Start Templates</span>
                </div>
                <GoalTemplates 
                  onSelectTemplate={handleTemplateSelect} 
                  onCreateCustom={handleCreateCustom}
                />
              </div>

              {/* Or Choose Category */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or pick a category</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {goalCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left group"
                    )}
                  >
                    <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">{category.emoji}</span>
                    <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{category.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{category.examples}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && config && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                <span className="text-3xl">{config.emoji}</span>
                <div>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{config.examples}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalName" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  What's your specific goal?
                </Label>
                <Input
                  id="goalName"
                  placeholder={`e.g., ${config.examples.split(',')[0].trim()}`}
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalTarget" className="flex items-center gap-2">
                  <span>{config.targetLabel}</span>
                </Label>
                <Input
                  id="goalTarget"
                  placeholder={config.targetPlaceholder}
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="bg-secondary border-border h-12"
                />
                <p className="text-xs text-muted-foreground">
                  💡 {config.targetHint}
                </p>
              </div>

              {/* Date Selection */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="font-medium">{config.timelineLabel}</span>
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

              {/* Task Frequency Selection */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  How often do you want tasks?
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {taskFrequencies.map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setFrequency(freq.id)}
                      className={cn(
                        "p-3 rounded-lg border transition-all text-center",
                        frequency === freq.id
                          ? "bg-primary/20 border-primary/50"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      )}
                    >
                      <p className="font-medium text-sm">{freq.label}</p>
                      <p className="text-xs text-muted-foreground">{freq.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  💡 {config.frequencyTip}
                </p>
              </div>

              {/* Smart Breakdown Preview */}
              {breakdownPreview && goalTarget && daysToAchieve > 0 && (
                <div className="p-4 rounded-xl bg-premium/10 border border-premium/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-premium" />
                    <span className="font-medium text-sm">Smart Breakdown</span>
                  </div>
                  <p className="text-lg font-bold text-premium">{breakdownPreview}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {goalTarget} in {daysToAchieve} days = {breakdownPreview.toLowerCase()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-premium" />
                  Why does this matter to you?
                </Label>
                <Textarea
                  id="reason"
                  placeholder="This motivates you on tough days..."
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

          {step === 3 && config && (
            <div className="space-y-5">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{config.emoji}</span>
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
                    <p className="text-xs text-muted-foreground mb-1">Target Date</p>
                    <p className="font-medium">
                      {deadline ? new Date(deadline).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : 'No deadline'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium">{daysToAchieve} days</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Task Frequency</p>
                    <p className="font-medium capitalize">{frequency}</p>
                  </div>
                </div>
              </div>

              {/* Smart breakdown summary */}
              {breakdownPreview && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-success" />
                    <span className="font-semibold">Your Daily Mission</span>
                  </div>
                  <p className="text-lg font-bold">{breakdownPreview}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Small consistent actions = Big results 🚀
                  </p>
                </div>
              )}

              {reason && (
                <div className="p-4 rounded-xl bg-premium/10 border border-premium/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-premium" />
                    <span className="font-semibold">Your Why</span>
                  </div>
                  <p className="text-sm italic">"{reason}"</p>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
              >
                <Target className="w-4 h-4 mr-2" />
                Create Goal & Start Crushing! 🎯
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}