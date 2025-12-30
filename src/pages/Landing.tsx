import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuthModal } from "@/components/AuthModal";
import { FeatureCard } from "@/components/FeatureCard";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Target,
  Flame,
  BarChart3,
  Zap,
  Trophy,
  Users,
  ChevronDown,
  Star,
  Check,
  Play,
  Menu,
  X,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Goal Breaking",
    description: "Break your big audacious goals into daily actionable tasks you can actually complete.",
  },
  {
    icon: Flame,
    title: "Streak Motivation",
    description: "Build unbreakable habits with gamification. Never break your streak again.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "See exactly how close you are to winning with beautiful data visualization.",
  },
  {
    icon: Zap,
    title: "Daily Action Plans",
    description: "Wake up knowing exactly what to do. No more guessing or procrastinating.",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Earn badges, level up, and celebrate every milestone on your journey.",
  },
  {
    icon: Users,
    title: "Community & Leaderboard",
    description: "Compete with other goal crushers and stay accountable together.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Entrepreneur",
    text: "Best investment I've made this year! Lost 15kg and launched my business all because of this app.",
    rating: 5,
  },
  {
    name: "James T.",
    role: "Software Developer",
    text: "The streak feature is addictive. I've read 12 books in 3 months. Never thought I could.",
    rating: 5,
  },
  {
    name: "Emily N.",
    role: "Medical Student",
    text: "Finally passed my exams with distinction. The daily task breakdown saved me.",
    rating: 5,
  },
];

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, isAdminLoaded } = useAuth();
  const navigate = useNavigate();
  const { getPricing, currentCurrency } = useCurrency();
  const pricing = getPricing();

  // Redirect if already logged in - admins go to /admin, regular users to /dashboard
  useEffect(() => {
    if (user && isAdminLoaded) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, isAdminLoaded, navigate]);

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    // Navigation is handled by the useEffect based on admin status
  };

  const pricingPlans = [
    {
      name: "Monthly",
      subtitle: "Flexibility",
      price: pricing.monthly.formatted,
      period: "/month",
      description: "Perfect for trying out goal crushing",
      features: [
        "Unlimited goals",
        "Full gamification & achievements",
        "All analytics & insights",
        "Email reminders",
        "Global leaderboard",
        "Add friends & compete",
        "Join group challenges",
      ],
      popular: false,
      annualPrice: null,
      annualSavings: null,
    },
    {
      name: "Annual",
      subtitle: "Best Value",
      price: pricing.annual.formatted,
      period: "/year",
      description: "For committed goal crushers",
      features: [
        "Everything in Monthly",
        "1 month FREE",
        "Priority support",
        "Early access to new features",
      ],
      popular: true,
      annualPrice: null,
      annualSavings: pricing.annual.savingsText,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CrushGoals
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="ghost" onClick={() => setAuthOpen(true)}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => setAuthOpen(true)}>
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-white/10">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}>
                Start Free Trial
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 sm:mb-8 animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs sm:text-sm text-foreground-secondary">
              Join 10,000+ people crushing their goals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight animate-slide-up">
            Crush Every Goal
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              in 2026
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-foreground-secondary max-w-2xl mx-auto mb-8 sm:mb-10 animate-slide-up opacity-0 px-4" style={{ animationDelay: "100ms" }}>
            The only goal tracker that actually works. Smart planning, gamification,
            and accountability — all in one beautiful app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up opacity-0 px-4" style={{ animationDelay: "200ms" }}>
            <Button
              variant="hero"
              size="xl"
              className="animate-pulse-glow w-full sm:w-auto"
              onClick={() => setAuthOpen(true)}
            >
              Start Free Trial
              <Zap className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="glass" size="xl" className="w-full sm:w-auto">
              <Play className="w-5 h-5 mr-1" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 animate-fade-in opacity-0" style={{ animationDelay: "300ms" }}>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-primary border-2 border-background"
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-premium text-premium" />
                ))}
                <span className="text-sm font-medium ml-1">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">from 2,847 reviews</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle hidden sm:block">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-primary-gradient">Succeed</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the ultimate toolkit for goal achievement. No more juggling multiple apps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-primary-gradient">Goal Crushers</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Real results from real people worldwide.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                variant="glass"
                className="p-5 sm:p-6 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-premium text-premium" />
                  ))}
                </div>
                <p className="text-foreground-secondary mb-4 leading-relaxed text-sm sm:text-base">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="text-primary-gradient">Affordable</span> Pricing
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              Start with a 3-day free trial. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Prices shown in {currentCurrency.name}</span>
              <CurrencySelector className="ml-2" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                variant="glass"
                className={`p-6 sm:p-8 relative ${plan.popular ? "border-primary/50 shadow-glow-md" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-xs sm:text-sm font-semibold text-primary-foreground">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{plan.subtitle}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                  {plan.annualPrice && (
                    <div className="mt-3 p-2 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-xs text-success font-medium">
                        💰 Annual: {plan.annualPrice}/year — Save {plan.annualSavings}!
                      </p>
                    </div>
                  )}
                </div>
                <ul className="space-y-2 mb-6 sm:mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground-secondary text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "hero" : "glass"}
                  size="lg"
                  className="w-full"
                  onClick={() => setAuthOpen(true)}
                >
                  Start 3-Day Free Trial
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
            🔒 Secure payment • Cancel anytime • 3-day free trial
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Crush Your Goals?
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10">
            Join thousands of ambitious people transforming their lives in 2026.
          </p>
          <Button
            variant="hero"
            size="xl"
            className="animate-pulse-glow w-full sm:w-auto"
            onClick={() => setAuthOpen(true)}
          >
            Start Your Free Trial Today
            <Zap className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-border relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">CrushGoals</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            <a href="/admin-login" className="hover:text-foreground transition-colors">Admin</a>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Made with ❤️ for goal crushers
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
