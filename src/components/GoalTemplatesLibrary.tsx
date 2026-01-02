import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Target, Clock, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  targetValue: string;
  duration: number; // in months
  difficulty: "easy" | "medium" | "hard";
  estimatedTasks: number;
  tags: string[];
  tips: string[];
}

const goalTemplates: GoalTemplate[] = [
  // Fitness Category
  {
    id: "fitness-weight-loss",
    name: "Lose 20 Pounds",
    description: "Sustainable weight loss through healthy eating and exercise",
    category: "Fitness",
    emoji: "⚖️",
    targetValue: "Lose 20 pounds",
    duration: 6,
    difficulty: "medium",
    estimatedTasks: 180,
    tags: ["weight loss", "health", "exercise", "nutrition"],
    tips: [
      "Focus on sustainable habits over quick results",
      "Track both weight and measurements",
      "Include strength training 2-3 times per week",
      "Stay hydrated and get enough sleep",
    ],
  },
  {
    id: "fitness-marathon",
    name: "Run a Marathon",
    description: "Train for and complete a full marathon (26.2 miles)",
    category: "Fitness",
    emoji: "🏃",
    targetValue: "Complete marathon",
    duration: 6,
    difficulty: "hard",
    estimatedTasks: 168,
    tags: ["running", "endurance", "marathon", "training"],
    tips: [
      "Start with a couch-to-5k program if needed",
      "Include rest days to prevent injury",
      "Gradually increase mileage by no more than 10% per week",
      "Consider working with a running coach",
    ],
  },
  {
    id: "fitness-strength",
    name: "Build Muscle Mass",
    description: "Gain 10 pounds of lean muscle through consistent training",
    category: "Fitness",
    emoji: "💪",
    targetValue: "Gain 10 lbs muscle",
    duration: 6,
    difficulty: "medium",
    estimatedTasks: 126,
    tags: ["strength training", "muscle", "gym", "protein"],
    tips: [
      "Focus on progressive overload",
      "Prioritize compound movements",
      "Ensure adequate protein intake (1.6-2.2g per kg bodyweight)",
      "Track your lifts and aim for consistent improvement",
    ],
  },

  // Learning Category
  {
    id: "learning-spanish",
    name: "Learn Spanish Fluently",
    description: "Achieve conversational fluency in Spanish",
    category: "Learning",
    emoji: "🇪🇸",
    targetValue: "Speak Spanish fluently",
    duration: 12,
    difficulty: "medium",
    estimatedTasks: 365,
    tags: ["language", "spanish", "fluency", "conversation"],
    tips: [
      "Practice speaking daily, even if just 10 minutes",
      "Use language exchange partners or apps like Tandem",
      "Watch Spanish media with subtitles",
      "Join Spanish conversation groups",
    ],
  },
  {
    id: "learning-coding",
    name: "Learn Web Development",
    description: "Master HTML, CSS, JavaScript, and React",
    category: "Learning",
    emoji: "💻",
    targetValue: "Build 5 full-stack projects",
    duration: 9,
    difficulty: "hard",
    estimatedTasks: 270,
    tags: ["programming", "web development", "javascript", "react"],
    tips: [
      "Start with free resources like freeCodeCamp",
      "Build projects, don't just watch tutorials",
      "Contribute to open source projects",
      "Join coding communities like Reddit or Discord",
    ],
  },
  {
    id: "learning-guitar",
    name: "Learn Guitar",
    description: "Learn to play 50 songs on acoustic guitar",
    category: "Learning",
    emoji: "🎸",
    targetValue: "Play 50 songs confidently",
    duration: 12,
    difficulty: "medium",
    estimatedTasks: 365,
    tags: ["music", "guitar", "instrument", "practice"],
    tips: [
      "Practice consistently, even if only 15 minutes daily",
      "Learn music theory alongside playing",
      "Record yourself regularly to track progress",
      "Find a practice buddy or join a music group",
    ],
  },

  // Career Category
  {
    id: "career-promotion",
    name: "Get Promoted",
    description: "Advance to the next level in your career",
    category: "Career",
    emoji: "📈",
    targetValue: "Receive promotion",
    duration: 12,
    difficulty: "hard",
    estimatedTasks: 365,
    tags: ["career", "promotion", "leadership", "skills"],
    tips: [
      "Document your achievements regularly",
      "Seek feedback from your manager",
      "Take on stretch assignments",
      "Network both inside and outside your company",
    ],
  },
  {
    id: "career-side-hustle",
    name: "Start a Side Business",
    description: "Launch a profitable side business generating $1000/month",
    category: "Career",
    emoji: "💼",
    targetValue: "$1000/month revenue",
    duration: 9,
    difficulty: "hard",
    estimatedTasks: 270,
    tags: ["entrepreneurship", "business", "side hustle", "income"],
    tips: [
      "Start small and validate your idea first",
      "Focus on solving a real problem",
      "Automate and systematize processes early",
      "Track expenses meticulously",
    ],
  },

  // Financial Category
  {
    id: "finance-emergency-fund",
    name: "Build Emergency Fund",
    description: "Save 6 months of expenses for financial security",
    category: "Financial",
    emoji: "💰",
    targetValue: "6 months expenses saved",
    duration: 12,
    difficulty: "medium",
    estimatedTasks: 365,
    tags: ["saving", "emergency fund", "financial security", "budgeting"],
    tips: [
      "Calculate your target amount (monthly expenses × 6)",
      "Set up automatic transfers to savings",
      "Cut unnecessary expenses first",
      "Consider high-yield savings accounts",
    ],
  },
  {
    id: "finance-invest",
    name: "Start Investing",
    description: "Build an investment portfolio worth $10,000",
    category: "Financial",
    emoji: "📊",
    targetValue: "$10,000 portfolio",
    duration: 24,
    difficulty: "medium",
    estimatedTasks: 730,
    tags: ["investing", "stocks", "portfolio", "wealth building"],
    tips: [
      "Start with index funds for beginners",
      "Educate yourself before investing",
      "Dollar-cost average to reduce risk",
      "Diversify across different asset classes",
    ],
  },

  // Creative Category
  {
    id: "creative-writing",
    name: "Write a Novel",
    description: "Complete a 80,000-word novel",
    category: "Creative",
    emoji: "✍️",
    targetValue: "80,000 words written",
    duration: 12,
    difficulty: "hard",
    estimatedTasks: 365,
    tags: ["writing", "novel", "creativity", "storytelling"],
    tips: [
      "Set a daily word count goal (500-1000 words)",
      "Write first, edit later",
      "Join writing communities for support",
      "Read widely in your genre",
    ],
  },
  {
    id: "creative-photography",
    name: "Master Photography",
    description: "Build a portfolio of 100 professional-quality photos",
    category: "Creative",
    emoji: "📸",
    targetValue: "100 professional photos",
    duration: 12,
    difficulty: "medium",
    estimatedTasks: 365,
    tags: ["photography", "portfolio", "art", "visual"],
    tips: [
      "Learn the fundamentals: composition, lighting, exposure",
      "Practice with different subjects and conditions",
      "Post-process your photos consistently",
      "Study photography from masters",
    ],
  },

  // Wellness Category
  {
    id: "wellness-meditation",
    name: "Daily Meditation Practice",
    description: "Establish a consistent 20-minute daily meditation habit",
    category: "Wellness",
    emoji: "🧘",
    targetValue: "365 consecutive days",
    duration: 12,
    difficulty: "easy",
    estimatedTasks: 365,
    tags: ["meditation", "mindfulness", "mental health", "wellness"],
    tips: [
      "Start with just 5 minutes if 20 feels overwhelming",
      "Find a consistent time and place",
      "Use guided meditations when starting out",
      "Be patient with a wandering mind",
    ],
  },
  {
    id: "wellness-sleep",
    name: "Improve Sleep Quality",
    description: "Achieve 7-9 hours of quality sleep consistently",
    category: "Wellness",
    emoji: "😴",
    targetValue: "7-9 hours quality sleep",
    duration: 3,
    difficulty: "medium",
    estimatedTasks: 90,
    tags: ["sleep", "health", "rest", "recovery"],
    tips: [
      "Maintain a consistent sleep schedule",
      "Create a relaxing bedtime routine",
      "Limit screen time before bed",
      "Keep your bedroom cool and dark",
    ],
  },
];

interface GoalTemplatesLibraryProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  className?: string;
}

export const GoalTemplatesLibrary = ({
  onSelectTemplate,
  className,
}: GoalTemplatesLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(goalTemplates.map((t) => t.category))),
  ];

  const filteredTemplates = goalTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "hard":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="text-2xl">{template.emoji}</div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {template.category}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {template.duration}mo
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {template.estimatedTasks}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={() => onSelectTemplate(template)}
                className="w-full"
                size="sm"
              >
                Use This Template
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No templates found matching your criteria.
        </div>
      )}
    </div>
  );
};
