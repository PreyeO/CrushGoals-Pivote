import { useState } from "react";
import { 
  Briefcase, DollarSign, BookOpen, Sparkles, Heart, 
  Dumbbell, TrendingUp, Palette, Users, Brain, 
  ChevronRight, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Smart template with dynamic fields
export interface SmartTemplate {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  smartPrompt: string; // Dynamic prompt with placeholders
  fields: TemplateField[];
  frequency: 'daily' | 'weekly' | 'monthly';
  defaultDuration: number;
  tips: string[];
}

interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  type: 'number' | 'text' | 'currency';
  suffix?: string;
  helpText?: string;
  required?: boolean;
}

// Category definitions
export const goalCategories = [
  { 
    id: 'finance', 
    label: 'Finance', 
    emoji: '💰', 
    icon: DollarSign,
    description: 'Save, invest, pay off debt'
  },
  { 
    id: 'fitness', 
    label: 'Fitness', 
    emoji: '💪', 
    icon: Dumbbell,
    description: 'Health, exercise, body goals'
  },
  { 
    id: 'learning', 
    label: 'Learning', 
    emoji: '📚', 
    icon: BookOpen,
    description: 'Skills, books, courses'
  },
  { 
    id: 'career', 
    label: 'Career', 
    emoji: '🚀', 
    icon: Briefcase,
    description: 'Job, promotion, skills'
  },
  { 
    id: 'side-hustle', 
    label: 'Side Hustle', 
    emoji: '💼', 
    icon: TrendingUp,
    description: 'Business, passive income'
  },
  { 
    id: 'spiritual', 
    label: 'Spiritual', 
    emoji: '🙏', 
    icon: Sparkles,
    description: 'Faith, meditation, purpose'
  },
  { 
    id: 'mental-health', 
    label: 'Mental Health', 
    emoji: '🧠', 
    icon: Brain,
    description: 'Wellness, therapy, peace'
  },
  { 
    id: 'relationship', 
    label: 'Relationship', 
    emoji: '❤️', 
    icon: Heart,
    description: 'Family, dating, friendships'
  },
  { 
    id: 'content', 
    label: 'Content', 
    emoji: '🎬', 
    icon: Palette,
    description: 'Create, publish, grow'
  },
  { 
    id: 'lifestyle', 
    label: 'Lifestyle', 
    emoji: '✨', 
    icon: Users,
    description: 'Habits, hobbies, travel'
  },
];

