import { GoalTemplate } from "@/types";

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // ── Sales & Revenue ────────────────────────────────
  {
    id: "tpl-sales-daily",
    title: "Daily Cold Outreach",
    description:
      "Track daily prospecting activity — calls, emails, or LinkedIn messages.",
    emoji: "📞",
    category: "Sales",
    priority: "high",
    cadence: "daily",
    targetNumber: 10,
    unit: "touches",
  },
  {
    id: "tpl-sales-weekly",
    title: "Weekly Pipeline Review",
    description: "Review open deals and move pipeline forward every week.",
    emoji: "💼",
    category: "Sales",
    priority: "high",
    cadence: "weekly",
  },
  {
    id: "tpl-sales-monthly",
    title: "Monthly Revenue Target",
    description: "Hit your team's monthly revenue or bookings target.",
    emoji: "💰",
    category: "Sales",
    priority: "high",
    cadence: "monthly",
    targetNumber: 50000,
    unit: "$",
  },

  // ── Engineering ────────────────────────────────────
  {
    id: "tpl-eng-daily",
    title: "Daily Code Reviews",
    description: "Review at least one PR daily to keep the team unblocked.",
    emoji: "🔍",
    category: "Engineering",
    priority: "medium",
    cadence: "daily",
  },
  {
    id: "tpl-eng-weekly",
    title: "Sprint Delivery",
    description: "Complete committed sprint work by end of the week.",
    emoji: "🚀",
    category: "Engineering",
    priority: "high",
    cadence: "weekly",
    targetNumber: 20,
    unit: "story points",
  },
  {
    id: "tpl-eng-monthly",
    title: "Quarterly Release Milestone",
    description: "Ship a major feature or release to production this month.",
    emoji: "🎯",
    category: "Engineering",
    priority: "high",
    cadence: "monthly",
  },

  // ── Customer Success ───────────────────────────────
  {
    id: "tpl-cs-daily",
    title: "Daily Ticket SLA",
    description: "Respond to all customer tickets within the SLA window daily.",
    emoji: "⚡",
    category: "Support",
    priority: "high",
    cadence: "daily",
  },
  {
    id: "tpl-cs-weekly",
    title: "Weekly CSAT Check",
    description:
      "Review customer satisfaction scores and address detractors weekly.",
    emoji: "⭐",
    category: "Support",
    priority: "medium",
    cadence: "weekly",
    targetNumber: 90,
    unit: "% CSAT",
  },
  {
    id: "tpl-cs-monthly",
    title: "Monthly Churn Reduction",
    description:
      "Track and reduce customer churn rate against your monthly target.",
    emoji: "📉",
    category: "Support",
    priority: "high",
    cadence: "monthly",
    targetNumber: 5,
    unit: "% churn",
  },

  // ── Operations & General ───────────────────────────
  {
    id: "tpl-ops-daily",
    title: "Daily Standup Update",
    description:
      "Post your async standup — what you did, what's next, any blockers.",
    emoji: "📋",
    category: "Operations",
    priority: "medium",
    cadence: "daily",
  },
  {
    id: "tpl-ops-weekly",
    title: "Weekly Report Submission",
    description: "Submit your weekly progress report on time every week.",
    emoji: "📝",
    category: "Operations",
    priority: "medium",
    cadence: "weekly",
  },
  {
    id: "tpl-ops-monthly",
    title: "Monthly KPI Review",
    description: "Review all team KPIs and present progress to leadership.",
    emoji: "📊",
    category: "Operations",
    priority: "high",
    cadence: "monthly",
  },
];
