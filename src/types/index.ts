export interface Organization {
  id: string;
  name: string;
  description: string;
  emoji: string;
  createdAt: string;
  ownerId: string;
  memberCount: number;
  goalCount: number;
  completionRate: number;
  plan: "free" | "plus" | "enterprise";
  slackWebhookUrl?: string;
  slackSettings?: {
    notify_on_completion: boolean;
    notify_on_blocked: boolean;
    notify_on_stale: boolean;
    notify_on_streaks: boolean;
    stale_threshold_days: number;
  };
  lastSlackNudgeAt?: string;
  lastWeeklySummaryAt?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramChatTitle?: string;
  connectCode?: string;
  telegramSettings?: {
    notify_on_completion: boolean;
    notify_on_blocked: boolean;
    notify_on_stale: boolean;
    notify_on_streaks: boolean;
    notify_on_creation: boolean;
    notify_on_checkin: boolean;
    stale_threshold_days: number;
    allow_commands: boolean;
  };
  lastTelegramNudgeAt?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  telegram_user_id?: string | null;
  telegram_link_code?: string | null;
}

export type OrgRole = "owner" | "admin" | "member";
export type GoalStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type GoalPriority = "high" | "medium" | "low";
export type GoalFrequency = "one_time" | "daily" | "weekly" | "monthly";
export type MemberGoalStatusValue = "on_track" | "behind" | "blocked" | "completed";

export interface MemberGoalStatus {
  id: string;
  goalId: string;
  userId: string;
  orgId: string;
  status: MemberGoalStatusValue;
  note: string | null;
  contribution: number;
  updatedAt: string;
  // joined from profiles
  name: string;
  avatarUrl: string | null;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  joinedAt: string;
  // Join fields from 'profiles'
  name: string;
  avatarUrl: string | null;
  email?: string;
  // Computed/Aggregated fields
  goalsAssigned: number;
  goalsCompleted: number;
  completionRate: number;
  currentStreak: number;
}

export interface OrgGoal {
  id: string;
  orgId: string;
  frequency: GoalFrequency;
  title: string;
  description: string;
  category: string;
  emoji: string;
  status: GoalStatus;
  priority: GoalPriority;
  targetValue: string; // The display label (e.g., "100 sign-ups")
  targetNumber?: number; // The numeric target for tracking (e.g., 100)
  unit?: string; // The unit of measurement (e.g., "sign-ups", "chapters", "$")
  currentValue: number; // For metric goals, this is the actual value. For milestones, it's 0-100.
  startDate: string; // The start date of the goal (ISO format)
  deadline: string;
  createdBy: string;
  assignedTo: string[]; // member IDs
  progress: number; // Computed 0-100 progress
  comments: GoalComment[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalComment {
  id: string;
  goalId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface OrgInvite {
  id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "declined";
  token: string;
  invitedBy: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  type: "goal_created" | "goal_completed" | "member_joined" | "comment" | "status_change" | "goal_assigned";
  message: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  name: string;
  avatarUrl: string | null;
  goalsCompleted: number;
  completionRate: number;
  currentStreak: number;
  totalPoints: number;
}

export interface OrgHealthScore {
  overall: number; // 0-100
  goalProgress: number;
  memberEngagement: number;
  onTimeCompletion: number;
  trend: "up" | "down" | "stable";
}

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
  priority: GoalPriority;
  targetNumber?: number;
  unit?: string;
  cadence?: GoalFrequency;
}

export interface DailyCheckIn {
  id: string;
  goalId: string;
  userId: string;
  checkDate: string; // YYYY-MM-DD
  completed: boolean;
  note: string | null;
  createdAt: string;
}
