import { useState, useMemo } from "react";
import {
  Briefcase,
  DollarSign,
  BookOpen,
  Sparkles,
  Heart,
  Dumbbell,
  TrendingUp,
  Palette,
  Users,
  Brain,
  Target,
  Scale,
  Flame,
  GraduationCap,
  Wallet,
  Rocket,
  Handshake,
  PenTool,
  Mic,
  Globe,
  Zap,
  Trophy,
  Plus,
  Coffee,
  Cigarette,
  Clock,
  Utensils,
  Moon,
  Droplets,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { goalCategories } from "@/constants/goalCategories";

// Challenge-based goal template
export interface PopularGoalTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  description: string;
  participants: number;
  frequency: "daily" | "weekly" | "monthly";
  defaultDuration: number; // days
  smartType: "simple" | "measured" | "habit";
  targetLabel?: string;
  targetPlaceholder?: string;
  targetSuffix?: string;
  tips: string[];
  actionVerb?: string;
  customInputLabel?: string;
  customInputPlaceholder?: string;
  badge?: string; // Challenge badge emoji
}

// Challenge-based templates - Focus on achievable durations (7, 14, 21, 30, 60, 90 days)
const popularTemplates: PopularGoalTemplate[] = [
  // 🔥 POPULAR CHALLENGES (7-30 days)
  {
    id: "21-day-discipline",
    name: "21-Day Discipline Challenge",
    icon: Target,
    category: "popular",
    description:
      "Build unbreakable habits: exercise, healthy eating, learning, and reflection daily",
    participants: 1240,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Complete all discipline requirements",
    badge: "🎯",
    tips: [
      "Exercise for 30+ minutes daily",
      "Eat clean, whole foods",
      "Learn something new (10-15 min)",
      "Reflect on your progress",
      "Stay consistent, not perfect",
    ],
  },
  {
    id: "30-day-no-sugar",
    name: "30-Day No Sugar Challenge",
    icon: Utensils,
    category: "popular",
    description: "Eliminate added sugars for 30 days",
    participants: 890,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Stay sugar-free today",
    badge: "🍎",
    tips: [
      "Read food labels carefully",
      "Prepare meals at home",
      "Replace with fruits when craving",
    ],
  },
  {
    id: "21-day-gratitude",
    name: "21-Day Gratitude Challenge",
    icon: Heart,
    category: "popular",
    description: "Write 3 things you're grateful for daily",
    participants: 720,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Write 3 gratitude items",
    badge: "🙏",
    tips: [
      "Do it first thing in morning",
      "Be specific, not generic",
      "Include people in your life",
    ],
  },
  {
    id: "7-day-digital-detox",
    name: "7-Day Digital Detox",
    icon: Zap,
    category: "popular",
    description: "No social media or unnecessary screen time for 7 days",
    participants: 650,
    frequency: "daily",
    defaultDuration: 7,
    smartType: "habit",
    actionVerb: "Stay off social media",
    badge: "📵",
    tips: [
      "Delete apps from phone",
      "Use app blockers",
      "Replace with reading or exercise",
    ],
  },
  {
    id: "30-day-cold-shower",
    name: "30-Day Cold Shower Challenge",
    icon: Droplets,
    category: "popular",
    description: "Take a cold shower every day for 30 days",
    participants: 580,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Take a cold shower",
    badge: "🧊",
    tips: [
      "Start with 30 seconds cold at end",
      "Deep breathing helps",
      "Builds mental resilience",
    ],
  },

  // 💪 FITNESS CHALLENGES
  {
    id: "30-day-plank",
    name: "30-Day Plank Challenge",
    icon: Dumbbell,
    category: "fitness",
    description: "Hold plank for increasing durations each day",
    participants: 920,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Complete plank hold",
    badge: "💪",
    tips: [
      "Start with 20 seconds",
      "Add 10 seconds every few days",
      "Keep your core tight",
    ],
  },
  {
    id: "10k-steps-30-days",
    name: "10K Steps for 30 Days",
    icon: Flame,
    category: "fitness",
    description: "Walk 10,000 steps every day for 30 days",
    participants: 1130,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Complete 10,000 steps",
    badge: "🚶",
    tips: [
      "Take stairs instead of elevator",
      "Walk during lunch break",
      "Park farther away",
    ],
  },
  {
    id: "30-day-pushup",
    name: "30-Day Push-Up Challenge",
    icon: Dumbbell,
    category: "fitness",
    description: "Do push-ups every day, increasing reps",
    participants: 780,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Complete push-ups",
    badge: "🏋️",
    tips: [
      "Start with 10 reps",
      "Add 5 reps every 3 days",
      "Proper form over quantity",
    ],
  },
  {
    id: "21-day-yoga",
    name: "21-Day Yoga Challenge",
    icon: Brain,
    category: "fitness",
    description: "Practice yoga for at least 15 minutes daily",
    participants: 690,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Complete yoga session",
    badge: "🧘",
    tips: [
      "Follow YouTube yoga videos",
      "Morning or evening works best",
      "Start with gentle flows",
    ],
  },
  {
    id: "90-day-gym",
    name: "90-Day Gym Transformation",
    icon: Scale,
    category: "fitness",
    description: "Go to the gym 4-5x per week for 90 days",
    participants: 850,
    frequency: "daily",
    defaultDuration: 90,
    smartType: "measured",
    targetLabel: "How many kg do you want to lose?",
    targetPlaceholder: "10",
    targetSuffix: "kg",
    actionVerb: "Complete gym session",
    badge: "🏆",
    tips: [
      "Track calories with an app",
      "Mix strength + cardio",
      "Take progress photos weekly",
    ],
  },
  {
    id: "30-day-water",
    name: "30-Day Hydration Challenge",
    icon: Coffee,
    category: "fitness",
    description: "Drink 8 glasses of water every day",
    participants: 740,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Drink 8 glasses of water",
    badge: "💧",
    tips: [
      "Carry a water bottle everywhere",
      "Set hourly reminders",
      "Drink before each meal",
    ],
  },

  // 💰 FINANCE CHALLENGES
  {
    id: "30-day-no-spend",
    name: "30-Day No-Spend Challenge",
    icon: Wallet,
    category: "finance",
    description: "Only spend on essentials for 30 days",
    participants: 620,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "No non-essential spending today",
    badge: "💵",
    tips: [
      "Define essentials clearly upfront",
      "Unsubscribe from promo emails",
      "Avoid browsing online shops",
    ],
  },
  {
    id: "30-day-save",
    name: "30-Day Savings Challenge",
    icon: DollarSign,
    category: "finance",
    description: "Save a set amount every day for 30 days",
    participants: 710,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "measured",
    targetLabel: "Daily amount to save",
    targetPlaceholder: "500",
    targetSuffix: "",
    actionVerb: "Transfer to savings",
    badge: "🏦",
    tips: [
      "Automate daily transfers",
      "Start small, stay consistent",
      "Watch your total grow",
    ],
  },
  {
    id: "60-day-budget",
    name: "60-Day Budget Mastery",
    icon: TrendingUp,
    category: "finance",
    description: "Track every expense for 60 days",
    participants: 480,
    frequency: "daily",
    defaultDuration: 60,
    smartType: "habit",
    actionVerb: "Log all expenses today",
    badge: "📊",
    tips: ["Use a budgeting app", "Categorize all spending", "Review weekly"],
  },

  // 📚 LEARNING CHALLENGES
  {
    id: "30-day-reading",
    name: "30-Day Reading Challenge",
    icon: BookOpen,
    category: "learning",
    description: "Read for 30 minutes every day",
    participants: 950,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Read for 30 minutes",
    badge: "📖",
    tips: [
      "Keep book on nightstand",
      "Read before bed",
      "No phones while reading",
    ],
  },
  {
    id: "30-day-language",
    name: "30-Day Language Challenge",
    icon: Globe,
    category: "learning",
    description: "Practice a new language for 15 minutes daily",
    participants: 810,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Complete language lesson",
    customInputLabel: "Which language?",
    customInputPlaceholder: "e.g. Spanish, French, Japanese",
    badge: "🗣️",
    tips: [
      "Use Duolingo or similar app",
      "Consistency beats intensity",
      "Practice speaking out loud",
    ],
  },
  {
    id: "21-day-skill",
    name: "21-Day New Skill Challenge",
    icon: GraduationCap,
    category: "learning",
    description: "Dedicate 1 hour daily to learning a new skill",
    participants: 560,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Practice for 1 hour",
    customInputLabel: "What skill?",
    customInputPlaceholder: "e.g. Coding, Guitar, Design",
    badge: "🎓",
    tips: [
      "Block same time each day",
      "Use tutorials and courses",
      "Build a small project",
    ],
  },

  // 🧠 WELLNESS CHALLENGES
  {
    id: "21-day-meditation",
    name: "21-Day Meditation Challenge",
    icon: Brain,
    category: "wellness",
    description: "Meditate for 10 minutes every day",
    participants: 870,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Complete 10 min meditation",
    badge: "🧘",
    tips: [
      "Start with 5 minutes if needed",
      "Use Headspace or Calm",
      "Morning works best",
    ],
  },
  {
    id: "21-day-prayer",
    name: "21-Day Prayer Challenge",
    icon: Heart,
    category: "spiritual",
    description: "Spend 10 minutes in prayer or reflection daily",
    participants: 640,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Complete 10 min prayer time",
    badge: "🙏",
    tips: [
      "Find a quiet space",
      "Focus on gratitude and guidance",
      "Make it part of your daily routine",
    ],
  },
  {
    id: "21-day-fasting",
    name: "21-Day Fasting Challenge",
    icon: Coffee,
    category: "spiritual",
    description:
      "Dedicate time to fasting and prayer for spiritual growth and connection with God",
    participants: 580,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Complete fasting period with prayer",
    badge: "🍽️",
    tips: [
      "Read your Bible during fasting time",
      "Limit social media and distractions",
      "Use fasting time for focused prayer",
      "Seek God's guidance and wisdom",
    ],
  },
  {
    id: "30-day-journal",
    name: "30-Day Journaling Challenge",
    icon: PenTool,
    category: "wellness",
    description: "Write in your journal every day",
    participants: 630,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Write 1 journal entry",
    badge: "📝",
    tips: [
      "Write same time daily",
      "No editing, just flow",
      "Include gratitude and goals",
    ],
  },
  {
    id: "14-day-sleep",
    name: "14-Day Sleep Challenge",
    icon: Moon,
    category: "wellness",
    description: "Be in bed by 10PM every night",
    participants: 540,
    frequency: "daily",
    defaultDuration: 14,
    smartType: "habit",
    actionVerb: "In bed by 10PM",
    badge: "😴",
    tips: [
      "No screens after 9PM",
      "Set bedtime alarm",
      "Keep bedroom cool and dark",
    ],
  },
  {
    id: "30-day-quit-smoking",
    name: "30-Day Quit Smoking",
    icon: Cigarette,
    category: "wellness",
    description: "Stay smoke-free for 30 days",
    participants: 420,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Stay smoke-free today",
    badge: "🚭",
    tips: [
      "Use nicotine replacement if needed",
      "Avoid triggers",
      "Celebrate each smoke-free day",
    ],
  },

  // ✨ LIFESTYLE CHALLENGES
  {
    id: "21-day-wake-early",
    name: "21-Day Early Riser Challenge",
    icon: Clock,
    category: "lifestyle",
    description: "Wake up at 5AM or 6AM every day",
    participants: 760,
    frequency: "daily",
    defaultDuration: 21,
    smartType: "habit",
    actionVerb: "Wake up early",
    badge: "⏰",
    tips: [
      "Sleep by 10PM",
      "Put alarm across the room",
      "Have a morning routine ready",
    ],
  },
  {
    id: "30-day-clean",
    name: "30-Day Declutter Challenge",
    icon: Sparkles,
    category: "lifestyle",
    description: "Declutter one area of your home each day",
    participants: 510,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Declutter one area",
    badge: "🏠",
    tips: [
      "Start small - one drawer",
      "Donate what you don't need",
      "Take before/after photos",
    ],
  },
  {
    id: "14-day-no-complaining",
    name: "14-Day No Complaints Challenge",
    icon: Heart,
    category: "lifestyle",
    description: "Go 14 days without complaining",
    participants: 430,
    frequency: "daily",
    defaultDuration: 14,
    smartType: "habit",
    actionVerb: "No complaints today",
    badge: "😊",
    tips: [
      "Replace complaints with gratitude",
      "Use a rubber band reminder",
      "Focus on solutions not problems",
    ],
  },

  // 🎬 CONTENT CHALLENGES
  {
    id: "30-day-post",
    name: "30-Day Content Challenge",
    icon: Mic,
    category: "content",
    description: "Post content every day for 30 days",
    participants: 680,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "habit",
    actionVerb: "Post content today",
    customInputLabel: "Which platform?",
    customInputPlaceholder: "e.g. Instagram, TikTok, Twitter",
    badge: "📱",
    tips: [
      "Batch create content in advance",
      "Consistency beats perfection",
      "Engage with your audience",
    ],
  },
  {
    id: "30-day-writing",
    name: "30-Day Writing Challenge",
    icon: PenTool,
    category: "content",
    description: "Write 500 words every day",
    participants: 520,
    frequency: "daily",
    defaultDuration: 30,
    smartType: "measured",
    targetLabel: "Total words to write",
    targetPlaceholder: "15000",
    targetSuffix: "words",
    actionVerb: "Write 500 words",
    badge: "✍️",
    tips: [
      "Write at same time daily",
      "Don't edit while writing",
      "Just get words on the page",
    ],
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
  frequency: "daily" | "weekly" | "monthly";
}

export function SmartGoalTemplates({
  onSelectTemplate,
  onCreateCustom,
}: SmartGoalTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTemplates = useMemo(() => {
    const templates =
      selectedCategory === "all"
        ? popularTemplates
        : popularTemplates.filter((t) => t.category === selectedCategory);
    return templates.sort((a, b) => b.participants - a.participants);
  }, [selectedCategory]);

  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-lg font-bold text-foreground">
          Choose Your Challenge
        </h2>
        <p className="text-sm text-muted-foreground">
          Join thousands crushing their goals with proven challenges
        </p>
      </div>

      {/* Custom Goal Button - More Prominent */}
      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
        onClick={onCreateCustom}
      >
        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
        <span className="font-medium">Create Custom Challenge</span>
      </Button>

      {/* Category Filter - Improved Design */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Filter by Category
        </p>
        <div className="flex flex-wrap gap-2">
          {goalCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                    : "bg-secondary/50 border-border hover:bg-secondary hover:border-primary/30 hover:scale-102 text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge Templates Grid - Enhanced Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {selectedCategory === "all"
              ? "All Challenges"
              : `${
                  goalCategories.find((c) => c.id === selectedCategory)?.label
                } Challenges`}
          </p>
          <p className="text-xs text-muted-foreground">
            {filteredTemplates.length} available
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="group relative p-4 rounded-xl border border-border bg-gradient-to-br from-secondary/30 to-secondary/10 hover:from-primary/5 hover:to-primary/10 hover:border-primary/30 transition-all duration-300 text-left hover:shadow-lg hover:scale-[1.02] overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Icon className="w-full h-full" />
                </div>

                {/* Badge and Icon */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-lg group-hover:scale-110 transition-transform duration-200">
                    {template.badge || "🎯"}
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm leading-tight mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                      {template.defaultDuration}d
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{formatParticipants(template.participants)}</span>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
