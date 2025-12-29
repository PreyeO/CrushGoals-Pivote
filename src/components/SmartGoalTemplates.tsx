import { useState } from "react";
import { 
  Briefcase, DollarSign, BookOpen, Sparkles, Heart, 
  Dumbbell, TrendingUp, Palette, Users, Brain, 
  Target, Scale, Flame, GraduationCap, Wallet,
  Rocket, Handshake, PenTool, Calendar, Music,
  Mic, Globe, Zap, Trophy, ArrowRight, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

// Popular goal template with participant counts
export interface PopularGoalTemplate {
  id: string;
  name: string;
  icon: any;
  category: string;
  description: string;
  participants: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  defaultDuration: number;
  smartType: 'simple' | 'measured' | 'habit';
  targetLabel?: string;
  targetPlaceholder?: string;
  targetSuffix?: string;
  tips: string[];
}

// Category definitions
export const goalCategories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'side-hustle', label: 'Side Hustle', icon: TrendingUp },
  { id: 'spiritual', label: 'Spiritual', icon: Sparkles },
  { id: 'mental-health', label: 'Wellness', icon: Brain },
  { id: 'relationship', label: 'Relationship', icon: Heart },
  { id: 'content', label: 'Content', icon: Palette },
  { id: 'lifestyle', label: 'Lifestyle', icon: Users },
];

