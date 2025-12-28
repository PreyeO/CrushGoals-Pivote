-- Add goal_metadata column to goals table
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS goal_metadata JSONB DEFAULT '{}'::jsonb;

-- Create goal_templates table
CREATE TABLE public.goal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎯',
  description TEXT NOT NULL,
  default_duration_days INTEGER NOT NULL DEFAULT 90,
  template_phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  clarifying_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_task_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 85,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read templates
CREATE POLICY "Anyone can view templates" 
ON public.goal_templates 
FOR SELECT 
USING (true);

-- Only admins can modify templates
CREATE POLICY "Admins can manage templates" 
ON public.goal_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert the 15 pre-built templates
INSERT INTO public.goal_templates (name, category, emoji, description, default_duration_days, template_phases, clarifying_questions, daily_task_patterns, participant_count, success_rate) VALUES
-- FITNESS TEMPLATES
('Drop 10kg in 3 Months', 'fitness', '🏃', 'A proven 3-phase system to lose 10kg through sustainable habits, not crash diets.', 90, 
  '[{"name": "Foundation", "weeks": "1-4", "description": "Build healthy habits", "milestones": ["Track all meals for 7 days", "Establish exercise routine", "Reduce sugar intake by 50%"], "target": "Lose 3kg", "badge": "🌱"},
    {"name": "Acceleration", "weeks": "5-8", "description": "Increase intensity", "milestones": ["Hit calorie target 6 days/week", "Complete 4 workouts/week", "Meal prep consistently"], "target": "Lose 4kg", "badge": "🔥"},
    {"name": "Final Push", "weeks": "9-12", "description": "Maintain and intensify", "milestones": ["Maintain deficit", "HIIT 2x/week", "Hit goal weight"], "target": "Lose 3kg", "badge": "🏆"}]'::jsonb,
  '[{"id": "starting_weight", "question": "What''s your current weight?", "type": "number", "unit": "kg", "placeholder": "e.g., 85"},
    {"id": "target_weight", "question": "What''s your goal weight?", "type": "number", "unit": "kg", "placeholder": "e.g., 75"},
    {"id": "workout_frequency", "question": "How many days can you work out per week?", "type": "select", "options": ["2 days", "3 days", "4 days", "5+ days"]},
    {"id": "motivation", "question": "Why is this important to you?", "type": "text", "placeholder": "What''s driving this goal?"}]'::jsonb,
  '[{"condition": "workout_frequency == ''2 days''", "tasks": ["30-min walk", "Track calories", "8 glasses water"], "calorie_adjustment": -300},
    {"condition": "workout_frequency == ''4 days''", "tasks": ["Strength training", "Track calories", "High protein meal"], "calorie_adjustment": -500}]'::jsonb,
  1247, 87),

('Build Muscle Mass', 'fitness', '💪', 'Pack on lean muscle with progressive overload training and proper nutrition.', 120,
  '[{"name": "Strength Foundation", "weeks": "1-4", "description": "Master form and build base", "milestones": ["Learn compound lifts", "Establish protein intake", "Track workouts"], "target": "Build routine", "badge": "🎯"},
    {"name": "Progressive Overload", "weeks": "5-12", "description": "Systematic strength gains", "milestones": ["Increase weights weekly", "Hit protein goals daily", "4 workouts/week minimum"], "target": "Increase lifts 20%", "badge": "📈"},
    {"name": "Peak Training", "weeks": "13-16", "description": "Maximum intensity", "milestones": ["Personal records", "Optimal recovery", "Visible gains"], "target": "Visible muscle gain", "badge": "💪"}]'::jsonb,
  '[{"id": "current_level", "question": "What''s your current fitness level?", "type": "select", "options": ["Complete beginner", "Some gym experience", "Regular gym-goer", "Advanced lifter"]},
    {"id": "target_area", "question": "Any areas you want to focus on?", "type": "select", "options": ["Overall muscle", "Upper body", "Lower body", "Core strength"]},
    {"id": "equipment", "question": "What equipment do you have access to?", "type": "select", "options": ["Full gym", "Home gym", "Minimal equipment"]},
    {"id": "motivation", "question": "What''s your ''why'' for building muscle?", "type": "text", "placeholder": "Your deeper motivation..."}]'::jsonb,
  '[{"condition": "current_level == ''Complete beginner''", "tasks": ["Watch form video", "Practice bodyweight exercises", "Track protein intake"]},
    {"condition": "equipment == ''Full gym''", "tasks": ["Compound lift session", "Accessory work", "Stretching routine"]}]'::jsonb,
  892, 82),

