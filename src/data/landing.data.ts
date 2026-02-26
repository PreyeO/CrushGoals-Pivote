import { Layers, Users, BarChart3, Trophy, Shield, Clock } from "lucide-react";

export const heroData = {
    badge: "The goal platform built for teams",
    headline: {
        part1: "Align Your Team.",
        part2: "Crush Every Goal.",
    },
    subhead: "Stop over-engineering goals. Set objectives, assign ownership, and track progress without the complexity.",
    cta: {
        placeholder: "Enter your team name...",
        buttonText: "Start Free",
        subtext: "No credit card required • Instant setup"
    },
    socialProof: {
        avatarLetters: ["P", "A", "T", "C", "J"],
        rating: 5,
        text: "Loved by 180+ teams worldwide"
    }
};

export const statsData = [
    { value: "2,400+", label: "Goals Crushed" },
    { value: "180+", label: "Teams Active" },
    { value: "95%", label: "Report Faster Alignment" },
    { value: "4.9/5", label: "User Rating" },
];

export const featuresData = [
    {
        icon: Layers,
        title: "Action-Oriented Goals",
        description: "Set direct objectives with targets and deadlines. No complex academic frameworks, just clear outcomes."
    },
    {
        icon: Users,
        title: "Team Assignment",
        description: "Assign goals with clear ownership. Everyone knows what they're responsible for — no confusion, just clarity."
    },
    {
        icon: BarChart3,
        title: "Live Progress Dashboard",
        description: "Team health scores, completion trends, and bottleneck detection. Know where your team stands at a glance."
    },
    {
        icon: Trophy,
        title: "Team Leaderboard",
        description: "Friendly competition that drives results. Top performers get recognized, and the whole team stays motivated."
    },
    {
        icon: Shield,
        title: "Status & Accountability",
        description: "Not started → In progress → Blocked → Done. Real-time status tracking means no goal slips through the cracks."
    },
    {
        icon: Clock,
        title: "Deadlines & Urgency",
        description: "Track what's on schedule, what's behind, and what's overdue. Visual alerts keep the team moving."
    },
];

export const testimonialsData = [
    {
        name: "Adeola K.",
        role: "Startup Founder",
        text: "We replaced 3 tools with CrushGoals. Our team finally has one place to see all our quarterly targets and who owns what. Game changer.",
        rating: 5
    },
    {
        name: "Michael T.",
        role: "School Principal",
        text: "We use this for teacher development goals. The leaderboard creates healthy competition, and the simplicity means everyone actually uses it.",
        rating: 5
    },
    {
        name: "Grace O.",
        role: "Ministry Coordinator",
        text: "Perfect for our church outreach groups. We track goals, assign volunteers, and see real-time progress. Zero learning curve.",
        rating: 5
    },
];
