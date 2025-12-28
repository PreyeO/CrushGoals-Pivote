import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, DollarSign, BookOpen, Briefcase, Heart, 
  Palette, Brain, Plane, Edit3, ChevronLeft, ChevronRight,
  Target, Calendar, Sparkles, CalendarDays, Zap, LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TemplateBrowser, GoalTemplateDB } from "./TemplateBrowser";
import { ClarifyingQuestions, ClarifyingQuestion } from "./ClarifyingQuestions";
import { GoalBreakdownPreview, Phase } from "./GoalBreakdownPreview";
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
  goal_metadata?: Record<string, any>;
  phases?: Phase[];
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
  clarifyingQuestions: ClarifyingQuestion[];
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
    clarifyingQuestions: [
      { id: "starting_point", question: "What's your starting point?", type: "text", placeholder: "Current weight, fitness level, or baseline..." },
      { id: "target", question: "What's your specific target?", type: "text", placeholder: "e.g., Lose 10kg, Run 5K, Do 50 pushups..." },
      { id: "workout_frequency", question: "How many days per week can you work out?", type: "select", options: ["2 days", "3 days", "4 days", "5+ days"] },
      { id: "motivation", question: "Why is this important to you?", type: "text", placeholder: "What's driving this goal?" },
    ],
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
    clarifyingQuestions: [
      { id: "current_amount", question: "How much do you currently have saved?", type: "number", unit: "₦", placeholder: "Current savings amount" },
      { id: "target_amount", question: "What's your target amount?", type: "number", unit: "₦", placeholder: "Your goal amount" },
      { id: "motivation", question: "What's this money for?", type: "text", placeholder: "Emergency fund, vacation, house..." },
    ],
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
    clarifyingQuestions: [
      { id: "current_level", question: "What's your current skill level?", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
      { id: "target_outcome", question: "What specific outcome do you want?", type: "text", placeholder: "Certification, fluency, project completion..." },
      { id: "daily_time", question: "How much time can you dedicate daily?", type: "select", options: ["15 minutes", "30 minutes", "1 hour", "2+ hours"] },
      { id: "motivation", question: "Why do you want to learn this?", type: "text", placeholder: "Career growth, personal interest..." },
    ],
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
    clarifyingQuestions: [
      { id: "current_situation", question: "What's your current role or situation?", type: "text", placeholder: "Your current job title or status..." },
      { id: "desired_outcome", question: "What's your desired outcome?", type: "text", placeholder: "Promotion, new job, business launch..." },
      { id: "timeline", question: "What timeline are you working with?", type: "select", options: ["3 months", "6 months", "1 year", "Flexible"] },
      { id: "motivation", question: "Why is this career move important to you?", type: "text", placeholder: "Growth, income, impact..." },
    ],
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
    clarifyingQuestions: [
      { id: "focus_area", question: "What relationship area do you want to focus on?", type: "select", options: ["Family", "Partner", "Friends", "Networking"] },
      { id: "current_state", question: "How would you describe your current situation?", type: "text", placeholder: "What needs improvement..." },
      { id: "motivation", question: "Why is this important to you right now?", type: "text", placeholder: "What prompted this goal..." },
    ],
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
    clarifyingQuestions: [
      { id: "project_type", question: "What are you creating?", type: "text", placeholder: "Book, art series, podcast, album..." },
      { id: "experience_level", question: "How much have you created before?", type: "select", options: ["First time", "Some experience", "Experienced creator"] },
      { id: "daily_time", question: "How much time can you dedicate daily?", type: "select", options: ["30 minutes", "1 hour", "2 hours", "3+ hours"] },
      { id: "motivation", question: "Why do you want to create this?", type: "text", placeholder: "What story do you want to tell..." },
    ],
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
    clarifyingQuestions: [
      { id: "focus_area", question: "What aspect of wellness do you want to improve?", type: "select", options: ["Sleep", "Stress", "Meditation", "Mental clarity"] },
      { id: "current_habit", question: "Do you have any existing wellness practices?", type: "text", placeholder: "What do you already do..." },
      { id: "motivation", question: "What would better wellness mean for you?", type: "text", placeholder: "More energy, peace of mind..." },
    ],
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
    clarifyingQuestions: [
      { id: "travel_type", question: "What kind of travel interests you?", type: "select", options: ["International", "Local adventures", "Road trips", "Weekend getaways"] },
      { id: "budget", question: "What's your travel budget?", type: "text", placeholder: "Flexible, moderate, luxury..." },
      { id: "motivation", question: "Why is travel important to you?", type: "text", placeholder: "Adventure, culture, relaxation..." },
    ],
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
    clarifyingQuestions: [
      { id: "starting_point", question: "Where are you starting from?", type: "text", placeholder: "Your current situation..." },
      { id: "target", question: "What's your specific target?", type: "text", placeholder: "What does success look like..." },
      { id: "motivation", question: "Why is this goal important to you?", type: "text", placeholder: "Your deeper motivation..." },
    ],
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

// Generate default phases for custom goals
const generateDefaultPhases = (goalName: string, duration: number): Phase[] => {
  const weeksTotal = Math.ceil(duration / 7);
  const phase1Weeks = Math.ceil(weeksTotal * 0.33);
  const phase2Weeks = Math.ceil(weeksTotal * 0.33);
  const phase3Weeks = weeksTotal - phase1Weeks - phase2Weeks;
  
  return [
    {
      name: "Foundation",
      weeks: `1-${phase1Weeks}`,
      description: "Build your foundation and establish habits",
      milestones: ["Set up tracking", "Complete first week", "Build momentum"],
      target: "Get started",
      badge: "🌱",
    },
    {
      name: "Progress",
      weeks: `${phase1Weeks + 1}-${phase1Weeks + phase2Weeks}`,
      description: "Build on your foundation and see progress",
      milestones: ["Hit 50% progress", "Refine your approach", "Stay consistent"],
      target: "50% complete",
      badge: "📈",
    },
    {
      name: "Achievement",
      weeks: `${phase1Weeks + phase2Weeks + 1}-${weeksTotal}`,
      description: "Push to the finish line",
      milestones: ["Final push", "Complete goal", "Celebrate!"],
      target: "100% complete",
      badge: "🏆",
    },
  ];
};

const taskFrequencies = [
  { id: 'daily', label: 'Daily', desc: 'Every day' },
  { id: 'weekly', label: 'Weekly', desc: 'Once a week' },
  { id: 'monthly', label: 'Monthly', desc: 'Once a month' },
] as const;

type Step = 'browse' | 'category' | 'details' | 'clarify' | 'preview';

export function AddGoalModal({ open, onOpenChange, onSuccess }: AddGoalModalProps) {
  const [step, setStep] = useState<Step>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplateDB | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = selectedCategory ? categoryConfig[selectedCategory] : null;
  const daysToAchieve = getDaysBetween(startDate, deadline);

  // Get current phases
  const getCurrentPhases = (): Phase[] => {
    if (selectedTemplate?.template_phases) {
      return selectedTemplate.template_phases as Phase[];
    }
    if (daysToAchieve > 0 && goalName) {
      return generateDefaultPhases(goalName, daysToAchieve);
    }
    return [];
  };

  // Get current clarifying questions
  const getCurrentQuestions = (): ClarifyingQuestion[] => {
    if (selectedTemplate?.clarifying_questions) {
      return selectedTemplate.clarifying_questions as ClarifyingQuestion[];
    }
    return config?.clarifyingQuestions || [];
  };

  const handleTemplateSelect = (template: GoalTemplateDB) => {
    setSelectedTemplate(template);
    setSelectedCategory(template.category);
    setGoalName(template.name);
    const start = new Date();
    const end = addDays(start, template.default_duration_days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setDeadline(format(end, 'yyyy-MM-dd'));
    setClarifyingAnswers({});
    setStep('clarify');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTemplate(null);
    setClarifyingAnswers({});
    setStep('details');
  };

  const handleDetailsComplete = () => {
    if (goalName && startDate && deadline && daysToAchieve > 0) {
      setStep('clarify');
    }
  };

  const handleClarifyComplete = () => {
    setStep('preview');
  };

  const handleEditPlan = () => {
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !goalName || !startDate || !config) return;
    
    setIsSubmitting(true);
    
    try {
      const goalData: GoalData = {
        category: selectedCategory,
        emoji: selectedTemplate?.emoji || config.emoji,
        name: goalName,
        target: goalTarget,
        startDate,
        deadline,
        reason: clarifyingAnswers.motivation || reason,
        frequency,
        goal_metadata: {
          ...clarifyingAnswers,
          template_id: selectedTemplate?.id,
          template_name: selectedTemplate?.name,
        },
        phases: getCurrentPhases(),
      };
      
      await onSuccess?.(goalData);
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('browse');
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setGoalName("");
    setGoalTarget("");
    setStartDate(new Date().toISOString().split('T')[0]);
    setDeadline("");
    setReason("");
    setFrequency('daily');
    setClarifyingAnswers({});
    setIsSubmitting(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'browse': return "Choose Your Goal 🎯";
      case 'category': return "Pick a Category";
      case 'details': return "Define Your Goal";
      case 'clarify': return "Let's Personalize This";
      case 'preview': return "Your Success Roadmap";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'browse': return "Pick a proven template or create your own";
      case 'category': return "What area of life do you want to improve?";
      case 'details': return config?.examples || "Set your goal details";
      case 'clarify': return "A few quick questions to personalize your plan";
      case 'preview': return "Here's your personalized plan";
    }
  };

  const canGoBack = step !== 'browse';

  const handleBack = () => {
    switch (step) {
      case 'category': setStep('browse'); break;
      case 'details': 
        if (selectedTemplate) {
          setStep('browse');
          setSelectedTemplate(null);
        } else {
          setStep('category');
        }
        break;
      case 'clarify': setStep('details'); break;
      case 'preview': setStep('clarify'); break;
    }
  };

  const stepIndex = ['browse', 'category', 'details', 'clarify', 'preview'].indexOf(step);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-white/10 backdrop-blur-xl p-0">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <button 
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold">
                  {getStepTitle()}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {getStepDescription()}
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((s) => (
                  <div 
                    key={s}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      s <= stepIndex ? "bg-primary" : "bg-white/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {/* Browse Templates Step */}
            {step === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TemplateBrowser
                  onSelectTemplate={handleTemplateSelect}
                  onCreateCustom={() => setStep('category')}
                />
              </motion.div>
            )}

            {/* Category Selection Step */}
            {step === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3"
              >
                {goalCategories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "p-3 sm:p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left group"
                    )}
                  >
                    <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 block">{category.emoji}</span>
                    <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">{category.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{category.examples}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Goal Details Step */}
            {step === 'details' && config && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30">
                  <span className="text-3xl">{selectedTemplate?.emoji || config.emoji}</span>
                  <div>
                    <p className="font-medium">{selectedTemplate?.name || config.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate?.description || config.examples}
                    </p>
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
                </div>

                {/* Task Frequency */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    How often should tasks appear?
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {taskFrequencies.map((freq) => (
                      <button
                        key={freq.id}
                        onClick={() => setFrequency(freq.id)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          frequency === freq.id
                            ? "bg-primary/20 border-primary/50"
                            : "bg-white/5 border-white/10 hover:border-white/30"
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

                <Button
                  onClick={handleDetailsComplete}
                  disabled={!goalName || !startDate || !deadline || daysToAchieve <= 0}
                  className="w-full h-12 gap-2"
                >
                  Continue to Personalization
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Clarifying Questions Step */}
            {step === 'clarify' && (
              <motion.div
                key="clarify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ClarifyingQuestions
                  questions={getCurrentQuestions()}
                  answers={clarifyingAnswers}
                  onAnswer={(id, value) => setClarifyingAnswers(prev => ({ ...prev, [id]: value }))}
                  onComplete={handleClarifyComplete}
                  category={selectedCategory || 'custom'}
                />
              </motion.div>
            )}

            {/* Preview Step */}
            {step === 'preview' && config && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <GoalBreakdownPreview
                  goalName={goalName}
                  emoji={selectedTemplate?.emoji || config.emoji}
                  category={selectedCategory || 'custom'}
                  phases={getCurrentPhases()}
                  duration={daysToAchieve}
                  dailyCommitment={`Complete 2-3 tasks per ${frequency === 'daily' ? 'day' : frequency === 'weekly' ? 'week' : 'month'} (15-30 min total)`}
                  successRate={selectedTemplate?.success_rate || 85}
                  onEdit={handleEditPlan}
                  onConfirm={handleSubmit}
                  isLoading={isSubmitting}
                  answers={clarifyingAnswers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