('Run Your First 5K', 'fitness', '🏅', 'Go from zero to 5K with a gentle walk-to-run program designed for beginners.', 60,
  '[{"name": "Walk-Run Intervals", "weeks": "1-3", "description": "Build cardio base", "milestones": ["Complete 3 sessions/week", "Walk 30 min without stopping", "Jog for 1 minute"], "target": "Build habit", "badge": "👟"},
    {"name": "Build Endurance", "weeks": "4-6", "description": "Increase running time", "milestones": ["Run 2 min intervals", "Run for 10 minutes straight", "Complete 3K distance"], "target": "Run 3K", "badge": "🌟"},
    {"name": "Race Prep", "weeks": "7-8", "description": "Final push to 5K", "milestones": ["Run 4K without stopping", "Practice race pace", "Complete 5K!"], "target": "Run 5K", "badge": "🏅"}]'::jsonb,
  '[{"id": "current_activity", "question": "How active are you currently?", "type": "select", "options": ["Sedentary (desk job)", "Light activity", "Moderately active", "Already exercise regularly"]},
    {"id": "running_experience", "question": "Any running experience?", "type": "select", "options": ["Never run before", "Used to run", "Run occasionally", "Regular runner"]},
    {"id": "motivation", "question": "Why do you want to run 5K?", "type": "text", "placeholder": "A race? Health? Challenge yourself?"}]'::jsonb,
  '[{"condition": "current_activity == ''Sedentary (desk job)''", "tasks": ["10-min walk", "Walk-jog intervals", "Stretch routine"], "intensity": "low"},
    {"condition": "running_experience == ''Regular runner''", "tasks": ["Tempo run", "Interval training", "Long slow run"], "intensity": "high"}]'::jsonb,
  2341, 91),

('100 Pushups Challenge', 'fitness', '🔥', 'Build up to 100 consecutive pushups with a progressive daily plan.', 42,
  '[{"name": "Foundation", "weeks": "1-2", "description": "Build base strength", "milestones": ["10 pushups in a row", "Proper form mastered", "Daily practice habit"], "target": "10 pushups", "badge": "💪"},
    {"name": "Building", "weeks": "3-4", "description": "Increase volume", "milestones": ["25 pushups in a row", "Multiple daily sets", "Core strength improved"], "target": "25 pushups", "badge": "⚡"},
    {"name": "Peak", "weeks": "5-6", "description": "Final push", "milestones": ["50+ pushups", "Recovery optimized", "100 pushup attempt"], "target": "100 pushups", "badge": "🏆"}]'::jsonb,
  '[{"id": "current_max", "question": "How many pushups can you do right now?", "type": "number", "placeholder": "Your current max"},
    {"id": "form_knowledge", "question": "How confident are you in your pushup form?", "type": "select", "options": ["Not sure if correct", "Pretty good", "Perfect form"]},
    {"id": "motivation", "question": "Why 100 pushups?", "type": "text", "placeholder": "What drives this goal?"}]'::jsonb,
  '[{"condition": "current_max < 10", "tasks": ["Wall pushups", "Knee pushups", "Plank holds"], "starting_reps": 5},
    {"condition": "current_max >= 20", "tasks": ["Standard pushups", "Diamond pushups", "Wide pushups"], "starting_reps": 30}]'::jsonb,
  1823, 78),

