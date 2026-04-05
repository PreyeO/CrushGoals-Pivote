"use client";

import { Bot, Zap, Bell, CheckCircle2, AlertTriangle, BarChart3, Clock } from "lucide-react";

const automations = [
  {
    title: "New Goal Rollouts",
    description: "Instant announcements to Slack or Telegram when a new team objective is launched.",
    icon: <Zap className="w-5 h-5" />,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500",
  },
  {
    title: "Daily Progress Check-ins",
    description: "Every morning at 8:00 AM, our bots summarize the team's momentum and daily focus.",
    icon: <Clock className="w-5 h-5" />,
    color: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
  },
  {
    title: "Mission Accomplished Wins",
    description: "Automatic celebrations when a goal hits 100%. Instant recognition for the hard work.",
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
  },
  {
    title: "Blocker Alerts & Tags",
    description: "Real-time notifications only when someone is stuck or needs immediate eyes on it.",
    icon: <AlertTriangle className="w-5 h-5" />,
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-500",
  },
  {
    title: "Weekly Victory Reports",
    description: "Every Monday at 7:30 AM, get a high-level summary of exactly what was crushed last week.",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
  },
  {
    title: "5-Day Momentum Nudges",
    description: "Smart nudges for stale objectives. Ensuring no goal is left behind without manual follow-ups.",
    icon: <Bot className="w-5 h-5" />,
    color: "from-sky-500/20 to-blue-500/20",
    iconColor: "text-sky-500",
  },
];

export function AutomationSuite() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-accent/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4 border border-primary/20">
            <Zap className="w-3 h-3 fill-primary" /> Always Active
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-6">
            The <span className="text-gradient-primary">Automated</span> Team Suite
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Stop manually updating your team. CrushGoals builds an automation layer over your 
            Slack and Telegram groups that keeps everyone synced, 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {automations.map((a, i) => (
            <div 
              key={i} 
              className="glass-card group p-8 transition-all hover:translate-y-[-4px] hover:border-primary/40 animate-fade-in-up"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                <div className={a.iconColor}>
                  {a.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-tight">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {a.description}
              </p>
              
              <div className="mt-6 pt-6 border-t border-border/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" /> 
                  Automated by Default
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <div className="inline-block glass-card px-8 py-4 border-primary/20 shadow-xl animate-pulse">
                <p className="text-[13px] font-black tracking-wide flex items-center gap-3">
                    <span className="text-lg">🤖</span> Integrated with Slack & Telegram Hooks
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}
