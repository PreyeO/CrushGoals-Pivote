import { useState } from "react";
import { 
  Briefcase, DollarSign, BookOpen, Sparkles, Heart, 
  Dumbbell, TrendingUp, Palette, Users, Brain, 
  Target, Scale, Flame, GraduationCap, Wallet,
  Rocket, Handshake, PenTool, Calendar, Music,
  Mic, Globe, Zap, Trophy, ArrowRight, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const filteredTemplates = selectedCategory === 'all' 
    ? popularTemplates 
    : popularTemplates.filter(t => t.category === selectedCategory);

  // Sort by participants
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.participants - a.participants);

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Category Filters - Horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 pb-2 min-w-max sm:flex-wrap sm:min-w-0">
          {goalCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
        {sortedTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={cn(
                "p-3 rounded-xl border border-border/50 bg-card/50",
                "hover:bg-card hover:border-primary/50 transition-all text-left group"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Trophy className="w-3 h-3 text-success" />
                    <span className="text-xs text-success font-medium">{formatParticipants(template.participants)}</span>
                    <span className="text-xs text-muted-foreground">crushing it</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
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
