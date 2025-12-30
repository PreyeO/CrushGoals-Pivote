import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, ChevronRight, Target, Calendar, 
  Sparkles, CalendarDays, Dumbbell, DollarSign, 
  BookOpen, Briefcase, Heart, Palette, Brain, 
  Edit3, TrendingUp, Users, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartGoalTemplates, PopularGoalTemplate, goalCategories } from "./SmartGoalTemplates";
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
  frequencyTip: string;
}> = {
  finance: {
    label: "Finance",
    emoji: "💰",
    icon: DollarSign,
    examples: "Save money, pay debt, invest",
    frequencyTip: "Monthly works best for payday-aligned savings.",
  },
  fitness: {
    label: "Fitness",
    emoji: "💪",
    icon: Dumbbell,
    examples: "Lose weight, run, build muscle",
    frequencyTip: "Daily works best for habits.",
  },
  learning: {
    label: "Learning",
    emoji: "📚",
    icon: BookOpen,
    examples: "Read books, learn skills",
    frequencyTip: "Daily for language, monthly for books.",
  },
  career: {
    label: "Career",
    emoji: "🚀",
    icon: Briefcase,
    examples: "Get promoted, network",
    frequencyTip: "Daily for job search, weekly for networking.",
  },
  'side-hustle': {
    label: "Side Hustle",
    emoji: "💼",
    icon: TrendingUp,
    examples: "Launch business, freelance",
    frequencyTip: "Daily for building, monthly for income goals.",
  },
  spiritual: {
    label: "Spiritual",
    emoji: "🙏",
    icon: Sparkles,
    examples: "Prayer, meditation",
    frequencyTip: "Daily works best for spiritual habits.",
  },
  'mental-health': {
    label: "Mental Health",
    emoji: "🧠",
    icon: Brain,
    examples: "Meditation, journaling",
    frequencyTip: "Daily works best for meditation.",
  },
  relationship: {
    label: "Relationship",
    emoji: "❤️",
    icon: Heart,
    examples: "Quality time, date nights",
    frequencyTip: "Weekly for date nights.",
  },
  content: {
    label: "Content",
    emoji: "🎬",
    icon: Palette,
    examples: "YouTube, blog, podcast",
    frequencyTip: "Weekly for YouTube, daily for social media.",
  },
  lifestyle: {
    label: "Lifestyle",
    emoji: "✨",
    icon: Users,
    examples: "Morning routine, habits",
    frequencyTip: "Daily for habits.",
  },
  custom: {
    label: "Custom Goal",
    emoji: "✏️",
    icon: Edit3,
    examples: "Create your own unique goal",
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

// Get emoji for category
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    fitness: '💪',
    finance: '💰',
    learning: '📚',
    career: '🚀',
    'side-hustle': '💼',
    spiritual: '🙏',
    'mental-health': '🧠',
    relationship: '❤️',
    content: '🎬',
    lifestyle: '✨',
    custom: '✏️',
  };
  return emojiMap[category] || '🎯';
};

