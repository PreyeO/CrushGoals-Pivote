import { useState, useMemo } from "react";
import { 
  Briefcase, DollarSign, BookOpen, Sparkles, Heart, 
  Dumbbell, TrendingUp, Palette, Users, Brain, 
  Target, Scale, Flame, GraduationCap, Wallet,
  Rocket, Handshake, PenTool, 
  Mic, Globe, Zap, Trophy, Plus, Search, Coffee,
  Cigarette, Clock, Utensils, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  actionVerb?: string;
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

// Popular goal templates - Curated actionable yearly goals
export const popularTemplates: PopularGoalTemplate[] = [
  // Fitness - Actionable & Popular
  {
    id: 'lose-weight-gym',
    name: 'Lose Weight (Hit the Gym)',
    icon: Scale,
    category: 'fitness',
    description: 'Gym workouts 3-5x/week + calorie tracking',
    participants: 8247,
    frequency: 'daily',
    defaultDuration: 180,
    smartType: 'measured',
    targetLabel: 'Weight to lose (kg)',
    targetPlaceholder: '10',
    targetSuffix: 'kg',
    actionVerb: 'Work out at gym',
    tips: ['Track calories with an app', 'Aim for 3-5 gym sessions/week', 'Focus on strength + cardio mix'],
  },
  {
    id: 'run-5k',
    name: 'Run a 5K Race',
    icon: Flame,
    category: 'fitness',
    description: 'Train from couch to completing 5K',
    participants: 4521,
    frequency: 'weekly',
    defaultDuration: 90,
    smartType: 'simple',
    actionVerb: 'Complete training run',
    tips: ['Start with walk-run intervals', 'Follow Couch to 5K program', 'Register for a race as motivation'],
  },
  {
    id: 'marathon-training',
    name: 'Run a Marathon',
    icon: Trophy,
    category: 'fitness',
    description: 'Complete a full marathon (42.2km)',
    participants: 2134,
    frequency: 'weekly',
    defaultDuration: 180,
    smartType: 'measured',
    targetLabel: 'Training runs',
    targetPlaceholder: '60',
    targetSuffix: 'runs',
    actionVerb: 'Complete training run',
    tips: ['Build base mileage first', 'Long run every weekend', 'Join a running club'],
  },
  
  // Finance - Top yearly goals
  {
    id: 'emergency-fund',
    name: 'Build Emergency Fund',
    icon: Wallet,
    category: 'finance',
    description: 'Save 3-6 months of expenses',
    participants: 6521,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total to save',
    targetPlaceholder: '500000',
    targetSuffix: '',
    actionVerb: 'Transfer to savings',
    tips: ['Automate monthly transfers', 'Start with 10% of income', 'Keep in high-yield savings account'],
  },
  {
    id: 'pay-off-debt',
    name: 'Become Debt Free',
    icon: DollarSign,
    category: 'finance',
    description: 'Pay off all consumer debt',
    participants: 4156,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total debt to clear',
    targetPlaceholder: '200000',
    targetSuffix: '',
    actionVerb: 'Make extra payment',
    tips: ['Use debt snowball method', 'Put all extra income to debt', 'Celebrate each paid-off account'],
  },
  {
    id: 'first-investment',
    name: 'Start Investing',
    icon: TrendingUp,
    category: 'finance',
    description: 'Open brokerage & invest monthly',
    participants: 3432,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Total to invest',
    targetPlaceholder: '100000',
    targetSuffix: '',
    actionVerb: 'Invest monthly amount',
    tips: ['Start with index funds', 'Set up automatic investments', 'Think long-term, ignore market noise'],
  },

  // Learning - Popular self-improvement goals
  {
    id: 'read-books',
    name: 'Read 12 Books This Year',
    icon: BookOpen,
    category: 'learning',
    description: 'One book per month minimum',
    participants: 7234,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Books to read',
    targetPlaceholder: '12',
    targetSuffix: 'books',
    actionVerb: 'Read for 30 minutes',
    tips: ['Read 20-30 pages daily', 'Mix genres to stay interested', 'Join a book club for accountability'],
  },
  {
    id: 'learn-language',
    name: 'Learn a New Language',
    icon: Globe,
    category: 'learning',
    description: 'Reach conversational level in 1 year',
    participants: 5876,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'habit',
    actionVerb: 'Complete language lesson',
    tips: ['Use Duolingo + conversation apps', '15-30 minutes daily', 'Find a language exchange partner'],
  },
  {
    id: 'get-certified',
    name: 'Get Professional Certification',
    icon: GraduationCap,
    category: 'learning',
    description: 'Pass a career-boosting certification exam',
    participants: 3654,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    actionVerb: 'Study for certification',
    tips: ['Block 1-2 hours daily for study', 'Take practice exams weekly', 'Set exam date to create urgency'],
  },

  // Career - Actionable professional goals
  {
    id: 'get-promotion',
    name: 'Get a Promotion',
    icon: Briefcase,
    category: 'career',
    description: 'Level up at your current job',
    participants: 4876,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'simple',
    actionVerb: 'Work on visibility task',
    tips: ['Document all your wins', 'Take on stretch projects', 'Have regular career chats with manager'],
  },
  {
    id: 'new-job',
    name: 'Land a New Job',
    icon: Target,
    category: 'career',
    description: 'Find a better opportunity',
    participants: 3234,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'measured',
    targetLabel: 'Applications to send',
    targetPlaceholder: '50',
    targetSuffix: 'applications',
    actionVerb: 'Apply to jobs',
    tips: ['Tailor resume for each role', 'Network alongside applying', 'Practice interviewing weekly'],
  },
  {
    id: 'build-network',
    name: 'Grow Professional Network',
    icon: Handshake,
    category: 'career',
    description: 'Make valuable industry connections',
    participants: 2187,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'New connections',
    targetPlaceholder: '52',
    targetSuffix: 'people',
    actionVerb: 'Reach out to someone new',
    tips: ['Attend 1 event per month', 'Coffee chats with 1 person/week', 'Offer value before asking'],
  },

  // Side Hustle
  {
    id: 'launch-business',
    name: 'Launch a Side Business',
    icon: Rocket,
    category: 'side-hustle',
    description: 'Start earning from your idea',
    participants: 3543,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'simple',
    actionVerb: 'Work on business',
    tips: ['Validate idea before building', 'Launch MVP in 30 days', 'Get first paying customer fast'],
  },
  {
    id: 'freelance-income',
    name: 'Build Freelance Income',
    icon: Zap,
    category: 'side-hustle',
    description: 'Earn on the side with your skills',
    participants: 4134,
    frequency: 'monthly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Monthly income target',
    targetPlaceholder: '100000',
    targetSuffix: '',
    actionVerb: 'Work on freelance projects',
    tips: ['Start on Upwork/Fiverr', 'Build portfolio first', 'Raise rates every 3 months'],
  },

  // Spiritual
  {
    id: 'daily-prayer',
    name: 'Daily Prayer Practice',
    icon: Sparkles,
    category: 'spiritual',
    description: 'Dedicated prayer time every day',
    participants: 5421,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'habit',
    actionVerb: 'Complete prayer time',
    tips: ['Same time each day', 'Start with 10 minutes', 'Keep a prayer journal'],
  },
  {
    id: 'scripture-reading',
    name: 'Read Through the Bible',
    icon: BookOpen,
    category: 'spiritual',
    description: 'Complete Bible reading in 1 year',
    participants: 4567,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'habit',
    actionVerb: 'Read daily passage',
    tips: ['Use a reading plan', '3-4 chapters per day', 'Journal key insights'],
  },

  // Mental Health / Wellness
  {
    id: 'daily-meditation',
    name: 'Daily Meditation',
    icon: Brain,
    category: 'mental-health',
    description: 'Build a calm, focused mind',
    participants: 4876,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    actionVerb: 'Complete meditation session',
    tips: ['Start with 5 minutes', 'Use Headspace or Calm app', 'Morning is best time'],
  },
  {
    id: 'quit-smoking',
    name: 'Quit Smoking',
    icon: Cigarette,
    category: 'mental-health',
    description: 'Become smoke-free for good',
    participants: 3156,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    actionVerb: 'Stay smoke-free',
    tips: ['Set quit date', 'Use nicotine replacement', 'Identify and avoid triggers'],
  },
  {
    id: 'better-sleep',
    name: 'Fix Sleep Schedule',
    icon: Moon,
    category: 'mental-health',
    description: 'Get 7-8 hours of quality sleep',
    participants: 3432,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    actionVerb: 'Complete sleep routine',
    tips: ['Same bedtime every night', 'No screens 1 hour before bed', 'Keep bedroom cool & dark'],
  },

  // Relationship
  {
    id: 'weekly-date-night',
    name: 'Weekly Date Night',
    icon: Heart,
    category: 'relationship',
    description: 'Dedicated quality time with partner',
    participants: 2987,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Date nights',
    targetPlaceholder: '52',
    targetSuffix: 'dates',
    actionVerb: 'Go on date night',
    tips: ['Schedule like a meeting', 'Try new experiences', 'Phones away during date'],
  },
  {
    id: 'family-time',
    name: 'Quality Family Time',
    icon: Users,
    category: 'relationship',
    description: 'Intentional time with family weekly',
    participants: 2234,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'habit',
    actionVerb: 'Spend quality family time',
    tips: ['Weekly family activity', 'Daily dinner together', 'One-on-one time with each child'],
  },

  // Content Creation
  {
    id: 'youtube-channel',
    name: 'Start YouTube Channel',
    icon: Mic,
    category: 'content',
    description: 'Post consistently and grow audience',
    participants: 3345,
    frequency: 'weekly',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Videos to post',
    targetPlaceholder: '52',
    targetSuffix: 'videos',
    actionVerb: 'Work on video content',
    tips: ['Start with 1 video/week', 'Batch film content', 'Consistency beats perfection'],
  },
  {
    id: 'write-book',
    name: 'Write a Book',
    icon: PenTool,
    category: 'content',
    description: 'Complete your first book',
    participants: 2567,
    frequency: 'daily',
    defaultDuration: 365,
    smartType: 'measured',
    targetLabel: 'Words to write',
    targetPlaceholder: '50000',
    targetSuffix: 'words',
    actionVerb: 'Write daily words',
    tips: ['500 words per day', 'Write at same time daily', 'Dont edit while writing'],
  },

  // Lifestyle
  {
    id: 'wake-early',
    name: 'Wake Up at 5AM',
    icon: Clock,
    category: 'lifestyle',
    description: 'Join the 5AM club for productivity',
    participants: 4345,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    actionVerb: 'Wake up at 5AM',
    tips: ['Go to bed by 9-10PM', 'No snooze button', 'Have morning routine ready'],
  },
  {
    id: 'eat-healthy',
    name: 'Eat Healthier',
    icon: Utensils,
    category: 'lifestyle',
    description: 'Clean eating & meal prep weekly',
    participants: 5876,
    frequency: 'daily',
    defaultDuration: 90,
    smartType: 'habit',
    actionVerb: 'Eat healthy meals',
    tips: ['Meal prep on Sundays', 'Drink 2L water daily', 'Track meals for first month'],
  },
  {
    id: 'reduce-screen',
    name: 'Reduce Screen Time',
    icon: Coffee,
    category: 'lifestyle',
    description: 'Less social media, more real life',
    participants: 3654,
    frequency: 'daily',
    defaultDuration: 66,
    smartType: 'habit',
    actionVerb: 'Stay within screen limits',
    tips: ['Set app time limits', 'No phone first hour of day', 'Replace with reading/hobby'],
  },
];

interface SmartGoalTemplatesProps {
  onSelectTemplate: (template: PopularGoalTemplate) => void;
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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    let templates = selectedCategory === 'all' 
      ? popularTemplates 
      : popularTemplates.filter(t => t.category === selectedCategory);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return templates.sort((a, b) => b.participants - a.participants);
  }, [selectedCategory, searchQuery]);

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm bg-background/50"
        />
      </div>

      {/* Category Filters - Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1.5 pb-2 min-w-max sm:flex-wrap sm:min-w-0">
          {goalCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[45vh] overflow-y-auto pr-1">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No goals found matching "{searchQuery}"</p>
            <button 
              onClick={onCreateCustom}
              className="text-primary text-sm mt-2 hover:underline"
            >
              Create a custom goal instead
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  "p-3 rounded-xl border border-border/40 bg-card/30",
                  "hover:bg-card/80 hover:border-primary/40 hover:shadow-sm transition-all text-left group"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                      {template.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {formatParticipants(template.participants)}
                      </span>
                      <span className="text-xs text-muted-foreground">crushing it</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Custom Goal Button */}
      <button
        onClick={onCreateCustom}
        className="w-full p-3 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2.5 text-primary group"
      >
        <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">Create Custom Goal</p>
          <p className="text-xs text-muted-foreground">Build your own unique goal</p>
        </div>
      </button>
    </div>
  );
}
