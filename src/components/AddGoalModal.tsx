import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Calendar,
  Sparkles,
  CalendarDays,
  Dumbbell,
  DollarSign,
  BookOpen,
  Briefcase,
  Heart,
  Palette,
  Brain,
  Edit3,
  TrendingUp,
  Users,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartGoalTemplates, PopularGoalTemplate } from "./SmartGoalTemplates";
import { goalCategories } from "@/constants/goalCategories";
import { addDays, format } from "date-fns";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { TrialExpiredOverlay } from "@/components/TrialExpiredOverlay";
import { useIsMobile } from "@/hooks/use-mobile";

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
  frequency: "daily" | "weekly" | "monthly";
}

// Category-specific config for custom goals
const categoryConfig: Record<
  string,
  {
    label: string;
    emoji: string;
    icon: any;
    examples: string;
    frequencyTip: string;
  }
> = {
  custom: {
    label: "Custom Goal",
    emoji: "✏️",
    icon: Edit3,
    examples: "Create your own unique goal",
    frequencyTip: "Choose based on your goal type.",
  },
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
  "side-hustle": {
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
  "mental-health": {
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
  frequency: "daily" | "weekly" | "monthly"
): string => {
  if (!targetValue || days <= 0) return "";

  const match = targetValue.match(/^\$?₦?(\d+(?:,\d{3})*(?:\.\d+)?)\s*(.*)$/);
  if (!match) return "";

  const value = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2].trim() || "units";

  let periodsCount: number;
  let periodLabel: string;

  switch (frequency) {
    case "daily":
      periodsCount = days;
      periodLabel = "day";
      break;
    case "weekly":
      periodsCount = Math.ceil(days / 7);
      periodLabel = "week";
      break;
    case "monthly":
      periodsCount = Math.ceil(days / 30);
      periodLabel = "month";
      break;
  }

  const perPeriod = value / periodsCount;
  const displayValue = perPeriod % 1 === 0 ? perPeriod : perPeriod.toFixed(1);

  const isCurrency = targetValue.startsWith("$") || targetValue.startsWith("₦");
  const currencySymbol = targetValue.startsWith("$") ? "$" : "₦";

  if (isCurrency) {
    return `${currencySymbol}${Number(
      displayValue
    ).toLocaleString()} per ${periodLabel}`;
  }

  return `${displayValue} ${unit} per ${periodLabel}`;
};

const taskFrequencies = [
  { id: "daily", label: "Daily", desc: "Every day" },
  { id: "weekly", label: "Weekly", desc: "Once a week" },
  { id: "monthly", label: "Monthly", desc: "Once a month" },
] as const;

// Get emoji for category
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    fitness: "💪",
    finance: "💰",
    learning: "📚",
    career: "🚀",
    "side-hustle": "💼",
    spiritual: "🙏",
    "mental-health": "🧠",
    relationship: "❤️",
    content: "🎬",
    lifestyle: "✨",
    custom: "✏️",
  };
  return emojiMap[category] || "🎯";
};