-- FINANCIAL TEMPLATES
('Save ₦500k This Year', 'financial', '💰', 'Build a solid savings habit with monthly targets and automatic tracking.', 365,
  '[{"name": "Foundation", "weeks": "1-12", "description": "Build savings habit", "milestones": ["Track all expenses", "Identify savings opportunities", "Save ₦125k"], "target": "₦125,000", "badge": "🌱"},
    {"name": "Momentum", "weeks": "13-36", "description": "Increase savings rate", "milestones": ["Reduce unnecessary spending", "Side income exploration", "Save ₦250k more"], "target": "₦375,000 total", "badge": "📈"},
    {"name": "Final Push", "weeks": "37-52", "description": "Hit the target", "milestones": ["Maintain consistency", "Bonus savings", "Celebrate ₦500k!"], "target": "₦500,000", "badge": "💰"}]'::jsonb,
  '[{"id": "current_savings", "question": "How much do you currently have saved?", "type": "number", "unit": "₦", "placeholder": "Current savings amount"},
    {"id": "monthly_income", "question": "What''s your monthly income?", "type": "number", "unit": "₦", "placeholder": "Your monthly income"},
    {"id": "savings_purpose", "question": "What are you saving for?", "type": "text", "placeholder": "Emergency fund, house, vacation..."}]'::jsonb,
  '[{"condition": "true", "tasks": ["Log daily expenses", "Review yesterday''s spending", "No-spend challenge check"]}]'::jsonb,
  956, 73),

('Emergency Fund (6 Months)', 'financial', '🛡️', 'Build a safety net covering 6 months of expenses for peace of mind.', 270,
  '[{"name": "Month 1", "weeks": "1-4", "description": "First month covered", "milestones": ["Calculate monthly expenses", "Set up savings account", "Save 1 month expenses"], "target": "1 month saved", "badge": "🌱"},
    {"name": "Months 2-3", "weeks": "5-12", "description": "Build momentum", "milestones": ["Automate savings", "Cut one expense", "Reach 3 months"], "target": "3 months saved", "badge": "🛡️"},
    {"name": "Months 4-6", "weeks": "13-36", "description": "Complete the fund", "milestones": ["Maintain discipline", "Increase savings rate", "6 months secured!"], "target": "6 months saved", "badge": "🏆"}]'::jsonb,
  '[{"id": "monthly_expenses", "question": "What are your essential monthly expenses?", "type": "number", "unit": "₦", "placeholder": "Rent, food, transport, bills..."},
    {"id": "current_saved", "question": "How much emergency savings do you have now?", "type": "number", "unit": "₦", "placeholder": "Current amount"},
    {"id": "motivation", "question": "What would having 6 months saved mean to you?", "type": "text", "placeholder": "Peace of mind, freedom..."}]'::jsonb,
  '[{"condition": "true", "tasks": ["Check savings progress", "Review spending", "Find one thing to skip"]}]'::jsonb,
  1432, 68),

('Pay Off Debt Fast', 'financial', '🎯', 'Crush your debt using proven snowball/avalanche strategies.', 180,
  '[{"name": "Assessment", "weeks": "1-2", "description": "Know your enemy", "milestones": ["List all debts", "Calculate total owed", "Choose strategy"], "target": "Clear plan", "badge": "📋"},
    {"name": "Attack Mode", "weeks": "3-20", "description": "Aggressive payoff", "milestones": ["Pay minimums + extra", "Clear first debt", "Momentum building"], "target": "50% paid", "badge": "⚔️"},
    {"name": "Freedom", "weeks": "21-26", "description": "Final debts", "milestones": ["Accelerate payments", "Almost there", "DEBT FREE!"], "target": "100% paid", "badge": "🎉"}]'::jsonb,
  '[{"id": "total_debt", "question": "What''s your total debt amount?", "type": "number", "unit": "₦", "placeholder": "Total across all debts"},
    {"id": "debt_count", "question": "How many separate debts do you have?", "type": "number", "placeholder": "Number of debts"},
    {"id": "monthly_payment", "question": "How much can you put toward debt monthly?", "type": "number", "unit": "₦", "placeholder": "Amount you can commit"},
    {"id": "motivation", "question": "What will being debt-free feel like?", "type": "text", "placeholder": "Freedom, relief..."}]'::jsonb,
  '[{"condition": "true", "tasks": ["Make debt payment", "Track remaining balance", "Find extra ₦500 to throw at debt"]}]'::jsonb,
  789, 76),

