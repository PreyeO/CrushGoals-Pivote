import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, ChevronRight, Target, Calendar, 
  Sparkles, CalendarDays, Dumbbell, DollarSign, 
  BookOpen, Briefcase, Heart, Palette, Brain, 
  Plane, Edit3, TrendingUp, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartGoalTemplates, SmartTemplate, goalCategories } from "./SmartGoalTemplates";
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

// Category-specific config for custom goals
const categoryConfig: Record<string, {
  label: string;
  emoji: string;
  icon: any;
  examples: string;
  targetLabel: string;
  targetPlaceholder: string;
  targetHint: string;
  frequencyTip: string;
}> = {
  finance: {
    label: "Finance",
    emoji: "💰",
    icon: DollarSign,
    examples: "Save money, pay debt, invest",
    targetLabel: "Enter the total amount",
    targetPlaceholder: "e.g., '₦500,000' or '$10,000'",
    targetHint: "Enter the exact amount you want to save or pay off",
    frequencyTip: "Monthly works best for payday-aligned savings. Daily for micro-savings.",
  },
  fitness: {
    label: "Fitness",
    emoji: "💪",
    icon: Dumbbell,
    examples: "Lose weight, run, build muscle",
    targetLabel: "Your fitness target",
    targetPlaceholder: "e.g., '10 kg' or '50 km'",
    targetHint: "Enter your measurable goal (weight, distance, workouts)",
    frequencyTip: "Daily works best for habits. Weekly for workout schedules.",
  },
  learning: {
    label: "Learning",
    emoji: "📚",
    icon: BookOpen,
    examples: "Read books, learn skills, get certified",
    targetLabel: "What will you complete?",
    targetPlaceholder: "e.g., '12 books' or '100 lessons'",
    targetHint: "Enter books, lessons, courses, or hours",
    frequencyTip: "Daily for language learning. Weekly/monthly for books.",
  },
  career: {
    label: "Career",
    emoji: "🚀",
    icon: Briefcase,
    examples: "Get promoted, network, switch jobs",
    targetLabel: "Your milestone target",
    targetPlaceholder: "e.g., '50 applications' or '24 connections'",
    targetHint: "Enter milestones, applications, or achievements",
    frequencyTip: "Daily for job search. Weekly for networking.",
  },
  'side-hustle': {
    label: "Side Hustle",
    emoji: "💼",
    icon: TrendingUp,
    examples: "Launch business, freelance, earn extra",
    targetLabel: "Your business target",
    targetPlaceholder: "e.g., '₦500,000' or '10 clients'",
    targetHint: "Enter income target or client count",
    frequencyTip: "Daily for building. Monthly for income goals.",
  },
  spiritual: {
    label: "Spiritual",
    emoji: "🙏",
    icon: Sparkles,
    examples: "Prayer, meditation, scripture reading",
    targetLabel: "Your spiritual practice target",
    targetPlaceholder: "e.g., '90 sessions' or '365 chapters'",
    targetHint: "Enter sessions, chapters, or days",
    frequencyTip: "Daily works best for spiritual habits.",
  },
  'mental-health': {
    label: "Mental Health",
    emoji: "🧠",
    icon: Brain,
    examples: "Meditation, journaling, therapy",
    targetLabel: "Your wellness target",
    targetPlaceholder: "e.g., '60 sessions' or '90 entries'",
    targetHint: "Enter sessions, entries, or days",
    frequencyTip: "Daily works best for meditation and journaling.",
  },
  relationship: {
    label: "Relationship",
    emoji: "❤️",
    icon: Heart,
    examples: "Quality time, date nights, reconnect",
    targetLabel: "Your relationship goal",
    targetPlaceholder: "e.g., '52 date nights' or '24 meetups'",
    targetHint: "Enter activities or time sessions",
    frequencyTip: "Weekly for date nights. Monthly for bigger gatherings.",
  },
  content: {
    label: "Content",
    emoji: "🎬",
    icon: Palette,
    examples: "YouTube, blog, podcast, social media",
    targetLabel: "Your content output",
    targetPlaceholder: "e.g., '52 videos' or '180 posts'",
    targetHint: "Enter videos, posts, episodes, or articles",
    frequencyTip: "Weekly for YouTube/podcast. Daily for social media.",
  },
  lifestyle: {
    label: "Lifestyle",
    emoji: "✨",
    icon: Users,
    examples: "Morning routine, travel, cooking, habits",
    targetLabel: "Your lifestyle target",
    targetPlaceholder: "e.g., '66 days' or '12 trips'",
    targetHint: "Enter days, trips, or activities",
    frequencyTip: "Daily for habits. Monthly for bigger goals.",
  },
  custom: {
    label: "Custom Goal",
    emoji: "✏️",
    icon: Edit3,
    examples: "Create your own unique goal",
    targetLabel: "Your measurable target",
    targetPlaceholder: "e.g., '30 days' or '100 units'",
    targetHint: "Enter a number with unit for smart breakdown",
    frequencyTip: "Choose based on your goal type.",
  },
};