const formatParticipants = (count: number) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export function AddGoalModal({
  open,
  onOpenChange,
  onSuccess,
}: AddGoalModalProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PopularGoalTemplate | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [customInput, setCustomInput] = useState("");
  // Default to today and 30 days from now
  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
  const [deadline, setDeadline] = useState(
    format(addDays(today, 30), "yyyy-MM-dd")
  );
  const [reason, setReason] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const { canPerformActions } = useTrialStatus();

  const config = selectedCategory
    ? categoryConfig[selectedCategory] || categoryConfig.custom
    : null;

  // Handle template selection from SmartGoalTemplates
  const handleTemplateSelect = (template: PopularGoalTemplate) => {
    setSelectedTemplate(template);
    setSelectedCategory(template.category);
    setGoalName(template.name);
    setFrequency(template.frequency);

    // Use template's default duration instead of hardcoded 365
    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];
    const endDate = addDays(today, template.defaultDuration);
    const endDateStr = format(endDate, "yyyy-MM-dd");

    setStartDate(startDateStr);
    setDeadline(endDateStr);
    setGoalTarget("");
    setCustomInput("");
    setReason(`I want to ${template.description.toLowerCase()}`);
    setStep(3);
  };

  // Handle custom goal creation
  const handleCreateCustom = () => {
    setSelectedTemplate(null);
    setSelectedCategory("custom");
    setGoalName("");
    setGoalTarget("");
    setReason("");
    setStep(3);
  };

  const handleSubmit = () => {
    // Check trial status before allowing action
    if (!canPerformActions) {
      setShowTrialExpired(true);
      return;
    }

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
    setStep(0);
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setGoalName("");
    setGoalTarget("");
    setCustomInput("");
    // Reset to today + 30 days
    const now = new Date();
    setStartDate(now.toISOString().split("T")[0]);
    setDeadline(format(addDays(now, 30), "yyyy-MM-dd"));
    setReason("");
    setFrequency("daily");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const daysToAchieve = getDaysBetween(startDate, deadline);
  const canProceed =
    goalName.trim() && startDate && deadline && daysToAchieve > 0;
  const breakdownPreview = goalTarget
    ? getBreakdownPreview(goalTarget, daysToAchieve, frequency)
    : "";

  // Content is the same for both Sheet and Dialog, just the wrapper differs
  const modalContent = (
    <>
      <div className="flex flex-col h-full sm:max-h-[85vh]">
        {/* Fixed Header */}
        <div className="p-3 sm:p-4 pb-2 sm:pb-3 border-b border-border shrink-0">
          {isMobile ? (
            <SheetHeader>
              <SheetDescription className="sr-only">
                Create a new goal by selecting a template and setting your
                timeline and frequency.
              </SheetDescription>
              <div className="flex items-center gap-2 sm:gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-base sm:text-lg font-bold">
                    {step === 0
                      ? "Start Crushing 2026"
                      : step === 1
                      ? "Choose Category"
                      : step === 2
                      ? "Choose Your Goal"
                      : "Customize Your Goal"}
                  </SheetTitle>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {step === 0
                      ? "Choose how you'd like to create your goal"
                      : step === 1
                      ? "Select a category for your personal goal"
                      : step === 2
                      ? "Pick from popular goals or create your own"
                      : config?.examples || "Set your goal details"}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[0, 1, 2, 3].map((s) => (
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
            </SheetHeader>
          ) : (
            <DialogHeader>
              <DialogDescription className="sr-only">
                Create a new goal by selecting a template and setting your
                timeline and frequency.
              </DialogDescription>
              <div className="flex items-center gap-2 sm:gap-3">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    {step === 0
                      ? "Start Crushing 2026"
                      : step === 1
                      ? "Choose Category"
                      : step === 2
                      ? "Choose Your Goal"
                      : "Customize Your Goal"}
                  </DialogTitle>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                    {step === 0
                      ? "Choose how you'd like to create your goal"
                      : step === 1
                      ? "Select a category for your personal goal"
                      : step === 2
                      ? "Pick from popular goals or create your own"
                      : config?.examples || "Set your goal details"}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {[0, 1, 2, 3].map((s) => (
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
          )}
        </div>

        {/* Scrollable Content - min-h-0 enables flex shrink for proper scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
            {/* Step 0: Choose Goal Type */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Set a Personal Goal */}
                  <button
                    onClick={() => setStep(1)}
                    className="p-4 rounded-xl border-2 border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Target className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">
                        🎯 Set a Personal Goal
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Define what you want to achieve this year
                    </p>
                  </button>

                  {/* Join a Challenge */}
                  <button
                    onClick={() => setStep(2)}
                    className="p-4 rounded-xl border-2 border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">
                        🏆 Join a Challenge
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Compete with others in popular challenges
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Custom Goal Categories */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedCategory(key);
                          setSelectedTemplate(null);
                          setGoalName("");
                          setGoalTarget("");
                          setCustomInput("");
                          setReason("");
                          setFrequency("daily");
                          setStep(3);
                        }}
                        className="p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{config.emoji}</span>
                          <span className="text-sm font-medium">
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {config.examples}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Template Selection */}
            {step === 2 && (
              <SmartGoalTemplates
                onSelectTemplate={(template) => {
                  handleTemplateSelect(template);
                  setStep(3);
                }}
                onCreateCustom={() => {
                  setStep(1);
                }}
              />
            )}

            {/* Step 3: Goal Details */}
            {step === 3 && config && (
              <div className="space-y-4">
                {/* Selected Template/Category Header */}
                {selectedTemplate ? (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
                      <selectedTemplate.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">
                        {selectedTemplate.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Trophy className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">
                          {formatParticipants(selectedTemplate.participants)}{" "}
                          crushing it
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <span className="text-2xl">{config.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.examples}
                      </p>
                    </div>
                  </div>
                )}

                {/* Goal Name - More relatable label */}
                <div className="space-y-2">
                  <Label
                    htmlFor="goalName"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-primary" />
                    What do you want to achieve?
                  </Label>
                  <Input
                    id="goalName"
                    placeholder={
                      selectedTemplate
                        ? selectedTemplate.name
                        : `e.g., ${config.examples.split(",")[0].trim()}`
                    }
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-secondary/50 border-border h-11 rounded-xl text-sm"
                  />
                </div>

                {/* Frequency Selection - MOVED BEFORE task description */}
                {!selectedTemplate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      How often will you work on this?
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {taskFrequencies.map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setFrequency(freq.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            frequency === freq.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          <p className="text-sm font-medium">{freq.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {freq.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target (for measured template goals only) */}
                {selectedTemplate?.smartType === "measured" && (
                  <div className="space-y-2">
                    <Label htmlFor="goalTarget" className="text-sm font-medium">
                      {selectedTemplate.targetLabel || "Your target"}
                    </Label>
                    <div className="relative">
                      {selectedTemplate && !selectedTemplate.targetSuffix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          ₦
                        </span>
                      )}
                      <Input
                        id="goalTarget"
                        type="number"
                        placeholder={selectedTemplate.targetPlaceholder || "0"}
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        className={cn(
                          "bg-secondary/50 border-border h-11 rounded-xl",
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
                      <p className="text-xs text-success font-medium">
                        → {breakdownPreview}
                      </p>
                    )}
                  </div>
                )}

                {/* Daily action description for custom goals - AFTER frequency */}
                {!selectedTemplate && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="taskDescription"
                      className="text-sm font-medium"
                    >
                      What's your{" "}
                      {frequency === "daily"
                        ? "daily"
                        : frequency === "weekly"
                        ? "weekly"
                        : "monthly"}{" "}
                      action?
                    </Label>
                    <Input
                      id="taskDescription"
                      placeholder={`e.g., Read for 30 mins, Go to gym, Save ₦5000`}
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="bg-secondary/50 border-border h-11 rounded-xl text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      This will be your {frequency} reminder
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
                      placeholder={
                        selectedTemplate.customInputPlaceholder ||
                        "Enter details..."
                      }
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="bg-secondary border-border h-10"
                    />
                  </div>
                )}

                {/* Date Selection - Premium Design */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Timeline</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-background/50 border-border h-10 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={deadline}
                        min={
                          startDate || new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-background/50 border-border h-10 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {daysToAchieve > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-2xl font-bold text-primary">
                        {daysToAchieve}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        days to crush it
                      </span>
                    </div>
                  )}
                </div>

                {/* Frequency Selection - Only for templates (custom goals have this earlier) */}
                {selectedTemplate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Task frequency
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {taskFrequencies.map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setFrequency(freq.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            frequency === freq.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border bg-secondary/50 hover:bg-secondary"
                          )}
                        >
                          <p className="text-sm font-medium">{freq.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {freq.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selectedTemplate?.tips && selectedTemplate.tips.length > 0 && (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-primary" />
                      Pro Tips
                    </p>
                    <ul className="space-y-0.5">
                      {selectedTemplate.tips.slice(0, 2).map((tip, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                        >
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why - Optional */}
                <div className="space-y-2">
                  <Label
                    htmlFor="reason"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-premium" />
                    Why does this matter?
                    <span className="text-xs text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="This will keep you motivated on hard days..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-secondary/50 border-border min-h-[60px] resize-none rounded-xl text-sm"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer - Premium Button */}
          {step === 3 && (
            <div className="p-4 pt-3 border-t border-border shrink-0">
              <Button
                variant="hero"
                size="lg"
                className="w-full h-12 font-semibold text-base rounded-xl shadow-lg"
                onClick={handleSubmit}
                disabled={!canProceed}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Challenge
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
    </>
  );

  if (isMobile) {
    // For mobile, show a native-style action sheet for step 0
    if (step === 0) {
      return (
        <Sheet open={open} onOpenChange={handleClose}>
          <SheetContent 
            side="bottom" 
            className="h-auto max-h-[50vh] bg-card/95 backdrop-blur-xl border-t border-border/50 p-0 rounded-t-3xl pb-6 [&>button]:hidden"
          >
            {/* Mobile Action Sheet Style - No header, just actions */}
            <div className="px-4 pt-3 pb-2">
              {/* Drag handle */}
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              
              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-full p-4 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/50 transition-all text-left active:scale-[0.98] active:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-semibold mb-0.5">🎯 Set a Personal Goal</p>
                      <p className="text-xs text-muted-foreground">
                        Define what you want to achieve
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full p-4 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background hover:border-primary/50 transition-all text-left active:scale-[0.98] active:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-base font-semibold mb-0.5">🏆 Join a Challenge</p>
                      <p className="text-xs text-muted-foreground">
                        Compete with others in popular challenges
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </SheetContent>
          <TrialExpiredOverlay
            open={showTrialExpired}
            onOpenChange={setShowTrialExpired}
          />
        </Sheet>
      );
    }
    
    // For subsequent steps, show mobile-native sheet
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent 
          side="bottom" 
          className="h-[95vh] max-h-[95vh] overflow-hidden bg-card border-border p-0 rounded-t-3xl flex flex-col [&>button]:hidden"
        >
          {/* Mobile-native header - minimal and clean */}
          <div className="px-4 pt-3 pb-2 border-b border-border/50 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 -ml-2 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {step === 1
                    ? "Choose Category"
                    : step === 2
                    ? "Choose Challenge"
                    : "Create Goal"}
                </h2>
              </div>
            </div>
            {/* Drag handle */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
          </div>

          {/* Mobile-native content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6">
            {/* Step 1: Categories - Mobile native list */}
            {step === 1 && (
              <div className="space-y-2">
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key);
                        setSelectedTemplate(null);
                        setGoalName("");
                        setGoalTarget("");
                        setCustomInput("");
                        setReason("");
                        setFrequency("daily");
                        setStep(3);
                      }}
                      className="w-full p-4 rounded-2xl border border-border/50 bg-background/80 hover:bg-background hover:border-primary/50 transition-all text-left active:scale-[0.98] active:bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{config.emoji}</span>
                            <span className="text-base font-semibold">
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {config.examples}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Challenge Templates */}
            {step === 2 && (
              <div className="pb-4">
                <SmartGoalTemplates
                  onSelectTemplate={(template) => {
                    handleTemplateSelect(template);
                    setStep(3);
                  }}
                  onCreateCustom={() => {
                    setStep(1);
                  }}
                />
              </div>
            )}

            {/* Step 3: Goal Details Form - Mobile native */}
            {step === 3 && config && (
              <div className="space-y-5 pb-4">
                {/* Selected Category/Template Header - Simplified */}
                {selectedTemplate ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary shrink-0">
                      <selectedTemplate.icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base truncate">
                        {selectedTemplate.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Trophy className="w-4 h-4 text-success" />
                        <span className="text-xs text-success">
                          {formatParticipants(selectedTemplate.participants)} crushing it
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                    <span className="text-3xl">{config.emoji}</span>
                    <div>
                      <p className="font-semibold text-base">{config.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.examples}
                      </p>
                    </div>
                  </div>
                )}

                {/* Goal Name */}
                <div className="space-y-2">
                  <Label htmlFor="goalName-mobile" className="text-base font-medium">
                    What do you want to achieve?
                  </Label>
                  <Input
                    id="goalName-mobile"
                    placeholder={
                      selectedTemplate
                        ? selectedTemplate.name
                        : `e.g., ${config.examples.split(",")[0].trim()}`
                    }
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="bg-background border-border h-12 rounded-xl text-base"
                  />
                </div>

                {/* Frequency Selection - For custom goals */}
                {!selectedTemplate && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      How often?
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {taskFrequencies.map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setFrequency(freq.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all active:scale-[0.96]",
                            frequency === freq.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border/50 bg-background/80 hover:bg-background"
                          )}
                        >
                          <p className="text-sm font-semibold">{freq.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {freq.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target (for measured template goals) */}
                {selectedTemplate?.smartType === "measured" && (
                  <div className="space-y-2">
                    <Label htmlFor="goalTarget-mobile" className="text-base font-medium">
                      {selectedTemplate.targetLabel || "Your target"}
                    </Label>
                    <div className="relative">
                      {selectedTemplate && !selectedTemplate.targetSuffix && (
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                          ₦
                        </span>
                      )}
                      <Input
                        id="goalTarget-mobile"
                        type="number"
                        placeholder={selectedTemplate.targetPlaceholder || "0"}
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        className={cn(
                          "bg-background border-border h-12 rounded-xl text-base",
                          !selectedTemplate.targetSuffix && "pl-10"
                        )}
                      />
                      {selectedTemplate.targetSuffix && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
                          {selectedTemplate.targetSuffix}
                        </span>
                      )}
                    </div>
                    {breakdownPreview && (
                      <p className="text-sm text-success font-medium">
                        → {breakdownPreview}
                      </p>
                    )}
                  </div>
                )}

                {/* Daily action description for custom goals */}
                {!selectedTemplate && (
                  <div className="space-y-2">
                    <Label htmlFor="taskDescription-mobile" className="text-base font-medium">
                      What's your {frequency === "daily" ? "daily" : frequency === "weekly" ? "weekly" : "monthly"} action?
                    </Label>
                    <Input
                      id="taskDescription-mobile"
                      placeholder="e.g., Read for 30 mins, Go to gym, Save ₦5000"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="bg-background border-border h-12 rounded-xl text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be your {frequency} reminder
                    </p>
                  </div>
                )}

                {/* Custom Input (for templates like "Learn a Language") */}
                {selectedTemplate?.customInputLabel && (
                  <div className="space-y-2">
                    <Label htmlFor="customInput-mobile" className="text-base font-medium">
                      {selectedTemplate.customInputLabel}
                    </Label>
                    <Input
                      id="customInput-mobile"
                      placeholder={selectedTemplate.customInputPlaceholder || "Enter details..."}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="bg-background border-border h-12 rounded-xl text-base"
                    />
                  </div>
                )}

                {/* Date Selection - Simplified for mobile */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base">Timeline</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-background border-border h-11 text-sm rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">End Date</Label>
                      <Input
                        type="date"
                        value={deadline}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-background border-border h-11 text-sm rounded-xl"
                      />
                    </div>
                  </div>

                  {daysToAchieve > 0 && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-3xl font-bold text-primary">
                        {daysToAchieve}
                      </span>
                      <span className="text-base text-muted-foreground">
                        days to crush it
                      </span>
                    </div>
                  )}
                </div>

                {/* Frequency Selection - For templates */}
                {selectedTemplate && (
                  <div className="space-y-3">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Task frequency
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {taskFrequencies.map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setFrequency(freq.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all active:scale-[0.96]",
                            frequency === freq.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border/50 bg-background/80 hover:bg-background"
                          )}
                        >
                          <p className="text-sm font-semibold">{freq.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {freq.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selectedTemplate?.tips && selectedTemplate.tips.length > 0 && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Pro Tips
                    </p>
                    <ul className="space-y-1">
                      {selectedTemplate.tips.slice(0, 2).map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why - Optional */}
                <div className="space-y-2">
                  <Label htmlFor="reason-mobile" className="text-base font-medium flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-premium" />
                    Why does this matter?
                    <span className="text-sm text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="reason-mobile"
                    placeholder="This will keep you motivated on hard days..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-background border-border min-h-[80px] resize-none rounded-xl text-base"
                    rows={3}
                  />
                </div>

                {/* Submit Button - Fixed at bottom */}
                <div className="pt-4 pb-2">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full h-14 font-semibold text-lg rounded-2xl shadow-lg"
                    onClick={handleSubmit}
                    disabled={!canProceed}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Challenge
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
        <TrialExpiredOverlay
          open={showTrialExpired}
          onOpenChange={setShowTrialExpired}
        />
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-full max-w-[100vw] h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-hidden bg-card border-border p-0 rounded-none sm:rounded-lg flex flex-col">
        {modalContent}
      </DialogContent>
      <TrialExpiredOverlay
        open={showTrialExpired}
        onOpenChange={setShowTrialExpired}
      />
    </Dialog>
  );
}