// Popular goal templates with realistic participant counts
export const popularTemplates: PopularGoalTemplate[] = [
  // Fitness
  {
    id: 'lose-weight',
    name: 'Lose Weight',
    icon: Scale,
    category: 'fitness',
    description: 'Reach your ideal weight through consistent effort',
    participants: 3247,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    tips: ['Focus on nutrition + exercise', 'Track your progress weekly', 'Aim for 0.5-1kg per week'],
  },
  {
    id: 'workout-streak',
    name: 'Build Workout Habit',
    icon: Dumbbell,
    category: 'fitness',
    description: 'Create a consistent exercise routine',
    participants: 2891,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    tips: ['Start with 20 minutes', 'Schedule like a meeting', 'Have a backup home workout'],
  },
  {
    id: 'running-challenge',
    name: 'Running Challenge',
    icon: Flame,
    category: 'fitness',
    description: 'Build your running endurance',
    participants: 1654,
    frequency: 'weekly',
    defaultDuration: 90,
    smartType: 'measured',
    targetLabel: 'Total kilometers',
    targetPlaceholder: '100',
    targetSuffix: 'km',
    tips: ['Start with walk-run intervals', 'Rest days are important', 'Get proper running shoes'],
  },
  
  // Finance
  {
    id: 'save-money',
    name: 'Save Money',
    icon: Wallet,
    category: 'finance',
    description: 'Build your savings consistently',
    participants: 4521,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total to save',
    targetPlaceholder: '500000',
    targetSuffix: '',
    tips: ['Automate your savings', 'Start with 10% of income', 'Keep in separate account'],
  },
  {
    id: 'pay-off-debt',
    name: 'Debt Freedom',
    icon: DollarSign,
    category: 'finance',
    description: 'Pay off your debts and breathe easier',
    participants: 2156,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total debt to pay',
    targetPlaceholder: '200000',
    targetSuffix: '',
    tips: ['Pay more than minimum', 'Consider debt snowball method', 'Celebrate milestones'],
  },
  {
    id: 'start-investing',
    name: 'Start Investing',
    icon: TrendingUp,
    category: 'finance',
    description: 'Begin your investment journey',
    participants: 1432,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total to invest',
    targetPlaceholder: '100000',
    targetSuffix: '',
    tips: ['Consistency beats timing', 'Diversify investments', 'Start small, increase over time'],
  },

  // Learning
  {
    id: 'read-books',
    name: 'Read More Books',
    icon: BookOpen,
    category: 'learning',
    description: 'Expand your knowledge through reading',
    participants: 5234,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Books to read',
    targetPlaceholder: '12',
    targetSuffix: 'books',
    tips: ['Read 20-30 pages daily', 'Keep a book with you always', 'Mix fiction and non-fiction'],
  },
  {
    id: 'learn-language',
    name: 'Learn a Language',
    icon: Globe,
    category: 'learning',
    description: 'Master a new language',
    participants: 2876,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'habit',
    tips: ['15-30 minutes daily is enough', 'Practice speaking from day 1', 'Use apps + real conversations'],
  },
  {
    id: 'get-certified',
    name: 'Get Certified',
    icon: GraduationCap,
    category: 'learning',
    description: 'Earn a professional certification',
    participants: 1654,
    frequency: 'weekly',
    defaultDuration: 90,
    smartType: 'simple',
    tips: ['Study in focused blocks', 'Take practice exams', 'Join study groups'],
  },

  // Career
  {
    id: 'career-growth',
    name: 'Career Growth',
    icon: Briefcase,
    category: 'career',
    description: 'Level up your professional journey',
    participants: 1876,
    frequency: 'weekly',
    defaultDuration: 180,
    smartType: 'simple',
    tips: ['Document your wins', 'Seek stretch assignments', 'Get visibility with leadership'],
  },
  {
    id: 'job-search',
    name: 'Land a New Job',
    icon: Target,
    category: 'career',
    description: 'Find your dream job',
    participants: 1234,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'measured',
    targetLabel: 'Applications to send',
    targetPlaceholder: '50',
    targetSuffix: 'applications',
    tips: ['Quality over quantity', 'Customize each application', 'Network alongside applying'],
  },
  {
    id: 'networking',
    name: 'Grow Your Network',
    icon: Handshake,
    category: 'career',
    description: 'Build meaningful professional connections',
    participants: 987,
    frequency: 'weekly',
    defaultDuration: 180,
    smartType: 'measured',
    targetLabel: 'New connections',
    targetPlaceholder: '24',
    targetSuffix: 'people',
    tips: ['Offer value first', 'Follow up within 48 hours', 'Attend industry events'],
  },

  // Side Hustle
  {
    id: 'launch-business',
    name: 'Launch Your Business',
    icon: Rocket,
    category: 'side-hustle',
    description: 'Start your entrepreneurial journey',
    participants: 1543,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    tips: ['Start before you\'re ready', 'Talk to potential customers', 'Launch an MVP first'],
  },
  {
    id: 'side-income',
    name: 'Build Side Income',
    icon: Zap,
    category: 'side-hustle',
    description: 'Create additional income streams',
    participants: 2134,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Income target',
    targetPlaceholder: '500000',
    targetSuffix: '',
    tips: ['Start with skills you have', 'Reinvest early profits', 'Track time vs income'],
  },

  // Spiritual
  {
    id: 'daily-prayer',
    name: 'Daily Prayer/Meditation',
    icon: Sparkles,
    category: 'spiritual',
    description: 'Deepen your spiritual practice',
    participants: 3421,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    tips: ['Same time each day helps', 'Start with 5 minutes', 'Find a quiet space'],
  },
  {
    id: 'scripture-reading',
    name: 'Read Scripture Daily',
    icon: BookOpen,
    category: 'spiritual',
    description: 'Connect with sacred texts',
    participants: 2567,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'habit',
    tips: ['One chapter a day', 'Journal your reflections', 'Join a study group'],
  },

  // Mental Health / Wellness
  {
    id: 'wellness-journey',
    name: 'Wellness Journey',
    icon: Brain,
    category: 'mental-health',
    description: 'Prioritize your mental wellbeing',
    participants: 2156,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    tips: ['Start with self-care basics', 'Be patient with yourself', 'Seek support when needed'],
  },
  {
    id: 'meditation',
    name: 'Build Meditation Habit',
    icon: Sparkles,
    category: 'mental-health',
    description: 'Cultivate inner peace',
    participants: 1876,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    tips: ['Start with guided meditations', '2 minutes is enough to start', 'Morning works best'],
  },
  {
    id: 'journaling',
    name: 'Daily Journaling',
    icon: PenTool,
    category: 'mental-health',
    description: 'Process thoughts through writing',
    participants: 1432,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    tips: ['Write before bed or morning', 'No judgment, just write', 'Try gratitude journaling'],
  },

  // Relationship
  {
    id: 'quality-time',
    name: 'Quality Time',
    icon: Heart,
    category: 'relationship',
    description: 'Strengthen your relationships',
    participants: 1234,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'habit',
    tips: ['Put phones away', 'Plan activities together', 'Active listening matters'],
  },
  {
    id: 'date-nights',
    name: 'Regular Date Nights',
    icon: Heart,
    category: 'relationship',
    description: 'Keep the spark alive',
    participants: 987,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Date nights',
    targetPlaceholder: '52',
    targetSuffix: 'dates',
    tips: ['Schedule in advance', 'Try new experiences', 'Budget for it'],
  },

  // Content
  {
    id: 'creative-project',
    name: 'Creative Project',
    icon: Palette,
    category: 'content',
    description: 'Bring your creative vision to life',
    participants: 1234,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    tips: ['Work on it daily', 'Done is better than perfect', 'Share your progress'],
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    icon: Mic,
    category: 'content',
    description: 'Build your online presence',
    participants: 2345,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Posts/videos to create',
    targetPlaceholder: '52',
    targetSuffix: 'pieces',
    tips: ['Batch create content', 'Consistency over perfection', 'Engage with your audience'],
  },

  // Lifestyle
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    icon: Calendar,
    category: 'lifestyle',
    description: 'Start each day with intention',
    participants: 2345,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    tips: ['Wake up at same time', 'No phone for first hour', 'Include exercise'],
  },
  {
    id: 'learn-skill',
    name: 'Learn a New Skill',
    icon: Music,
    category: 'lifestyle',
    description: 'Master something new',
    participants: 1876,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    tips: ['Practice daily', 'Get feedback', 'Enjoy the process'],
  },
];

