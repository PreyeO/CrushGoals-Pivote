import { GoalTemplate } from "@/types";

export const GOAL_TEMPLATES: GoalTemplate[] = [
    {
        id: "tpl-1",
        title: "Launch a product",
        description: "Focus on shiping your MVP or a major feature update to your users.",
        emoji: "🚀",
        category: "Product",
        priority: "high",
    },
    {
        id: "tpl-2",
        title: "Plan an event",
        description: "Coordinate everything needed for a successful team or community event.",
        emoji: "📅",
        category: "Operations",
        priority: "medium",
    },
    {
        id: "tpl-3",
        title: "Hit a sales target",
        description: "Drive revenue and close deals to hit your quarterly or monthly sales goals.",
        emoji: "💰",
        category: "Sales",
        priority: "high",
    },
    {
        id: "tpl-4",
        title: "Grow social presence",
        description: "Increase brand awareness and engagement across social channels.",
        emoji: "📈",
        category: "Marketing",
        priority: "medium",
    },
    {
        id: "tpl-5",
        title: "Team collaboration",
        description: "Improve internal processes and boost team happiness and productivity.",
        emoji: "🤝",
        category: "Team",
        priority: "low",
    },
];