// Smart templates per category
export const smartTemplates: Record<string, SmartTemplate[]> = {
  finance: [
    {
      id: 'emergency-fund',
      name: 'Emergency Fund',
      emoji: '🏦',
      category: 'finance',
      description: 'Build your financial safety net',
      smartPrompt: 'Save {amount} for emergency fund by {deadline}',
      fields: [
        { key: 'amount', label: 'Total amount to save', placeholder: '500000', type: 'currency', helpText: 'Recommended: 3-6 months of expenses', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 180,
      tips: ['Monthly savings align well with payday', 'Start small and increase over time'],
    },
    {
      id: 'debt-freedom',
      name: 'Debt Freedom',
      emoji: '💳',
      category: 'finance',
      description: 'Pay off your debt and breathe easier',
      smartPrompt: 'Pay off {amount} in {debtType} debt by {deadline}',
      fields: [
        { key: 'amount', label: 'Total debt amount', placeholder: '200000', type: 'currency', required: true },
        { key: 'debtType', label: 'Type of debt', placeholder: 'e.g., credit card, loan', type: 'text' },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Pay more than minimum when possible', 'Consider debt snowball method'],
    },
    {
      id: 'investment-start',
      name: 'Start Investing',
      emoji: '📈',
      category: 'finance',
      description: 'Begin your investment journey',
      smartPrompt: 'Invest {amount} in {investmentType} by {deadline}',
      fields: [
        { key: 'amount', label: 'Total to invest', placeholder: '100000', type: 'currency', required: true },
        { key: 'investmentType', label: 'Investment type', placeholder: 'e.g., stocks, index funds', type: 'text' },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Consistency beats timing the market', 'Diversify your investments'],
    },
    {
      id: 'savings-goal',
      name: 'Savings Goal',
      emoji: '🎯',
      category: 'finance',
      description: 'Save for something specific',
      smartPrompt: 'Save {amount} for {purpose} by {deadline}',
      fields: [
        { key: 'amount', label: 'Amount to save', placeholder: '300000', type: 'currency', required: true },
        { key: 'purpose', label: 'What are you saving for?', placeholder: 'e.g., vacation, car, wedding', type: 'text', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 180,
      tips: ['Automate your savings', 'Keep savings in a separate account'],
    },
  ],
  fitness: [
    {
      id: 'weight-loss',
      name: 'Weight Loss Journey',
      emoji: '⚖️',
      category: 'fitness',
      description: 'Lose weight and feel great',
      smartPrompt: 'Lose {weight}kg by {deadline} through daily exercise and nutrition',
      fields: [
        { key: 'weight', label: 'Kilos to lose', placeholder: '10', type: 'number', suffix: 'kg', helpText: 'Safe rate: 0.5-1kg per week', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Focus on nutrition first', 'Track your meals', 'Combine cardio and strength training'],
    },
    {
      id: 'running-distance',
      name: 'Running Challenge',
      emoji: '🏃',
      category: 'fitness',
      description: 'Build your running endurance',
      smartPrompt: 'Run {distance}km total by {deadline}',
      fields: [
        { key: 'distance', label: 'Total kilometers', placeholder: '100', type: 'number', suffix: 'km', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['Start with walk-run intervals', 'Rest days are important', 'Get proper running shoes'],
    },
    {
      id: 'workout-streak',
      name: 'Workout Streak',
      emoji: '💪',
      category: 'fitness',
      description: 'Build a consistent workout habit',
      smartPrompt: 'Complete {workouts} workouts by {deadline}',
      fields: [
        { key: 'workouts', label: 'Number of workouts', placeholder: '60', type: 'number', suffix: 'workouts', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Schedule workouts like meetings', 'Start with 20-minute sessions', 'Have a backup home workout'],
    },
    {
      id: 'muscle-building',
      name: 'Build Muscle',
      emoji: '🏋️',
      category: 'fitness',
      description: 'Gain strength and muscle mass',
      smartPrompt: 'Complete {sessions} strength training sessions by {deadline}',
      fields: [
        { key: 'sessions', label: 'Training sessions', placeholder: '48', type: 'number', suffix: 'sessions', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['Progressive overload is key', 'Protein: 1.6-2.2g per kg bodyweight', 'Sleep 7-9 hours for recovery'],
    },
  ],
  learning: [
    {
      id: 'read-books',
      name: 'Reading Challenge',
      emoji: '📚',
      category: 'learning',
      description: 'Read more books this year',
      smartPrompt: 'Read {books} books ({pages} pages each) by {deadline}',
      fields: [
        { key: 'books', label: 'Number of books', placeholder: '12', type: 'number', suffix: 'books', required: true },
        { key: 'pages', label: 'Average pages per book', placeholder: '250', type: 'number', suffix: 'pages', helpText: 'Used to calculate daily reading target' },
      ],
      frequency: 'daily',
      defaultDuration: 365,
      tips: ['Read 20-30 pages daily', 'Keep a book with you always', 'Mix fiction and non-fiction'],
    },
    {
      id: 'learn-language',
      name: 'Language Learning',
      emoji: '🗣️',
      category: 'learning',
      description: 'Master a new language',
      smartPrompt: 'Complete {lessons} {language} lessons by {deadline}',
      fields: [
        { key: 'language', label: 'Which language?', placeholder: 'e.g., Spanish, French', type: 'text', required: true },
        { key: 'lessons', label: 'Number of lessons', placeholder: '365', type: 'number', suffix: 'lessons', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 365,
      tips: ['15-30 minutes daily is enough', 'Practice speaking from day 1', 'Use apps + real conversations'],
    },
    {
      id: 'get-certified',
      name: 'Get Certified',
      emoji: '🎓',
      category: 'learning',
      description: 'Earn a professional certification',
      smartPrompt: 'Complete {certification} certification by {deadline}',
      fields: [
        { key: 'certification', label: 'Certification name', placeholder: 'e.g., AWS, PMP, CPA', type: 'text', required: true },
        { key: 'hours', label: 'Study hours needed', placeholder: '100', type: 'number', suffix: 'hours', helpText: 'Check official requirements' },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['Study in focused blocks', 'Take practice exams', 'Join study groups'],
    },
    {
      id: 'skill-mastery',
      name: 'Master a Skill',
      emoji: '🎯',
      category: 'learning',
      description: 'Become proficient in a new skill',
      smartPrompt: 'Practice {skill} for {hours} hours by {deadline}',
      fields: [
        { key: 'skill', label: 'Skill to master', placeholder: 'e.g., coding, design, public speaking', type: 'text', required: true },
        { key: 'hours', label: 'Practice hours', placeholder: '100', type: 'number', suffix: 'hours', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Deliberate practice beats passive learning', 'Get feedback regularly', 'Build projects to apply skills'],
    },
  ],
  career: [
    {
      id: 'job-search',
      name: 'Land a New Job',
      emoji: '💼',
      category: 'career',
      description: 'Find your dream job',
      smartPrompt: 'Apply to {applications} jobs and get hired by {deadline}',
      fields: [
        { key: 'applications', label: 'Job applications', placeholder: '50', type: 'number', suffix: 'applications', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Quality over quantity', 'Customize each application', 'Network alongside applying'],
    },
    {
      id: 'networking',
      name: 'Grow Your Network',
      emoji: '🤝',
      category: 'career',
      description: 'Build meaningful professional connections',
      smartPrompt: 'Make {connections} new professional connections by {deadline}',
      fields: [
        { key: 'connections', label: 'New connections', placeholder: '24', type: 'number', suffix: 'people', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 180,
      tips: ['Offer value first', 'Follow up within 48 hours', 'Attend industry events'],
    },
    {
      id: 'promotion',
      name: 'Get Promoted',
      emoji: '📈',
      category: 'career',
      description: 'Earn your next promotion',
      smartPrompt: 'Complete {achievements} key achievements for promotion by {deadline}',
      fields: [
        { key: 'achievements', label: 'Key achievements', placeholder: '5', type: 'number', suffix: 'achievements', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 180,
      tips: ['Document your wins', 'Seek stretch assignments', 'Get visibility with leadership'],
    },
  ],
  'side-hustle': [
    {
      id: 'launch-business',
      name: 'Launch Your Business',
      emoji: '🚀',
      category: 'side-hustle',
      description: 'Start your entrepreneurial journey',
      smartPrompt: 'Launch {businessName} and get {customers} customers by {deadline}',
      fields: [
        { key: 'businessName', label: 'Business/Project name', placeholder: 'e.g., My Consulting, Online Store', type: 'text', required: true },
        { key: 'customers', label: 'First customers goal', placeholder: '10', type: 'number', suffix: 'customers' },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Start before you\'re ready', 'Talk to 100 potential customers', 'Launch an MVP first'],
    },
    {
      id: 'income-goal',
      name: 'Side Income Goal',
      emoji: '💵',
      category: 'side-hustle',
      description: 'Build additional income streams',
      smartPrompt: 'Earn {amount} from side hustle by {deadline}',
      fields: [
        { key: 'amount', label: 'Income target', placeholder: '500000', type: 'currency', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Start with skills you have', 'Reinvest early profits', 'Track time vs income'],
    },
    {
      id: 'freelance-clients',
      name: 'Freelance Clients',
      emoji: '👨‍💻',
      category: 'side-hustle',
      description: 'Build a freelance client base',
      smartPrompt: 'Get {clients} paying freelance clients by {deadline}',
      fields: [
        { key: 'clients', label: 'Number of clients', placeholder: '5', type: 'number', suffix: 'clients', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['Build a portfolio first', 'Start on platforms then go direct', 'Ask for referrals'],
    },
  ],
  spiritual: [
    {
      id: 'daily-prayer',
      name: 'Daily Prayer/Meditation',
      emoji: '🙏',
      category: 'spiritual',
      description: 'Deepen your spiritual practice',
      smartPrompt: 'Complete {sessions} prayer/meditation sessions by {deadline}',
      fields: [
        { key: 'sessions', label: 'Number of sessions', placeholder: '90', type: 'number', suffix: 'sessions', required: true },
        { key: 'minutes', label: 'Minutes per session', placeholder: '15', type: 'number', suffix: 'min' },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Same time each day helps', 'Start with 5 minutes', 'Find a quiet space'],
    },
    {
      id: 'scripture-reading',
      name: 'Scripture/Holy Book Reading',
      emoji: '📖',
      category: 'spiritual',
      description: 'Read through sacred texts',
      smartPrompt: 'Read {chapters} chapters of scripture by {deadline}',
      fields: [
        { key: 'chapters', label: 'Chapters to read', placeholder: '365', type: 'number', suffix: 'chapters', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 365,
      tips: ['One chapter a day', 'Journal your reflections', 'Join a study group'],
    },
    {
      id: 'fasting',
      name: 'Fasting Practice',
      emoji: '🕊️',
      category: 'spiritual',
      description: 'Develop a fasting discipline',
      smartPrompt: 'Complete {fasts} fasting days by {deadline}',
      fields: [
        { key: 'fasts', label: 'Fasting days', placeholder: '12', type: 'number', suffix: 'days', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Start with shorter fasts', 'Stay hydrated', 'Combine with prayer/reflection'],
    },
  ],
  'mental-health': [
    {
      id: 'meditation-practice',
      name: 'Meditation Practice',
      emoji: '🧘',
      category: 'mental-health',
      description: 'Build inner peace and clarity',
      smartPrompt: 'Complete {sessions} meditation sessions by {deadline}',
      fields: [
        { key: 'sessions', label: 'Sessions', placeholder: '60', type: 'number', suffix: 'sessions', required: true },
        { key: 'minutes', label: 'Minutes per session', placeholder: '10', type: 'number', suffix: 'min' },
      ],
      frequency: 'daily',
      defaultDuration: 60,
      tips: ['Start with guided meditations', '2 minutes is enough to start', 'Morning works best for many'],
    },
    {
      id: 'journaling',
      name: 'Journaling Habit',
      emoji: '📝',
      category: 'mental-health',
      description: 'Process thoughts through writing',
      smartPrompt: 'Write {entries} journal entries by {deadline}',
      fields: [
        { key: 'entries', label: 'Journal entries', placeholder: '90', type: 'number', suffix: 'entries', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 90,
      tips: ['Write before bed or morning', 'No judgment, just write', 'Try gratitude journaling'],
    },
    {
      id: 'therapy-sessions',
      name: 'Therapy/Counseling',
      emoji: '💬',
      category: 'mental-health',
      description: 'Invest in professional support',
      smartPrompt: 'Attend {sessions} therapy sessions by {deadline}',
      fields: [
        { key: 'sessions', label: 'Sessions', placeholder: '12', type: 'number', suffix: 'sessions', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['Be honest with your therapist', 'Do the homework', 'Give it at least 3 sessions'],
    },
    {
      id: 'digital-detox',
      name: 'Digital Detox',
      emoji: '📵',
      category: 'mental-health',
      description: 'Reduce screen time and reconnect',
      smartPrompt: 'Complete {days} digital detox days by {deadline}',
      fields: [
        { key: 'days', label: 'Detox days', placeholder: '30', type: 'number', suffix: 'days', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 180,
      tips: ['Start with 1 hour phone-free', 'Delete social media apps', 'Replace with real activities'],
    },
  ],
  relationship: [
    {
      id: 'quality-time',
      name: 'Quality Time',
      emoji: '❤️',
      category: 'relationship',
      description: 'Strengthen important relationships',
      smartPrompt: 'Have {sessions} quality time sessions with {person} by {deadline}',
      fields: [
        { key: 'person', label: 'With whom?', placeholder: 'e.g., spouse, kids, parents', type: 'text', required: true },
        { key: 'sessions', label: 'Number of sessions', placeholder: '52', type: 'number', suffix: 'sessions', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 365,
      tips: ['Phone away during time', 'Schedule it like a meeting', 'Be fully present'],
    },
    {
      id: 'date-nights',
      name: 'Date Nights',
      emoji: '💑',
      category: 'relationship',
      description: 'Keep romance alive',
      smartPrompt: 'Plan {dates} date nights by {deadline}',
      fields: [
        { key: 'dates', label: 'Number of dates', placeholder: '24', type: 'number', suffix: 'dates', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Take turns planning', 'Try new experiences together', 'Budget-friendly dates work too'],
    },
    {
      id: 'reconnect-friends',
      name: 'Reconnect with Friends',
      emoji: '👥',
      category: 'relationship',
      description: 'Strengthen friendships',
      smartPrompt: 'Have {meetups} meaningful catch-ups with friends by {deadline}',
      fields: [
        { key: 'meetups', label: 'Number of meetups', placeholder: '24', type: 'number', suffix: 'meetups', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Reach out first', 'Virtual counts too', 'Make it a recurring thing'],
    },
  ],
  content: [
    {
      id: 'youtube-videos',
      name: 'YouTube Channel',
      emoji: '🎬',
      category: 'content',
      description: 'Build your YouTube presence',
      smartPrompt: 'Publish {videos} YouTube videos by {deadline}',
      fields: [
        { key: 'videos', label: 'Number of videos', placeholder: '52', type: 'number', suffix: 'videos', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 365,
      tips: ['Consistency beats perfection', 'Batch record multiple videos', 'Study your analytics'],
    },
    {
      id: 'blog-writing',
      name: 'Blog/Newsletter',
      emoji: '✍️',
      category: 'content',
      description: 'Share your thoughts in writing',
      smartPrompt: 'Publish {posts} blog posts by {deadline}',
      fields: [
        { key: 'posts', label: 'Number of posts', placeholder: '52', type: 'number', suffix: 'posts', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 365,
      tips: ['Write for one person', 'Repurpose across platforms', 'Build an email list'],
    },
    {
      id: 'social-growth',
      name: 'Social Media Growth',
      emoji: '📱',
      category: 'content',
      description: 'Grow your social following',
      smartPrompt: 'Post {posts} pieces of content and reach {followers} followers by {deadline}',
      fields: [
        { key: 'posts', label: 'Posts to create', placeholder: '180', type: 'number', suffix: 'posts', required: true },
        { key: 'followers', label: 'Follower goal', placeholder: '5000', type: 'number', suffix: 'followers' },
      ],
      frequency: 'daily',
      defaultDuration: 180,
      tips: ['Engage more than you post', 'Find your niche', 'Use trending formats'],
    },
    {
      id: 'podcast',
      name: 'Start a Podcast',
      emoji: '🎙️',
      category: 'content',
      description: 'Launch and grow your podcast',
      smartPrompt: 'Publish {episodes} podcast episodes by {deadline}',
      fields: [
        { key: 'episodes', label: 'Number of episodes', placeholder: '24', type: 'number', suffix: 'episodes', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 180,
      tips: ['Batch record episodes', 'Invest in a good mic', 'Get guests for reach'],
    },
  ],
  lifestyle: [
    {
      id: 'morning-routine',
      name: 'Morning Routine',
      emoji: '🌅',
      category: 'lifestyle',
      description: 'Win your mornings, win your days',
      smartPrompt: 'Complete {days} perfect morning routines by {deadline}',
      fields: [
        { key: 'days', label: 'Days', placeholder: '66', type: 'number', suffix: 'days', required: true },
      ],
      frequency: 'daily',
      defaultDuration: 66,
      tips: ['Sleep early to wake early', 'No phone for first hour', 'Include movement'],
    },
    {
      id: 'travel-goals',
      name: 'Travel Goals',
      emoji: '✈️',
      category: 'lifestyle',
      description: 'Explore new places',
      smartPrompt: 'Visit {places} new places by {deadline}',
      fields: [
        { key: 'places', label: 'Places to visit', placeholder: '6', type: 'number', suffix: 'places', required: true },
      ],
      frequency: 'monthly',
      defaultDuration: 365,
      tips: ['Start planning now', 'Mix local and far trips', 'Save specifically for travel'],
    },
    {
      id: 'cooking-skills',
      name: 'Learn to Cook',
      emoji: '👨‍🍳',
      category: 'lifestyle',
      description: 'Master new recipes',
      smartPrompt: 'Cook {recipes} new recipes by {deadline}',
      fields: [
        { key: 'recipes', label: 'New recipes', placeholder: '52', type: 'number', suffix: 'recipes', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 365,
      tips: ['Master basics first', 'Try cuisines from different cultures', 'Meal prep on weekends'],
    },
    {
      id: 'declutter',
      name: 'Declutter & Organize',
      emoji: '🏠',
      category: 'lifestyle',
      description: 'Simplify your living space',
      smartPrompt: 'Declutter {areas} areas of your home by {deadline}',
      fields: [
        { key: 'areas', label: 'Areas to declutter', placeholder: '12', type: 'number', suffix: 'areas', required: true },
      ],
      frequency: 'weekly',
      defaultDuration: 90,
      tips: ['One area at a time', 'If unused for 1 year, donate', 'Before/after photos motivate'],
    },
  ],
};

interface SmartGoalTemplatesProps {
  onSelectTemplate: (template: SmartTemplate, fieldValues: Record<string, string>) => void;
  onCreateCustom: (categoryId: string) => void;
}

export function SmartGoalTemplates({ onSelectTemplate, onCreateCustom }: SmartGoalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SmartTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedTemplate(null);
    setFieldValues({});
  };

  const handleTemplateSelect = (template: SmartTemplate) => {
    setSelectedTemplate(template);
    setFieldValues({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }));
  };

  const handleBack = () => {
    if (selectedTemplate) {
      setSelectedTemplate(null);
      setFieldValues({});
    } else {
      setSelectedCategory(null);
    }
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, fieldValues);
    }
  };

  const isFormValid = () => {
    if (!selectedTemplate) return false;
    return selectedTemplate.fields
      .filter(f => f.required)
      .every(f => fieldValues[f.key]?.trim());
  };

  // Generate smart preview text
  const getPreviewText = () => {
    if (!selectedTemplate) return '';
    let text = selectedTemplate.smartPrompt;
    Object.entries(fieldValues).forEach(([key, value]) => {
      if (value) {
        const field = selectedTemplate.fields.find(f => f.key === key);
        const displayValue = field?.type === 'currency' 
          ? `₦${Number(value).toLocaleString()}`
          : field?.suffix ? `${value} ${field.suffix}` : value;
        text = text.replace(`{${key}}`, displayValue);
      }
    });
    return text.replace(/\{[^}]+\}/g, '___');
  };

  // Category Selection Screen
  if (!selectedCategory) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          What area of your life do you want to improve?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {goalCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "p-3 sm:p-4 rounded-xl border border-border/50 bg-card/50",
                  "hover:bg-card hover:border-primary/50 transition-all text-left group"
                )}
              >
                <span className="text-2xl mb-2 block">{category.emoji}</span>
                <p className="font-medium text-sm mb-0.5">{category.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
        
        {/* Custom Goal Button */}
        <button
          onClick={() => onCreateCustom('custom')}
          className="w-full p-3 rounded-xl border border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-primary"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Create custom goal</span>
        </button>
      </div>
    );
  }

  // Template Selection Screen
  if (!selectedTemplate) {
    const templates = smartTemplates[selectedCategory] || [];
    const category = goalCategories.find(c => c.id === selectedCategory);

    return (
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to categories
        </button>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <span className="text-2xl">{category?.emoji}</span>
          <div>
            <p className="font-medium">{category?.label}</p>
            <p className="text-xs text-muted-foreground">{category?.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                "w-full p-4 rounded-xl border border-border/50 bg-card/50",
                "hover:bg-card hover:border-primary/50 transition-all text-left group"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{template.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {template.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {template.frequency}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ~{template.defaultDuration} days
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* Create Custom in Category */}
        <button
          onClick={() => onCreateCustom(selectedCategory)}
          className="w-full p-3 rounded-xl border border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-primary"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Create custom {category?.label?.toLowerCase()} goal</span>
        </button>
      </div>
    );
  }

  // Template Configuration Screen
  return (
    <div className="space-y-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to templates
      </button>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
        <span className="text-2xl">{selectedTemplate.emoji}</span>
        <div>
          <p className="font-medium">{selectedTemplate.name}</p>
          <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
        </div>
      </div>

      {/* Dynamic Fields */}
      <div className="space-y-4">
        {selectedTemplate.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
              {field.type === 'currency' && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              )}
              <Input
                id={field.key}
                type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
                placeholder={field.placeholder}
                value={fieldValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className={cn(
                  "bg-secondary/50 border-border h-12",
                  field.type === 'currency' && "pl-8"
                )}
              />
              {field.suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {field.suffix}
                </span>
              )}
            </div>
            {field.helpText && (
              <p className="text-xs text-muted-foreground">💡 {field.helpText}</p>
            )}
          </div>
        ))}
      </div>

      {/* Smart Preview */}
      {Object.keys(fieldValues).length > 0 && (
        <div className="p-4 rounded-xl bg-success/10 border border-success/30">
          <p className="text-xs text-muted-foreground mb-1">Your goal:</p>
          <p className="font-medium text-success">{getPreviewText()}</p>
        </div>
      )}

      {/* Tips */}
      {selectedTemplate.tips.length > 0 && (
        <div className="p-3 rounded-xl bg-card/50 border border-border/50">
          <p className="text-xs font-medium mb-2">💡 Pro Tips:</p>
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

      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handleConfirm}
        disabled={!isFormValid()}
      >
        Continue with this goal
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
