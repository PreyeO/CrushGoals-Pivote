"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "For small teams getting started",
    features: [
      "1 organization",
      "Up to 10 members",
      "5 active goals",
      "progress tracking",
      "Team leaderboard",
      "Invite via email or shareable URL",
    ],
    popular: false,
    cta: "Start Free",
  },
  {
    name: "Professional",
    price: "$20", // USD; convert to NGN dynamically for Nigerian users
    period: "/month",
    description: "For growing teams who need more",
    features: [
      "Up to 50 members per organization",
      "Unlimited goals",
      "Progress reports & advanced analytics",
      "Team health score & insights",
      "Goal comments & updates",
      "Export progress to PDF / CSV",
      "3 organizations",
      "Priority Support",
      "Invite via email or shareable URL",
    ],
    popular: true,
    cta: "Start Now",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations at scale",
    features: [
      "Unlimited members and organizations",
      "Everything in Professional",
      "SSO & advanced security",
      "API access",
      "Slack & Microsoft Teams integrations",
      "Dedicated account manager",
    ],
    popular: false,
    cta: "Contact Us",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Pricing That <span className="text-gradient-primary"> Scales</span>{" "}
            With Your Team
          </h2>
          <p className="text-muted-foreground">
            Start free. Upgrade only when your team grows.
          </p>
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
                <p className="text-xs text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                )}
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
                  className={`w-full h-10 text-sm font-semibold cursor-pointer ${plan.popular ? "gradient-primary text-white border-0 hover:opacity-90" : "border-border/60 hover:bg-accent/60"}`}
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
  );
}
