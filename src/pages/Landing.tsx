import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuthModal } from "@/components/AuthModal";
import { FeatureCard } from "@/components/FeatureCard";
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
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Goal Breaking",
    description: "AI breaks your big audacious goals into daily actionable tasks you can actually complete.",
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
    name: "Chioma A.",
    role: "Entrepreneur",
    text: "Best ₦25k I've spent this year! Lost 15kg and launched my business all because of this app.",
    rating: 5,
  },
  {
    name: "Oluwaseun T.",
    role: "Software Developer",
    text: "The streak feature is addictive. I've read 12 books in 3 months. Never thought I could.",
    rating: 5,
  },
  {
    name: "Adaeze N.",
    role: "Medical Student",
    text: "Finally passed my exams with distinction. The daily task breakdown saved me.",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Monthly",
    price: "₦3,000",
    period: "/month",
    description: "Billed monthly. Cancel anytime.",
    features: ["Unlimited goals", "Full analytics", "All achievements", "Priority support"],
    popular: false,
  },
  {
    name: "Annual",
    price: "₦25,000",
    period: "/year",
    description: "₦2,083/month — Save 31%!",
    features: ["Everything in Monthly", "2 months free", "Early access to features", "Exclusive badges"],
    popular: true,
  },
];

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <ParticleBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Goal Crusher
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setAuthOpen(true)}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => setAuthOpen(true)}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 animate-fade-in">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm text-foreground-secondary">
              Join 10,000+ Nigerians crushing their goals
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slide-up">
            Crush Every Goal
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              in 2026
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto mb-10 animate-slide-up opacity-0" style={{ animationDelay: "100ms" }}>
            The only goal tracker that actually works. AI-powered planning, gamification,
            and accountability — all in one beautiful app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up opacity-0" style={{ animationDelay: "200ms" }}>
            <Button
              variant="hero"
              size="xl"
              className="animate-pulse-glow"
              onClick={() => setAuthOpen(true)}
            >
              Start Free Trial
              <Zap className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="glass" size="xl">
              <Play className="w-5 h-5 mr-1" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 mt-10 animate-fade-in opacity-0" style={{ animationDelay: "300ms" }}>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-background"
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-primary-gradient">Succeed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the ultimate toolkit for goal achievement. No more juggling multiple apps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="text-primary-gradient">Goal Crushers</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Real results from real Nigerians.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                variant="glass"
                className="p-6 animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-premium text-premium" />
                  ))}
                </div>
                <p className="text-foreground-secondary mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, <span className="text-primary-gradient">Affordable</span> Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start with a 7-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                variant="glass"
                className={`p-8 relative ${plan.popular ? "border-primary/50 shadow-glow-md" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-sm font-semibold text-primary-foreground">
                    🔥 Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "hero" : "glass"}
                  size="lg"
                  className="w-full"
                  onClick={() => setAuthOpen(true)}
                >
                  Start Free Trial
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            🔒 Secure payment via Paystack • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Crush Your Goals?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of ambitious Nigerians transforming their lives in 2026.
          </p>
          <Button
            variant="hero"
            size="xl"
            className="animate-pulse-glow"
            onClick={() => setAuthOpen(true)}
          >
            Start Your Free Trial Today
            <Zap className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Goal Crusher</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ in Nigeria
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
