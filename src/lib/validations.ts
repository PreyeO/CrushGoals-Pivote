import { z } from "zod";

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be less than 72 characters"),
  agreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

// Goal validation schema
export const goalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Goal name is required")
    .max(200, "Goal name must be less than 200 characters"),
  target: z
    .string()
    .trim()
    .max(100, "Target must be less than 100 characters")
    .optional(),
  startDate: z
    .string()
    .min(1, "Start date is required"),
  deadline: z
    .string()
    .min(1, "End date is required"),
  reason: z
    .string()
    .trim()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
});

// Task validation schema
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters"),
  goal_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  time_estimate: z.string().max(50).optional(),
});

// Friend request validation schema
export const friendRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type GoalFormData = z.infer<typeof goalSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type FriendRequestFormData = z.infer<typeof friendRequestSchema>;
