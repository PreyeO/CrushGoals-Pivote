import { useState } from "react";
import { Search, Dumbbell, BookOpen, DollarSign, Brain, Briefcase, Heart, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GoalTemplate {
  id: string;
  name: string;
  category: string;
  emoji: string;
  target: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reason: string;
  description: string;
  durationDays: number;
}

// Consolidated, non-repetitive templates
export const goalTemplates: GoalTemplate[] = [
  // Fitness - consolidated (no separate run, exercise, lose weight - all under fitness)
  {
    id: 'fitness-transformation',
    name: 'Body Transformation',
    category: 'fitness',
    emoji: '💪',
    target: '10 kg',
    frequency: 'daily',
    reason: 'I want to be healthier and feel confident',
    description: 'Daily workouts + nutrition tracking',
    durationDays: 90,
  },
  {
    id: 'running-goal',
    name: 'Running Program',
    category: 'fitness',
    emoji: '🏃',
    target: '50 km',
    frequency: 'weekly',
    reason: 'I want to improve my endurance',
    description: 'Weekly running distance targets',
    durationDays: 60,
  },
  // Learning
  {
    id: 'read-books',
    name: 'Reading Challenge',
    category: 'learning',
    emoji: '📚',
    target: '12 books',
    frequency: 'monthly',
    reason: 'I want to expand my knowledge',
    description: 'One book per month',
    durationDays: 365,
  },
  {
    id: 'learn-language',
    name: 'Language Learning',
    category: 'learning',
    emoji: '🗣️',
    target: '365 lessons',
    frequency: 'daily',
    reason: 'I want to speak a new language',
    description: 'Daily practice sessions',
    durationDays: 365,
  },
  {
    id: 'online-certification',
    name: 'Get Certified',
    category: 'learning',
    emoji: '🎓',
    target: '1 certification',
    frequency: 'weekly',
    reason: 'I want to advance my career',
    description: 'Weekly study sessions',
    durationDays: 90,
  },
  // Financial
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    category: 'financial',
    emoji: '💰',
    target: '$5000',
    frequency: 'monthly',
    reason: 'I want financial security',
    description: 'Monthly savings aligned with payday',
    durationDays: 180,
  },
  {
    id: 'debt-payoff',
    name: 'Debt Freedom',
    category: 'financial',
    emoji: '💳',
    target: '$3000',
    frequency: 'monthly',
    reason: 'I want to be debt-free',
    description: 'Monthly debt payments',
    durationDays: 120,
  },
  {
    id: 'micro-savings',
    name: 'Daily Micro-Savings',
    category: 'financial',
    emoji: '🐷',
    target: '$1000',
    frequency: 'daily',
    reason: 'I want to build saving habits',
    description: 'Save a little every day',
    durationDays: 100,
  },
  // Wellness
  {
    id: 'meditation',
    name: 'Meditation Practice',
    category: 'wellness',
    emoji: '🧘',
    target: '30 sessions',
    frequency: 'daily',
    reason: 'I want inner peace and clarity',
    description: '10-minute daily meditation',
    durationDays: 30,
  },
  {
    id: 'sleep-optimization',
    name: 'Better Sleep',
    category: 'wellness',
    emoji: '😴',
    target: '21 nights',
    frequency: 'daily',
    reason: 'I want more energy',
    description: 'Consistent sleep schedule',
    durationDays: 21,
  },
  // Career
  {
    id: 'networking',
    name: 'Grow Network',
    category: 'career',
    emoji: '🤝',
    target: '12 connections',
    frequency: 'weekly',
    reason: 'I want more opportunities',
    description: '1 new connection per week',
    durationDays: 90,
  },
  {
    id: 'side-hustle',
    name: 'Launch Project',
    category: 'career',
    emoji: '🚀',
    target: '1 launch',
    frequency: 'daily',
    reason: 'I want to build something meaningful',
    description: 'Daily progress on passion project',
    durationDays: 90,
  },
  // Creative
  {
    id: 'write-book',
    name: 'Write a Book',
    category: 'creative',
    emoji: '✍️',
    target: '50000 words',
    frequency: 'daily',
    reason: 'I have a story to tell',
    description: 'Daily writing sessions',
    durationDays: 180,
  },
  {
    id: 'creative-project',
    name: 'Creative Portfolio',
    category: 'creative',
    emoji: '🎨',
    target: '12 pieces',
    frequency: 'weekly',
    reason: 'I want to express myself',
    description: 'Weekly creative output',
    durationDays: 90,
  },
];

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  onCreateCustom?: () => void;
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

export function GoalTemplates({ onSelectTemplate, onCreateCustom, categoryFilter }: GoalTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = goalTemplates.filter(t => {
    const matchesCategory = !categoryFilter || t.category === categoryFilter;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-secondary/50 border-border"
        />
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
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

      {filteredTemplates.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">No templates found</p>
        </div>
      )}

      {/* Create custom button */}
      {onCreateCustom && (
        <button
          onClick={onCreateCustom}
          className="w-full p-3 rounded-lg border border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-primary"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Don't see your goal? Create custom →</span>
        </button>
      )}
    </div>
  );
}