import { Layers, Users, BarChart3, Trophy, Shield, Clock } from "lucide-react";

export const heroData = {
  badge: "Built for Team Performance",
  headline: {
    part1: "Align Your People.",
    part2: "Execute With Clarity.",
  },
  subhead:
    "CrushGoals helps teams and organizations set clear goals, assign ownership, and track real progress without heavy project management tools.",
  cta: {
    placeholder: "Enter organization name...",
    buttonText: "Start Free",
    subtext: "No credit card required • Instant setup",
  },
  socialProof: {
    avatarLetters: ["P", "A", "T", "C", "J"],
    rating: 5,
    text: "Loved by 180+ teams worldwide",
  },
};

export const statsData = [
  { value: "2,400+", label: "Goals Achieved" },
  { value: "180+", label: "Teams Active" },
  { value: "95%", label: "Better Strategic Alignment" },
  { value: "4.9/5", label: "Average User Rating" },
];

export const featuresData = [
  {
    icon: Layers,
    title: "Action-Oriented Goals",
    description:
      "Set clear, outcome-driven goals with targets and deadlines. Simple, structured, effective.",
  },
  {
    icon: Users,
    title: "Clear Ownership",
    description:
      "Every goal has an owner. No ambiguity, no silent responsibilities.",
  },
  {
    icon: BarChart3,
    title: "Live Progress Overview",
    description:
      "See progress, trends, and blockers at a glance. Spot issues before they slow your momentum.",
  },
  {
    icon: Trophy,
    title: "Performance Recongnition",
    description:
      "Encourage healthy competition and celebrate top contributors to keep momentum high.",
  },
  {
    icon: Shield,
    title: "Structured Status Tracking",
    description:
      "Stages from Not Started → In Progress → Blocked → Done keep progress visible and prevent stalls.",
  },
  {
    icon: Clock,
    title: "Deadlines That Drive Action",
    description:
      "Instantly know what’s on track, at risk, or overdue. Visual alerts keep execution moving.",
  },
];

export const testimonialsData = [
  {
    name: "Adeola K.",
    role: "Startup Founder",
    text: "We replaced 3 tools with CrushGoals. Our team finally has one place to see all our targets and who owns what. Game changer.",
    rating: 5,
  },
  {
    name: "Michael T.",
    role: "School Principal",
    text: "We use this for teacher development goals. The leaderboard creates healthy competition, and the simplicity means everyone actually uses it.",
    rating: 5,
  },
  {
    name: "Grace O.",
    role: "Ministry Coordinator",
    text: "Perfect for our church outreach groups. We track goals, assign volunteers, and see real-time progress. Zero learning curve.",
    rating: 5,
  },
];