// Calculate days between two dates
const getDaysBetween = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Generate breakdown preview
const getBreakdownPreview = (
  targetValue: string, 
  days: number, 
  frequency: 'daily' | 'weekly' | 'monthly'
): string => {
  if (!targetValue || days <= 0) return '';
  
  const match = targetValue.match(/^\$?₦?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(.*)$/);
  if (!match) return '';
  
  const value = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2].trim() || 'units';
  
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
  const displayValue = perPeriod % 1 === 0 ? perPeriod : perPeriod.toFixed(1);
  
  const isCurrency = targetValue.startsWith('$') || targetValue.startsWith('₦');
  const currencySymbol = targetValue.startsWith('$') ? '$' : '₦';
  
  if (isCurrency) {
    return `${currencySymbol}${Number(displayValue).toLocaleString()} per ${periodLabel}`;
  }
  
  return `${displayValue} ${unit} per ${periodLabel}`;
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

  const config = selectedCategory ? categoryConfig[selectedCategory] || categoryConfig.custom : null;

  // Handle template selection from SmartGoalTemplates
  const handleTemplateSelect = (template: SmartTemplate, fieldValues: Record<string, string>) => {
    setSelectedCategory(template.category);
    
    // Build goal name from template
    let name = template.smartPrompt;
    Object.entries(fieldValues).forEach(([key, value]) => {
      if (value) {
        const field = template.fields.find(f => f.key === key);
        const displayValue = field?.type === 'currency' 
          ? `₦${Number(value).toLocaleString()}`
          : field?.suffix ? `${value} ${field.suffix}` : value;
        name = name.replace(`{${key}}`, displayValue);
      }
    });
    name = name.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim();
    name = name.replace(' by ', ''); // Remove "by" for deadline
    setGoalName(name);
    
    // Build target from primary field
    const primaryField = template.fields[0];
    if (primaryField && fieldValues[primaryField.key]) {
      const value = fieldValues[primaryField.key];
      if (primaryField.type === 'currency') {
        setGoalTarget(`₦${Number(value).toLocaleString()}`);
      } else if (primaryField.suffix) {
        setGoalTarget(`${value} ${primaryField.suffix}`);
      } else {
        setGoalTarget(value);
      }
    }
    
    setFrequency(template.frequency);
    
    // Set dates
    const start = new Date();
    const end = addDays(start, template.defaultDuration);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setDeadline(format(end, 'yyyy-MM-dd'));
    
    // Set reason
    setReason(`I want to ${template.description.toLowerCase()}`);
    
    setStep(2);
  };

  // Handle custom goal creation
  const handleCreateCustom = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
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
  const breakdownPreview = goalTarget ? getBreakdownPreview(goalTarget, daysToAchieve, frequency) : '';

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
                  {step === 1 
                    ? "Create a New Goal 🎯" 
                    : step === 2 
                    ? "Customize Your Goal" 
                    : "Ready to Start!"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {step === 1 
                    ? "Pick a category to get started" 
                    : step === 2 
                    ? config?.examples || "Set your goal details"
                    : "Review and launch your goal"
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

          {/* Step 1: Category & Template Selection */}
          {step === 1 && (
            <SmartGoalTemplates
              onSelectTemplate={handleTemplateSelect}
              onCreateCustom={handleCreateCustom}
            />
          )}

          {/* Step 2: Goal Details */}
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
                <Label htmlFor="goalTarget">
                  {config.targetLabel}
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
                  <span className="font-medium">Timeline</span>
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
                      {daysToAchieve} days to achieve this goal!
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
                    {goalTarget} in {daysToAchieve} days
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

          {/* Step 3: Review & Create */}
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
                    <span className="font-semibold">
                      Your {frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Monthly'} Target
                    </span>
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
                Create Goal & Start! 🎯
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
