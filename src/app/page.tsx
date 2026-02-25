import Link from "next/link";
import {
  Target, Users, BarChart3, Trophy, Mail, CheckCircle, Zap, ArrowRight,
  Star, ChevronDown, Layers, Sparkles, Shield, Globe, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Layers, title: "OKR & Goal Frameworks", description: "Structure objectives with key results, SMART templates, and milestone tracking. Guide your team from idea to done." },
  { icon: Users, title: "Team Assignment", description: "Assign goals with clear ownership. Everyone knows what they're responsible for — no confusion, just clarity." },
  { icon: BarChart3, title: "Live Progress Dashboard", description: "Team health scores, completion trends, and bottleneck detection. Know where your team stands at a glance." },
  { icon: Trophy, title: "Team Leaderboard", description: "Friendly competition that drives results. Top performers get recognized, and the whole team stays motivated." },
  { icon: Shield, title: "Status & Accountability", description: "Not started → In progress → Blocked → Done. Real-time status tracking means no goal slips through the cracks." },
  { icon: Clock, title: "Milestones & Deadlines", description: "Break big goals into checkpoints. Track what's on schedule, what's behind, and celebrate every milestone hit." },
];

const stats = [
  { value: "2,400+", label: "Goals Crushed" },
  { value: "180+", label: "Teams Active" },
  { value: "95%", label: "Report Faster Alignment" },
  { value: "4.9/5", label: "User Rating" },
];

const testimonials = [
  { name: "Adeola K.", role: "Startup Founder", text: "We replaced 3 tools with CrushGoals. Our team finally has one place to see all our quarterly targets and who owns what. Game changer.", rating: 5 },
  { name: "Michael T.", role: "School Principal", text: "We use this for teacher development goals. The leaderboard creates healthy competition, and the simplicity means everyone actually uses it.", rating: 5 },
  { name: "Grace O.", role: "Ministry Coordinator", text: "Perfect for our church outreach groups. We track goals, assign volunteers, and see real-time progress. Zero learning curve.", rating: 5 },
];

const pricingPlans = [
  {
    name: "Free", price: "$0", period: "", description: "For small teams getting started",
    features: ["Up to 5 team members", "3 active goals per team", "Basic progress tracking", "Team leaderboard", "Email invites"],
    popular: false, cta: "Start Free",
  },
  {
    name: "Team", price: "$12", period: "/month", description: "For growing teams who need more",
    features: ["Up to 25 members", "Unlimited goals", "OKR & SMART frameworks", "Progress reports & analytics", "Milestone & priority tracking", "Goal comments & updates", "Team health score", "Export to PDF / CSV"],
    popular: true, cta: "Start 14-Day Trial",
  },
  {
    name: "Enterprise", price: "Custom", period: "", description: "For organizations at scale",
    features: ["Unlimited members", "Everything in Team", "SSO & advanced security", "API access", "Slack & Teams integrations", "Dedicated account manager"],
    popular: false, cta: "Contact Us",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-background/70 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary-sm transition-shadow group-hover:glow-primary">
              <Target className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CrushGoals</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gradient-primary text-white border-0 hover:opacity-90 glow-primary-sm text-xs px-4">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 px-5 sm:px-8 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 left-1/3 w-[500px] h-[500px] rounded-full bg-[oklch(0.45_0.20_285_/_0.12)] blur-[120px] animate-float" />
          <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-[oklch(0.50_0.18_250_/_0.08)] blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[oklch(0.55_0.22_330_/_0.06)] blur-[80px] animate-float" style={{ animationDelay: "5s" }} />
          {/* Orbiting dots */}
          <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-primary/40 animate-orbit" />
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-chart-2/40 animate-orbit" style={{ animationDelay: "-5s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">The goal platform built for teams</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 animate-fade-in-up">
            <span className="text-gradient-hero">Align Your Team.</span>
            <br />
            <span className="text-gradient-primary">Crush Every Goal.</span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            Set objectives, assign ownership, and track progress — without the complexity of enterprise tools. From startups to school clubs, teams get aligned in minutes.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Link href="/dashboard">
              <Button size="lg" className="gradient-primary text-white border-0 px-8 h-12 text-sm font-semibold animate-pulse-glow hover:opacity-90 gap-2">
                Start Free — No Card Required
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="h-12 text-sm font-semibold border-border/60 hover:bg-accent/60 gap-2">
                See How It Works
                <ChevronDown className="w-4 h-4" />
              </Button>
            </a>
          </div>

          {/* Social proof row */}
          <div className="flex items-center justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="flex -space-x-2.5">
              {["P", "A", "T", "C", "J"].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-[11px] font-bold text-white border-2 border-background ring-1 ring-primary/20">
                  {letter}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Loved by 180+ teams</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-border/30 bg-card/40">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px">
          {stats.map((s, i) => (
            <div key={i} className="text-center py-8 px-4">
              <p className="text-2xl sm:text-3xl font-extrabold text-gradient-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything Teams Need to <span className="text-gradient-primary">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Goal tracking built for collaboration. No more spreadsheets, no more &quot;what are we working on&quot; messages.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {features.map((f) => (
              <div key={f.title} className="glass-card-hover p-6 animate-fade-in-up group">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-4 glow-primary-sm group-hover:glow-primary transition-shadow">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-5 sm:px-8 gradient-subtle">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three Steps to <span className="text-gradient-primary">Aligned Teams</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 stagger">
            {[
              { step: "01", title: "Create Your Org", desc: "Set up your team in 30 seconds. Give it a name, invite members by email." },
              { step: "02", title: "Set & Assign Goals", desc: "Create OKRs or simple goals with deadlines. Assign to team members with clear ownership." },
              { step: "03", title: "Track & Celebrate", desc: "Watch progress in real-time. Spot blockers early. Celebrate wins on the leaderboard." },
            ].map((item) => (
              <div key={item.step} className="text-center animate-fade-in-up group">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-5 flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Loved by <span className="text-gradient-primary">Teams Everywhere</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 stagger">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card p-6 animate-fade-in-up">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Simple, <span className="text-gradient-primary">Transparent</span> Pricing
            </h2>
            <p className="text-muted-foreground">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card p-7 relative ${plan.popular ? "border-primary/40 glow-primary md:scale-105 z-10" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 gradient-primary rounded-full text-[11px] font-semibold text-white tracking-wide">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="block">
                  <Button
                    className={`w-full h-10 text-sm font-semibold ${plan.popular ? "gradient-primary text-white border-0 hover:opacity-90" : "border-border/60 hover:bg-accent/60"}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.45_0.20_285_/_0.08)] blur-[150px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">
            Ready to Crush Goals<br />as a Team?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join teams using CrushGoals to stay aligned, accountable, and motivated — for free.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gradient-primary text-white border-0 px-10 h-12 text-sm font-semibold animate-pulse-glow hover:opacity-90 gap-2">
              Start Free Today
              <Zap className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-5 sm:px-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">CrushGoals</span>
          </Link>
          <p className="text-xs text-muted-foreground">© 2026 CrushGoals by LetsCr8t. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