interface SmartGoalTemplatesProps {
  onSelectTemplate: (template: PopularGoalTemplate, config: GoalConfig) => void;
  onCreateCustom: () => void;
}

export interface GoalConfig {
  name: string;
  target: string;
  startDate: string;
  deadline: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export function SmartGoalTemplates({ onSelectTemplate, onCreateCustom }: SmartGoalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PopularGoalTemplate | null>(null);
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(() => format(addDays(new Date('2026-01-01'), 90), 'yyyy-MM-dd'));
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filteredTemplates = selectedCategory === 'all' 
    ? popularTemplates 
    : popularTemplates.filter(t => t.category === selectedCategory);

  // Sort by participants
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.participants - a.participants);

  const handleTemplateClick = (template: PopularGoalTemplate) => {
    setSelectedTemplate(template);
    setFrequency(template.frequency);
    const start = new Date('2026-01-01');
    const end = addDays(start, template.defaultDuration);
    setStartDate('2026-01-01');
    setEndDate(format(end, 'yyyy-MM-dd'));
    setTargetValue('');
  };

  const handleConfirm = () => {
    if (!selectedTemplate) return;
    
    let target = '';
    if (selectedTemplate.smartType === 'measured' && targetValue) {
      target = selectedTemplate.targetSuffix 
        ? `${targetValue} ${selectedTemplate.targetSuffix}`
        : `₦${Number(targetValue).toLocaleString()}`;
    }

    onSelectTemplate(selectedTemplate, {
      name: selectedTemplate.name,
      target,
      startDate,
      deadline: endDate,
      frequency,
    });
  };

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getDaysCount = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getBreakdown = () => {
    const days = getDaysCount();
    if (!targetValue || days <= 0) return '';
    
    const value = parseFloat(targetValue);
    if (isNaN(value)) return '';

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

    if (selectedTemplate?.targetSuffix) {
      return `${displayValue} ${selectedTemplate.targetSuffix} per ${periodLabel}`;
    }
    return `₦${Number(displayValue).toLocaleString()} per ${periodLabel}`;
  };

