import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Target, Calendar, Clock, Trophy, ChevronRight, 
  Edit3, Rocket, Sparkles, Check, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Phase {
  name: string;
  weeks: string;
  description: string;
  milestones: string[];
  target: string;
  badge: string;
}

interface GoalBreakdownPreviewProps {
  goalName: string;
  emoji: string;
  category: string;
  phases: Phase[];
  duration: number;
  dailyCommitment: string;
  successRate: number;
  onEdit: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  answers?: Record<string, string>;
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  fitness: { bg: "from-orange-500/10 to-red-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  financial: { bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  learning: { bg: "from-blue-500/10 to-purple-500/10", border: "border-blue-500/30", text: "text-blue-400" },
  career: { bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  creative: { bg: "from-pink-500/10 to-purple-500/10", border: "border-pink-500/30", text: "text-pink-400" },
  wellness: { bg: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
  relationships: { bg: "from-rose-500/10 to-pink-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  travel: { bg: "from-sky-500/10 to-indigo-500/10", border: "border-sky-500/30", text: "text-sky-400" },
};

export function GoalBreakdownPreview({
  goalName,
  emoji,
  category,
  phases,
  duration,
  dailyCommitment,
  successRate,
  onEdit,
  onConfirm,
  isLoading,
  answers
}: GoalBreakdownPreviewProps) {
  const colors = categoryColors[category] || categoryColors.fitness;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <motion.span 
          className="text-5xl block"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
        >
          {emoji}
        </motion.span>
        <h3 className="text-xl font-bold">{goalName}</h3>
        <p className="text-sm text-muted-foreground">
          Your personalized roadmap to success
        </p>
      </motion.div>
      
      {/* Timeline visualization */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-4 rounded-2xl bg-gradient-to-r border",
          colors.bg, colors.border
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className={cn("w-5 h-5", colors.text)} />
          <span className="font-medium">Your {duration}-Day Journey</span>
        </div>
        
        {/* Phase timeline */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-white/10 rounded-full">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/50 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Phase markers */}
          <div className="relative flex justify-between pt-0">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.2 }}
                className="flex flex-col items-center text-center"
                style={{ width: `${100 / phases.length}%` }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-lg mb-2 border-2",
                  "bg-card border-primary/50"
                )}>
                  {phase.badge}
                </div>
                <span className="text-xs font-medium line-clamp-1 px-1">{phase.name}</span>
                <span className="text-[10px] text-muted-foreground">Weeks {phase.weeks}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Phase cards */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.15 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{phase.badge}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{phase.name}</h4>
                  <span className="text-xs text-muted-foreground">• Weeks {phase.weeks}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {phase.milestones.slice(0, 2).map((milestone, idx) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-primary/10 border border-primary/20"
                    >
                      {milestone}
                    </span>
                  ))}
                  {phase.milestones.length > 2 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">
                      +{phase.milestones.length - 2} more
                    </span>
                  )}
                </div>
                
                <div className={cn("text-xs font-medium", colors.text)}>
                  <Target className="w-3 h-3 inline mr-1" />
                  Target: {phase.target}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Daily commitment */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Daily Commitment</p>
            <p className="text-sm text-muted-foreground">{dailyCommitment}</p>
          </div>
        </div>
      </motion.div>
      
      {/* Success metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 rounded-xl bg-success/10 border border-success/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-success">Success Rate</p>
            <p className="text-sm text-muted-foreground">
              Users who complete Phase 1 have an {successRate}% goal completion rate
            </p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          *Based on aggregated user data
        </p>
      </motion.div>
      
      {/* Motivation reminder */}
      {answers?.motivation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-4 rounded-xl bg-white/5 border border-white/10"
        >
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Your Why</p>
              <p className="text-sm text-muted-foreground italic">"{answers.motivation}"</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Action buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex gap-3 pt-2"
      >
        <Button
          variant="outline"
          onClick={onEdit}
          className="flex-1 gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Plan
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Creating...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Start My Journey
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
