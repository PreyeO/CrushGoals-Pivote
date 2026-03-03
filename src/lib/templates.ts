import { GoalTemplate } from "@/types";

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        id: "tpl-1",
        title: "Daily Sales Outreach",
        description: "Consistency is key. Track daily calls, emails, or LinkedIn messages to fill the pipeline.",
        emoji: "📞",
        category: "Sales",
        priority: "high",
    },
    {
        id: "tpl-2",
        title: "Weekly Revenue Target",
        description: "Monitor team revenue growth and hit your weekly booking or sales milestones.",
        emoji: "💰",
        category: "Finance",
        priority: "high",
    },
    {
        id: "tpl-3",
        title: "Customer Support (CSAT)",
        description: "Maintain a high Customer Satisfaction Score by responding quickly and effectively.",
        emoji: "⭐",
        category: "Support",
        priority: "medium",
    },
    {
        id: "tpl-4",
        title: "Product Feature Shipping",
        description: "Track the number of major features or improvements shipped to production this month.",
        emoji: "🚀",
        category: "Product",
        priority: "high",
    },
    {
        id: "tpl-5",
        title: "Team Productivity (Tasks)",
        description: "Measure team output by tracking successfully completed projects or task blocks.",
        emoji: "✅",
        category: "Operations",
        priority: "medium",
    },
];