('Side Hustle ₦100k/Month', 'financial', '🚀', 'Build a side income stream that generates ₦100k monthly.', 120,
  '[{"name": "Discovery", "weeks": "1-4", "description": "Find your hustle", "milestones": ["Identify skills", "Research opportunities", "Choose your path"], "target": "Clear direction", "badge": "🔍"},
    {"name": "First Clients", "weeks": "5-10", "description": "Get paying customers", "milestones": ["Create offering", "First client", "₦25k earned"], "target": "₦25,000/month", "badge": "💵"},
    {"name": "Scale Up", "weeks": "11-16", "description": "Grow to ₦100k", "milestones": ["Refine process", "More clients", "Hit ₦100k!"], "target": "₦100,000/month", "badge": "🚀"}]'::jsonb,
  '[{"id": "skills", "question": "What skills or knowledge do you have?", "type": "text", "placeholder": "Writing, design, coding, teaching..."},
    {"id": "time_available", "question": "How many hours per week can you dedicate?", "type": "select", "options": ["5-10 hours", "10-20 hours", "20+ hours"]},
    {"id": "motivation", "question": "What would an extra ₦100k/month change?", "type": "text", "placeholder": "What becomes possible?"}]'::jsonb,
  '[{"condition": "time_available == ''5-10 hours''", "tasks": ["1 hour skill work", "Client outreach", "Content creation"]},
    {"condition": "time_available == ''20+ hours''", "tasks": ["4 hours service delivery", "Marketing", "Client calls"]}]'::jsonb,
  2156, 64),

-- LEARNING TEMPLATES
('Read 24 Books This Year', 'learning', '📚', 'Build a consistent reading habit - that''s just 2 books per month!', 365,
  '[{"name": "Habit Building", "weeks": "1-12", "description": "Make reading daily", "milestones": ["Read 15 min daily", "Finish 6 books", "Reading is automatic"], "target": "6 books", "badge": "📖"},
    {"name": "Momentum", "weeks": "13-36", "description": "Read with purpose", "milestones": ["30 min sessions", "12 more books", "Apply what you learn"], "target": "18 books total", "badge": "📚"},
    {"name": "Finish Strong", "weeks": "37-52", "description": "Complete the challenge", "milestones": ["Maintain pace", "6 more books", "24 books done!"], "target": "24 books", "badge": "🏆"}]'::jsonb,
  '[{"id": "current_reading", "question": "How many books did you read last year?", "type": "select", "options": ["0-2 books", "3-5 books", "6-12 books", "12+ books"]},
    {"id": "reading_time", "question": "When could you fit in reading time?", "type": "select", "options": ["Morning", "Lunch break", "Evening", "Before bed"]},
    {"id": "book_types", "question": "What types of books interest you?", "type": "text", "placeholder": "Fiction, business, self-help..."}]'::jsonb,
  '[{"condition": "current_reading == ''0-2 books''", "tasks": ["Read for 10 minutes", "Add book to list", "Review yesterday''s reading"]},
    {"condition": "current_reading == ''12+ books''", "tasks": ["Read for 45 minutes", "Take notes", "Share insight"]}]'::jsonb,
  1876, 71),

('Learn Python Programming', 'learning', '🐍', 'Go from zero to building real projects with Python.', 90,
  '[{"name": "Syntax Basics", "weeks": "1-3", "description": "Learn the fundamentals", "milestones": ["Variables & data types", "Loops & conditions", "Functions"], "target": "Write basic code", "badge": "🌱"},
    {"name": "Build Projects", "weeks": "4-9", "description": "Apply your knowledge", "milestones": ["First small project", "Work with files", "Use libraries"], "target": "3 projects done", "badge": "🔨"},
    {"name": "Advanced Concepts", "weeks": "10-12", "description": "Level up skills", "milestones": ["OOP basics", "API integration", "Portfolio project"], "target": "Portfolio ready", "badge": "🐍"}]'::jsonb,
  '[{"id": "coding_experience", "question": "Any programming experience?", "type": "select", "options": ["Complete beginner", "Some HTML/CSS", "Know another language", "Some Python"]},
    {"id": "learning_goal", "question": "What do you want to build with Python?", "type": "text", "placeholder": "Websites, data analysis, automation..."},
    {"id": "daily_time", "question": "How much time can you code daily?", "type": "select", "options": ["15-30 minutes", "30-60 minutes", "1-2 hours", "2+ hours"]}]'::jsonb,
  '[{"condition": "coding_experience == ''Complete beginner''", "tasks": ["Watch tutorial video", "Complete coding exercise", "Review notes"]},
    {"condition": "daily_time == ''2+ hours''", "tasks": ["Theory lesson", "Coding practice", "Build project feature", "Review & debug"]}]'::jsonb,
  3421, 79),

