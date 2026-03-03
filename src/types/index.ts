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
  plan: "free" | "team" | "enterprise";
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  description: string;
  emoji?: string;
  createdAt: string;
}

export type OrgRole = "owner" | "admin" | "member";
export type GoalStatus = "not_started" | "in_progress" | "blocked" | "completed";
export type GoalPriority = "high" | "medium" | "low";

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  teamId?: string; // Link to a team
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
  teamId?: string; // Link to a team
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

export interface TeamHealthScore {
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
}