const formatParticipants = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export function AddGoalModal({ open, onOpenChange, onSuccess }: AddGoalModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PopularGoalTemplate | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [startDate, setStartDate] = useState('2026-01-01');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [reason, setReason] = useState("");
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const config = selectedCategory ? categoryConfig[selectedCategory] || categoryConfig.custom : null;

  // Handle template selection from SmartGoalTemplates
  const handleTemplateSelect = (template: PopularGoalTemplate) => {
    setSelectedTemplate(template);
    setSelectedCategory(template.category);
    setGoalName(template.name);
    setFrequency(template.frequency);
    // Default to full year Jan 1 - Dec 31, 2026
    setStartDate('2026-01-01');
    setDeadline('2026-12-31');
    setGoalTarget('');
    setCustomInput('');
    setReason(`I want to ${template.description.toLowerCase()}`);
    setStep(2);
  };

  // Handle custom goal creation
  const handleCreateCustom = () => {
    setSelectedTemplate(null);
    setSelectedCategory('custom');
    setGoalName('');
    setGoalTarget('');
    setReason('');
    setStep(2);
  };

  const handleSubmit = () => {
    if (selectedCategory && goalName && startDate) {
      onSuccess?.({
        category: selectedCategory,
        emoji: getCategoryEmoji(selectedCategory),
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
    setSelectedTemplate(null);
    setGoalName("");
    setGoalTarget("");
    setCustomInput("");
    setStartDate('2026-01-01');
    setDeadline('2026-12-31');
    setReason("");
    setFrequency('daily');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const daysToAchieve = getDaysBetween(startDate, deadline);
  const canProceed = goalName.trim() && startDate && deadline && daysToAchieve > 0;
  const breakdownPreview = goalTarget ? getBreakdownPreview(goalTarget, daysToAchieve, frequency) : '';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-w-[100vw] h-[100dvh] sm:h-auto sm:max-h-[85vh] overflow-hidden bg-card border-border p-0 rounded-none sm:rounded-lg">
        <div className="flex flex-col h-full sm:max-h-[85vh]">
          {/* Fixed Header */}
          <div className="p-3 sm:p-4 pb-2 sm:pb-3 border-b border-border shrink-0">
            <DialogHeader>
              <DialogDescription className="sr-only">
                Create a new goal by selecting a template and setting your timeline and frequency.
              </DialogDescription>
              <div className="flex items-center gap-2 sm:gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(step - 1)}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    {step === 1 ? "Choose Your Goal" : "Customize Your Goal"}
                  </DialogTitle>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {step === 1 
                      ? "Pick from popular goals or create your own" 
                      : config?.examples || "Set your goal details"
                    }
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[1, 2].map((s) => (
                    <div 
                      key={s}
                      className={cn(
                        "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors",
                        s <= step ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {/* Step 1: Template Selection */}
            {step === 1 && (
              <SmartGoalTemplates
                onSelectTemplate={handleTemplateSelect}
                onCreateCustom={handleCreateCustom}
              />
            )}

            {/* Step 2: Goal Details */}
            {step === 2 && config && (
              <div className="space-y-4">
                {/* Selected Template/Category Header */}
                {selectedTemplate ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0">
                      <selectedTemplate.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{selectedTemplate.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Trophy className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">{formatParticipants(selectedTemplate.participants)} crushing it</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
                    <span className="text-2xl">{config.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.examples}</p>
                    </div>
                  </div>
                )}

                {/* Goal Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="goalName" className="text-sm flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    What's your specific goal?
                  </Label>
                  <Input
                    id="goalName"
                    placeholder={selectedTemplate ? selectedTemplate.name : `e.g., ${config.examples.split(',')[0].trim()}`}
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-secondary border-border h-10"
                  />
                </div>

                {/* Target (for measured template goals only) */}
                {selectedTemplate?.smartType === 'measured' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="goalTarget" className="text-sm">
                      {selectedTemplate.targetLabel || 'Your target'}
                    </Label>
                    <div className="relative">
                      {selectedTemplate && !selectedTemplate.targetSuffix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                      )}
                      <Input
                        id="goalTarget"
                        type="number"
                        placeholder={selectedTemplate.targetPlaceholder || '0'}
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        className={cn(
                          "bg-secondary border-border h-10",
                          !selectedTemplate.targetSuffix && "pl-8"
                        )}
                      />
                      {selectedTemplate.targetSuffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {selectedTemplate.targetSuffix}
                        </span>
                      )}
                    </div>
                    {breakdownPreview && (
                      <p className="text-xs text-success font-medium">→ {breakdownPreview}</p>
                    )}
                  </div>
                )}

                {/* Simple task description for custom goals */}
                {!selectedTemplate && (
                  <div className="space-y-1.5">
                    <Label htmlFor="taskDescription" className="text-sm">
                      What will you do each {frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'}?
                    </Label>
                    <Input
                      id="taskDescription"
                      placeholder="e.g., Brush teeth twice, Go to gym, Read for 30 mins"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="bg-secondary border-border h-10"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      This is what your {frequency} reminder will say
                    </p>
                  </div>
                )}

                {/* Custom Input (for templates like "Learn a Language") */}
                {selectedTemplate?.customInputLabel && (
                  <div className="space-y-1.5">
                    <Label htmlFor="customInput" className="text-sm">
                      {selectedTemplate.customInputLabel}
                    </Label>
                    <Input
                      id="customInput"
                      placeholder={selectedTemplate.customInputPlaceholder || "Enter details..."}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="bg-secondary border-border h-10"
                    />
                  </div>
                )}

                {/* Date Selection */}
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Timeline</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-secondary border-border h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Input
                        type="date"
                        value={deadline}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-secondary border-border h-9 text-sm"
                      />
                    </div>
                  </div>

                  {daysToAchieve > 0 && (
                    <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-success/10 border border-success/30">
                      <Calendar className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs font-medium text-success">
                        {daysToAchieve} days to achieve!
                      </span>
                    </div>
                  )}
                </div>

                {/* Frequency Selection */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    How often do you want tasks?
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {taskFrequencies.map((freq) => (
                      <button
                        key={freq.id}
                        type="button"
                        onClick={() => setFrequency(freq.id)}
                        className={cn(
                          "p-2 rounded-lg border transition-all text-center",
                          frequency === freq.id
                            ? "bg-primary/20 border-primary/50 text-primary"
                            : "bg-muted/30 border-border hover:border-primary/30"
                        )}
                      >
                        <p className="font-medium text-xs">{freq.label}</p>
                        <p className="text-[10px] text-muted-foreground">{freq.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {selectedTemplate?.tips && selectedTemplate.tips.length > 0 && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Pro Tips
                    </p>
                    <ul className="space-y-0.5">
                      {selectedTemplate.tips.slice(0, 2).map((tip, i) => (
                        <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why (optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Why does this matter? <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="This motivates you on tough days..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-secondary border-border min-h-[60px] text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {step === 2 && (
            <div className="p-4 pt-3 border-t border-border shrink-0">
              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!canProceed}
              >
                <Target className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