  // Template selection view
  if (!selectedTemplate) {
    return (
      <div className="space-y-5">
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
          {goalCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Popular Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className={cn(
                  "p-4 rounded-xl border border-border/50 bg-card/50",
                  "hover:bg-card hover:border-primary/50 transition-all text-left group",
                  "hover-lift"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {template.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center gap-1 text-xs text-success">
                        <Trophy className="w-3 h-3" />
                        <span className="font-medium">{formatParticipants(template.participants)}</span>
                        <span className="text-muted-foreground">crushing this</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Goal Button */}
        <button
          onClick={onCreateCustom}
          className="w-full p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 text-primary group"
        >
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold">Create Custom Goal</p>
            <p className="text-xs text-muted-foreground">Build your own unique goal</p>
          </div>
        </button>
      </div>
    );
  }

  // Template configuration view
  const Icon = selectedTemplate.icon;
  const days = getDaysCount();

  return (
    <div className="space-y-5">
      {/* Back Button */}
      <button
        onClick={() => setSelectedTemplate(null)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back to goals
      </button>

      {/* Selected Template Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/30">
        <div className="p-3 rounded-xl bg-primary/20 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{selectedTemplate.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Trophy className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-success font-medium">
              {formatParticipants(selectedTemplate.participants)} people crushing this
            </span>
          </div>
        </div>
      </div>

      {/* Target Input for Measured Goals */}
      {selectedTemplate.smartType === 'measured' && (
        <div className="space-y-2">
          <Label htmlFor="target" className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            {selectedTemplate.targetLabel}
          </Label>
          <div className="relative">
            {!selectedTemplate.targetSuffix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
            )}
            <Input
              id="target"
              type="number"
              placeholder={selectedTemplate.targetPlaceholder}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className={cn(
                "bg-secondary border-border h-12",
                !selectedTemplate.targetSuffix && "pl-8"
              )}
            />
            {selectedTemplate.targetSuffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {selectedTemplate.targetSuffix}
              </span>
            )}
          </div>
          {targetValue && getBreakdown() && (
            <p className="text-sm text-success font-medium">
              → {getBreakdown()}
            </p>
          )}
        </div>
      )}

      {/* Date Selection */}
      <div className="p-4 rounded-xl bg-card/50 border border-border/50 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-medium">Timeline</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-secondary border-border h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">End Date</Label>
            <Input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-secondary border-border h-11"
            />
          </div>
        </div>

        {days > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
            <Calendar className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">
              {days} days to achieve this goal!
            </span>
          </div>
        )}
      </div>

      {/* Frequency Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary" />
          How often do you want reminders?
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'daily', label: 'Daily', desc: 'Every day' },
            { id: 'weekly', label: 'Weekly', desc: 'Once a week' },
            { id: 'monthly', label: 'Monthly', desc: 'Once a month' },
          ].map((freq) => (
            <button
              key={freq.id}
              type="button"
              onClick={() => setFrequency(freq.id as 'daily' | 'weekly' | 'monthly')}
              className={cn(
                "p-3 rounded-lg border transition-all text-center",
                frequency === freq.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 bg-card/50 hover:border-primary/50"
              )}
            >
              <p className="font-medium text-sm">{freq.label}</p>
              <p className="text-xs text-muted-foreground">{freq.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      {selectedTemplate.tips.length > 0 && (
        <div className="p-3 rounded-xl bg-card/50 border border-border/50">
          <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Pro Tips
          </p>
          <ul className="space-y-1">
            {selectedTemplate.tips.map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handleConfirm}
        disabled={selectedTemplate.smartType === 'measured' && !targetValue}
      >
        Start This Goal
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
