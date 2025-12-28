import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Users, Dumbbell, DollarSign, BookOpen, 
  Briefcase, Palette, ChevronRight, Sparkles, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface GoalTemplateDB {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  default_duration_days: number;
  template_phases: any[];
  clarifying_questions: any[];
  daily_task_patterns: any[];
  participant_count: number;
  success_rate: number;
}

interface TemplateBrowserProps {
  onSelectTemplate: (template: GoalTemplateDB) => void;
  onCreateCustom: () => void;
  categoryFilter?: string;
}

const categoryIcons: Record<string, any> = {
  fitness: Dumbbell,
  financial: DollarSign,
  learning: BookOpen,
  career: Briefcase,
  creative: Palette,
};

const categoryColors: Record<string, string> = {
  fitness: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  financial: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  learning: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
  career: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  creative: "from-pink-500/20 to-purple-500/20 border-pink-500/30",
};

const categories = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'financial', label: 'Financial', emoji: '💰' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'career', label: 'Career', emoji: '🚀' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
];

export function TemplateBrowser({ 
  onSelectTemplate, 
  onCreateCustom,
  categoryFilter 
}: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<GoalTemplateDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_templates')
        .select('*')
        .order('participant_count', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data to our type (the JSONB fields come as any)
      setTemplates(data as GoalTemplateDB[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const formatParticipants = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/5 border-white/10"
        />
      </div>
      
      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all",
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 hover:bg-white/10 text-muted-foreground"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
      
      {/* Templates grid */}
      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => {
            const Icon = categoryIcons[template.category] || Sparkles;
            
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all border group",
                  "bg-gradient-to-r hover:scale-[1.02]",
                  categoryColors[template.category] || "from-white/5 to-white/10 border-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{template.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold line-clamp-1">{template.name}</h4>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {formatParticipants(template.participant_count)} crushing it
                      </span>
                      <span className="flex items-center gap-1 text-success">
                        <TrendingUp className="w-3 h-3" />
                        {template.success_rate}% success
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No templates found</p>
            <Button 
              variant="link" 
              onClick={onCreateCustom}
              className="mt-2"
            >
              Create a custom goal instead
            </Button>
          </div>
        )}
      </div>
      
      {/* Create custom option */}
      <button
        onClick={onCreateCustom}
        className="w-full p-4 rounded-xl border border-dashed border-white/20 hover:border-primary/50 transition-colors text-center group"
      >
        <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
          <Sparkles className="w-5 h-5" />
          <span>Create a custom goal</span>
        </div>
      </button>
    </div>
  );
}