('Master Public Speaking', 'learning', '🎤', 'Overcome fear and become a confident, engaging speaker.', 90,
  '[{"name": "Foundation", "weeks": "1-4", "description": "Build confidence", "milestones": ["Understand your fear", "Practice alone daily", "Record yourself"], "target": "Speak to mirror", "badge": "🌱"},
    {"name": "Practice", "weeks": "5-8", "description": "Real audience practice", "milestones": ["Speak to friends/family", "Join speaking group", "Get feedback"], "target": "5 mini-speeches", "badge": "🎯"},
    {"name": "Perform", "weeks": "9-12", "description": "Public presentations", "milestones": ["Prepare signature talk", "Present to group", "Record final speech"], "target": "Confident speaker", "badge": "🎤"}]'::jsonb,
  '[{"id": "current_comfort", "question": "How comfortable are you speaking publicly?", "type": "select", "options": ["Terrified", "Nervous but manage", "Okay in small groups", "Pretty confident"]},
    {"id": "speaking_goal", "question": "Where do you want to speak?", "type": "text", "placeholder": "Work meetings, conferences, YouTube..."},
    {"id": "motivation", "question": "Why is this skill important to you?", "type": "text", "placeholder": "Career, influence, confidence..."}]'::jsonb,
  '[{"condition": "current_comfort == ''Terrified''", "tasks": ["Breathing exercise", "3-min mirror practice", "Write positive affirmation"]},
    {"condition": "current_comfort == ''Pretty confident''", "tasks": ["Prepare new material", "Practice with audience", "Film and review"]}]'::jsonb,
  1243, 83),

-- CAREER TEMPLATES
('Get Promoted in 6 Months', 'career', '📈', 'Strategic approach to earning your next promotion.', 180,
  '[{"name": "Assessment", "weeks": "1-4", "description": "Understand the gap", "milestones": ["Identify requirements", "Get manager feedback", "Skill gap analysis"], "target": "Clear roadmap", "badge": "🔍"},
    {"name": "Build Value", "weeks": "5-16", "description": "Become indispensable", "milestones": ["Take on stretch projects", "Document wins", "Build visibility"], "target": "Visible impact", "badge": "⭐"},
    {"name": "The Ask", "weeks": "17-24", "description": "Make your case", "milestones": ["Prepare evidence", "Practice conversation", "Have the talk"], "target": "Promotion earned!", "badge": "📈"}]'::jsonb,
  '[{"id": "current_role", "question": "What''s your current role?", "type": "text", "placeholder": "Your current job title"},
    {"id": "target_role", "question": "What position are you aiming for?", "type": "text", "placeholder": "The role you want"},
    {"id": "company_size", "question": "How large is your company?", "type": "select", "options": ["Startup (<50)", "Small (50-200)", "Medium (200-1000)", "Large (1000+)"]},
    {"id": "motivation", "question": "Why is this promotion important to you?", "type": "text", "placeholder": "Growth, impact, compensation..."}]'::jsonb,
  '[{"condition": "true", "tasks": ["One visibility action", "Document a win", "Connect with decision-maker"]}]'::jsonb,
  1567, 72),

