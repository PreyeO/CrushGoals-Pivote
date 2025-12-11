import { Dumbbell, BookOpen, DollarSign, Brain, Briefcase, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoalTemplate {
  id: string;
  name: string;
  category: string;
  emoji: string;
  target: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  reason: string;
  description: string;
  durationDays: number;
}

export const goalTemplates: GoalTemplate[] = [
  // Fitness templates
  {
    id: 'lose-weight',
    name: 'Lose 10kg',
    category: 'fitness',
    emoji: '💪',
    target: '10 kg',
    frequency: 'daily',
    reason: 'I want to be healthier and feel confident in my body',
    description: 'Daily workout and nutrition tracking',
    durationDays: 90,
  },
  {
    id: 'run-5k',
    name: 'Run a 5K',
    category: 'fitness',
    emoji: '🏃',
    target: '5 km',
    frequency: 'daily',
    reason: 'I want to improve my cardiovascular health and endurance',
    description: 'Progressive running program',
    durationDays: 60,
  },
  {
    id: 'workout-habit',
    name: 'Exercise 5 days a week',
    category: 'fitness',
    emoji: '🏋️',
    target: '20 workouts',
    frequency: 'daily',
    reason: 'I want to build a consistent exercise habit',
    description: 'Build a sustainable fitness routine',
    durationDays: 30,
  },
  // Reading/Learning templates
  {
    id: 'read-12-books',
    name: 'Read 12 Books',
    category: 'learning',
    emoji: '📚',
    target: '12 books',
    frequency: 'daily',
    reason: 'I want to expand my knowledge and improve my mind',
    description: 'One book per month reading goal',
    durationDays: 365,
  },
  {
    id: 'learn-language',
    name: 'Learn a New Language',
    category: 'learning',
    emoji: '🗣️',
    target: '365 lessons',
    frequency: 'daily',
    reason: 'I want to communicate with more people and explore new cultures',
    description: 'Daily language practice sessions',
    durationDays: 365,
  },
  {
    id: 'online-course',
    name: 'Complete Online Course',
    category: 'learning',
    emoji: '🎓',
    target: '30 lessons',
    frequency: 'daily',
    reason: 'I want to advance my skills and career',
    description: 'Finish a certification or skill course',
    durationDays: 30,
  },
  // Financial templates
  {
    id: 'save-emergency-fund',
    name: 'Build Emergency Fund',
    category: 'financial',
    emoji: '💰',
    target: '$5000',
    frequency: 'weekly',
    reason: 'I want financial security and peace of mind',
    description: 'Save for 3-6 months of expenses',
    durationDays: 180,
  },
  {
    id: 'pay-off-debt',
    name: 'Pay Off Debt',
    category: 'financial',
    emoji: '💳',
    target: '$3000',
    frequency: 'weekly',
    reason: 'I want to be debt-free and financially independent',
    description: 'Aggressive debt payoff strategy',
    durationDays: 120,
  },
  {
    id: 'budget-tracking',
    name: 'Track Spending Daily',
    category: 'financial',
    emoji: '📊',
    target: '30 days',
    frequency: 'daily',
    reason: 'I want to understand where my money goes',
    description: 'Daily expense tracking habit',
    durationDays: 30,
  },
  // Wellness templates
  {
    id: 'meditation-habit',
    name: 'Meditate Daily',
    category: 'wellness',
    emoji: '🧘',
    target: '30 sessions',
    frequency: 'daily',
    reason: 'I want to reduce stress and improve mental clarity',
    description: '10-minute daily meditation practice',
    durationDays: 30,
  },
  {
    id: 'sleep-schedule',
    name: 'Fix Sleep Schedule',
    category: 'wellness',
    emoji: '😴',
    target: '21 nights',
    frequency: 'daily',
    reason: 'I want better energy and mental performance',
    description: 'Consistent bedtime and wake time',
    durationDays: 21,
  },
  {
    id: 'journaling',
    name: 'Daily Journaling',
    category: 'wellness',
    emoji: '📝',
    target: '30 entries',
    frequency: 'daily',
    reason: 'I want to process my thoughts and grow personally',
    description: 'Morning or evening reflection habit',
    durationDays: 30,
  },
  // Career templates
  {
    id: 'networking',
    name: 'Expand Network',
    category: 'career',
    emoji: '🤝',
    target: '12 connections',
    frequency: 'weekly',
    reason: 'I want to grow my professional opportunities',
    description: 'Connect with 1 new person weekly',
    durationDays: 90,
  },
  {
    id: 'side-project',
    name: 'Launch Side Project',
    category: 'career',
    emoji: '🚀',
    target: '1 launch',
    frequency: 'daily',
    reason: 'I want to build something meaningful outside work',
    description: 'Daily progress on your passion project',
    durationDays: 90,
  },
  // Creative templates
  {
    id: 'write-book',
    name: 'Write a Book',
    category: 'creative',
    emoji: '✍️',
    target: '50000 words',
    frequency: 'daily',
    reason: 'I have a story to tell and want to share it',
    description: 'Daily writing habit for authors',
    durationDays: 180,
  },
];

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  categoryFilter?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  fitness: <Dumbbell className="w-4 h-4" />,
  learning: <BookOpen className="w-4 h-4" />,
  financial: <DollarSign className="w-4 h-4" />,
  wellness: <Brain className="w-4 h-4" />,
  career: <Briefcase className="w-4 h-4" />,
  creative: <Heart className="w-4 h-4" />,
};

export function GoalTemplates({ onSelectTemplate, categoryFilter }: GoalTemplatesProps) {
  const filteredTemplates = categoryFilter 
    ? goalTemplates.filter(t => t.category === categoryFilter)
    : goalTemplates;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Quick start with a popular template:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={cn(
              "p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50",
              "text-left transition-all group"
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{template.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {template.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    {template.durationDays} days
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {template.frequency}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
