import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  unit?: string;
  options?: string[];
}

interface ClarifyingQuestionsProps {
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: () => void;
  category: string;
}

const categoryGradients: Record<string, string> = {
  fitness: "from-orange-500/20 to-red-500/20",
  financial: "from-emerald-500/20 to-teal-500/20",
  learning: "from-blue-500/20 to-purple-500/20",
  career: "from-amber-500/20 to-orange-500/20",
  creative: "from-pink-500/20 to-purple-500/20",
  wellness: "from-cyan-500/20 to-blue-500/20",
  relationships: "from-rose-500/20 to-pink-500/20",
  travel: "from-sky-500/20 to-indigo-500/20",
};

export function ClarifyingQuestions({ 
  questions, 
  answers, 
  onAnswer, 
  onComplete,
  category 
}: ClarifyingQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] || '';
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  
  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentAnswer && currentQuestion.type !== 'text') {
      handleNext();
    }
  };
  
  const canProceed = currentAnswer.trim().length > 0;
  
  if (!currentQuestion) return null;
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Getting to know your goal</span>
          <span>{currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "p-6 rounded-2xl bg-gradient-to-br border border-white/10",
            categoryGradients[category] || "from-primary/20 to-primary/5"
          )}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <motion.p 
              className="text-lg font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {currentQuestion.question}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentQuestion.type === 'select' && currentQuestion.options ? (
              <div className="grid gap-2">
                {currentQuestion.options.map((option, idx) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    onClick={() => {
                      onAnswer(currentQuestion.id, option);
                      setTimeout(handleNext, 300);
                    }}
                    className={cn(
                      "p-3 rounded-xl text-left transition-all border",
                      currentAnswer === option 
                        ? "bg-primary/20 border-primary/50 text-foreground"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : currentQuestion.type === 'number' ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  {currentQuestion.unit && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currentQuestion.unit}
                    </span>
                  )}
                  <Input
                    type="number"
                    value={currentAnswer}
                    onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={currentQuestion.placeholder}
                    className={cn(
                      "h-12 bg-white/5 border-white/20 text-lg",
                      currentQuestion.unit && "pl-8"
                    )}
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              <Textarea
                value={currentAnswer}
                onChange={(e) => {
                  onAnswer(currentQuestion.id, e.target.value);
                  setIsTyping(true);
                }}
                onBlur={() => setIsTyping(false)}
                placeholder={currentQuestion.placeholder}
                className="bg-white/5 border-white/20 min-h-[80px] resize-none"
                autoFocus
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      {currentQuestion.type !== 'select' && (
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {isLastQuestion ? "See Your Plan" : "Continue"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
      
      {/* Skip option for optional questions */}
      {currentQuestion.id !== 'motivation' && currentQuestion.type !== 'select' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleNext}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip this question
        </motion.button>
      )}
    </div>
  );
}
