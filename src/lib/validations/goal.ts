import * as z from "zod";

export const createGoalSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    emoji: z.string().min(1),
    category: z.string().min(2),
    priority: z.enum(["low", "medium", "high"]),
    frequency: z.enum(["one_time", "daily", "weekly", "monthly"]),
    startDate: z.string().min(1, "Start date is required"),
    deadline: z.string().min(1, "Deadline is required"),
    assigneeIds: z.array(z.string()).min(1, "Please assign this goal to at least one person"),
    goalType: z.enum(["metric", "milestone"]).optional(),
    targetNumber: z.number().min(0.01, "Target must be greater than 0").optional(),
    unit: z.string().optional(),
    targetValue: z.string().optional(),
    isPrivate: z.boolean().optional(),
});

export type CreateGoalFormValues = z.infer<typeof createGoalSchema>;