('Launch Freelance Business', 'career', '💼', 'Build a sustainable freelance income from scratch.', 120,
  '[{"name": "Foundation", "weeks": "1-4", "description": "Set up for success", "milestones": ["Define your service", "Create portfolio", "Set pricing"], "target": "Ready to sell", "badge": "🎯"},
    {"name": "First Clients", "weeks": "5-10", "description": "Land paying work", "milestones": ["Outreach daily", "First client", "Deliver great work"], "target": "3 clients", "badge": "🤝"},
    {"name": "Steady Income", "weeks": "11-16", "description": "Build pipeline", "milestones": ["Referral system", "Raise rates", "Consistent income"], "target": "Sustainable business", "badge": "💼"}]'::jsonb,
  '[{"id": "skill_offering", "question": "What skill will you freelance?", "type": "text", "placeholder": "Writing, design, development..."},
    {"id": "current_status", "question": "Are you doing this full-time or as a side gig?", "type": "select", "options": ["Full-time focus", "Side gig for now", "Transitioning"]},
    {"id": "income_goal", "question": "What''s your monthly income target?", "type": "number", "unit": "₦", "placeholder": "Target monthly income"}]'::jsonb,
  '[{"condition": "current_status == ''Side gig for now''", "tasks": ["1 hour client work", "Send 2 pitches", "Portfolio update"]},
    {"condition": "current_status == ''Full-time focus''", "tasks": ["4 hours client work", "Send 5 pitches", "Networking", "Content creation"]}]'::jsonb,
  987, 67),

('Build Tech Portfolio', 'career', '💻', 'Create 5 impressive projects that land you interviews.', 120,
  '[{"name": "Foundation Project", "weeks": "1-4", "description": "First portfolio piece", "milestones": ["Choose project idea", "Build MVP", "Deploy live"], "target": "1 project live", "badge": "🚀"},
    {"name": "Build & Learn", "weeks": "5-12", "description": "Expand portfolio", "milestones": ["3 more projects", "Use different tech", "Add to GitHub"], "target": "4 projects total", "badge": "💻"},
    {"name": "Polish & Present", "weeks": "13-16", "description": "Interview ready", "milestones": ["Final project", "Portfolio site", "Practice presenting"], "target": "5 projects ready", "badge": "🎯"}]'::jsonb,
  '[{"id": "tech_stack", "question": "What technologies do you know or want to learn?", "type": "text", "placeholder": "React, Python, Node.js..."},
    {"id": "goal", "question": "What''s the goal for this portfolio?", "type": "select", "options": ["First tech job", "Switch to new stack", "Freelance clients", "Show skills"]},
    {"id": "time_available", "question": "How many hours per week can you code?", "type": "select", "options": ["5-10 hours", "10-20 hours", "20+ hours"]}]'::jsonb,
  '[{"condition": "time_available == ''5-10 hours''", "tasks": ["1 hour coding", "Watch tutorial", "Review code"]},
    {"condition": "time_available == ''20+ hours''", "tasks": ["4 hours project work", "Learn new concept", "Code review", "Document progress"]}]'::jsonb,
  2134, 81),

-- CREATIVE TEMPLATE
('Write a Book', 'creative', '✍️', 'From blank page to finished manuscript in 6 months.', 180,
  '[{"name": "Outline & Plan", "weeks": "1-3", "description": "Structure your book", "milestones": ["Core idea defined", "Chapter outline", "Writing schedule set"], "target": "Complete outline", "badge": "📋"},
    {"name": "First Draft", "weeks": "4-16", "description": "Just write!", "milestones": ["Write daily", "50% complete", "Finish draft"], "target": "Complete first draft", "badge": "✍️"},
    {"name": "Edit & Polish", "weeks": "17-24", "description": "Make it great", "milestones": ["Self-edit", "Beta readers", "Final polish"], "target": "Finished manuscript", "badge": "📖"}]'::jsonb,
  '[{"id": "book_type", "question": "What type of book are you writing?", "type": "select", "options": ["Fiction novel", "Non-fiction", "Memoir", "Self-help", "Other"]},
    {"id": "word_count_goal", "question": "Target word count?", "type": "select", "options": ["30,000 (novella)", "50,000 (short novel)", "70,000+ (full novel)"]},
    {"id": "writing_experience", "question": "How much have you written before?", "type": "select", "options": ["Never written", "Some short pieces", "Attempted books before", "Published writer"]},
    {"id": "motivation", "question": "Why do you want to write this book?", "type": "text", "placeholder": "What story must you tell?"}]'::jsonb,
  '[{"condition": "word_count_goal == ''30,000 (novella)''", "tasks": ["Write 500 words", "Review yesterday''s work", "Plan next scene"]},
    {"condition": "word_count_goal == ''70,000+ (full novel)''", "tasks": ["Write 1000 words", "Character development", "Plot check"]}]'::jsonb,
  1654, 58);