import { create } from "zustand";
import { fetchWithRetry } from "./fetch-retry";
import {
  Organization,
  OrgGoal,
  OrgMember,
  OrgRole,
  OrgInvite,
  ActivityItem,
  GoalStatus,
  GoalPriority,
  GoalFrequency,
  MemberGoalStatus,
  MemberGoalStatusValue,
  DailyCheckIn,
  Profile,
} from "@/types";
import { goalService } from "./services/goals";
import { orgService } from "./services/orgs";
import { inviteService } from "./services/invites";
import { reportService } from "./services/reportService";

export interface AppState {
  organizations: Organization[];
  goals: OrgGoal[];
  members: OrgMember[];
  invitations: OrgInvite[];
  // invitations the current user has received but not yet accepted (across orgs)
  pendingInvitations: OrgInvite[];
  activities: ActivityItem[];
  memberGoalStatuses: MemberGoalStatus[];
  dailyCheckins: DailyCheckIn[];
  user: ({
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    subscriptionTier: "free" | "pro" | "business";
  } & { profile?: Profile | null }) | null;
  isLoading: boolean;
  isCheckingNotifications: boolean;
  error: string | null;
  sidebarCollapsed: boolean;

  // Actions
  fetchInitialData: (orgId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addOrganization: (data: {
    name: string;
    description: string;
    emoji: string;
  }) => Promise<string>;
  sendInvitation: (
    orgId: string,
    email: string,
    role: OrgRole,
  ) => Promise<{ link: string; emailError?: string }>;
  cancelInvitation: (inviteId: string) => Promise<void>;
  rejectInvitation: (token: string) => Promise<void>;
  addGoal: (
    goal: Omit<
      OrgGoal,
      "id" | "createdAt" | "updatedAt" | "progress" | "comments"
    >,
  ) => Promise<void>;
  updateGoalProgress: (
    goalId: string,
    progress: number,
    note?: string,
  ) => Promise<void>;
  updateGoalStatus: (goalId: string, status: GoalStatus, reason?: string) => Promise<void>;
  deleteGoal: (goalId: string, orgId: string) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;
  fetchMemberStatuses: (goalId: string) => Promise<void>;
  upsertMemberStatus: (
    goalId: string,
    orgId: string,
    status: MemberGoalStatusValue,
    note: string,
    contribution?: number,
  ) => Promise<void>;
  dailyCheckIn: (
    goalId: string,
    checkDate: string,
    note?: string,
  ) => Promise<void>;
  undoDailyCheckIn: (goalId: string, checkDate: string) => Promise<void>;
  fetchCheckIns: (goalId: string) => Promise<void>;
  updateOrganization: (orgId: string, data: Partial<Organization>) => Promise<void>;
}

import { authService } from "./services/auth";

/** Raw shape returned by Supabase for an organization row */
interface RawOrg {
  id: string;
  name: string;
  description: string;
  emoji: string;
  plan?: string;
  goal_count?: number;
  slack_webhook_url?: string;
  slack_settings?: Record<string, boolean>;
  telegram_chat_id?: string;
  telegram_settings?: Record<string, boolean>;
  created_at?: string;
  [key: string]: unknown;
}

/** Raw shape returned by Supabase for a goal row */
interface RawGoal {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  category?: string;
  emoji?: string;
  status: string;
  priority?: string;
  target_value?: string;
  target_number?: number;
  unit?: string;
  current_value?: number;
  start_date?: string;
  created_at: string;
  updated_at?: string;
  deadline?: string;
  frequency?: string;
  created_by?: string;
  assigned_to?: string[];
  reason?: string;
}

/** Raw shape returned by Supabase for a member row (joined with profiles) */
interface RawMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
  email?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

/** Raw shape returned by Supabase for an invitation row */
interface RawInvite {
  id: string;
  org_id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  invited_by?: string;
  created_at: string;
  inviteLink?: string;
  emailError?: string;
}

const cleanOrgData = <T extends RawOrg>(org: T): T => {
  let name = org.name;
  let description = org.description;
  let emoji = org.emoji;

  // Handle data corrupted by the previous JSON stringification bug
  if (typeof name === "string" && name.startsWith("{")) {
    try {
      const parsed = JSON.parse(name) as Partial<RawOrg>;
      name = (parsed.name as string) || name;
      description = (parsed.description as string) || description;
      emoji = (parsed.emoji as string) || emoji;
    } catch (e) {
      console.warn("Failed to parse corrupted org name:", name);
    }
  }
  return { ...org, name, description, emoji };
};

const cleanGoalData = (goal: RawGoal): OrgGoal => {
  const targetNumber = goal.target_number;
  const currentValue = goal.current_value || 0;

  // Calculate progress: if it's a metric goal with a target number,
  // calculate actual percentage. Otherwise use currentValue as percentage.
  let progress = currentValue;
  if (targetNumber && targetNumber > 0) {
    progress = Math.min(100, Math.round((currentValue / targetNumber) * 100));
  }

  return {
    id: goal.id,
    orgId: goal.org_id,
    title: goal.title,
    description: goal.description ?? "",
    category: goal.category ?? "General",
    emoji: goal.emoji ?? "🎯",
    status: (goal.status as GoalStatus) ?? "not_started",
    priority: (goal.priority as GoalPriority) ?? "medium",
    targetValue: goal.target_value ?? "",
    targetNumber: targetNumber,
    unit: goal.unit,
    currentValue: currentValue,
    startDate: goal.start_date ?? goal.created_at,
    deadline: goal.deadline ?? "",
    frequency: (goal.frequency ?? "one_time") as GoalFrequency,
    createdBy: goal.created_by ?? "",
    assignedTo: goal.assigned_to || [],
    progress: progress,
    comments: [],
    createdAt: goal.created_at,
    updatedAt: goal.updated_at ?? "",
    reason: goal.reason,
  };
};

import { getUserStreak } from "./store-utils";

const cleanMemberData = (
  m: RawMember,
  goals: OrgGoal[],
  checkins: DailyCheckIn[],
): OrgMember => {
  const memberGoals = goals.filter((g) => g.assignedTo.includes(m.id));
  const completed = memberGoals.filter((g) => g.status === "completed").length;
  const completionRate =
    memberGoals.length > 0
      ? Math.round((completed / memberGoals.length) * 100)
      : 0;

  return {
    id: m.id,
    orgId: m.org_id,
    userId: m.user_id,
    role: m.role,
    joinedAt: m.joined_at,
    name: m.profiles?.full_name || "Unknown User",
    avatarUrl: m.profiles?.avatar_url,
    email: m.email || "",
    goalsAssigned: memberGoals.length,
    goalsCompleted: completed,
    completionRate,
    currentStreak: getUserStreak(m.user_id, checkins),
  } as OrgMember;
};


const syncMemberStats = (
  goals: OrgGoal[],
  members: OrgMember[],
  orgId: string,
  checkins: DailyCheckIn[],
): OrgMember[] => {
  return members.map((m) => {
    if (m.orgId !== orgId) return m;

    const memberGoals = goals.filter((g) => g.assignedTo.includes(m.id));
    const completed = memberGoals.filter(
      (g) => g.status === "completed",
    ).length;
    const completionRate =
      memberGoals.length > 0
        ? Math.round((completed / memberGoals.length) * 100)
        : 0;

    return {
      ...m,
      goalsAssigned: memberGoals.length,
      goalsCompleted: completed,
      completionRate,
      currentStreak: getUserStreak(m.userId, checkins),
    };
  }) as OrgMember[];
};

export const useStore = create<AppState>((set, get) => ({
  organizations: [],
  goals: [],
  members: [],
  invitations: [],
  pendingInvitations: [],
  activities: [],
  memberGoalStatuses: [],
  dailyCheckins: [],
  user: null,
  isLoading: false,
  isCheckingNotifications: false,
  error: null,
  sidebarCollapsed: false,

  fetchInitialData: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch User
      const authUser = await authService.getCurrentUser();
      if (authUser) {
        set({
          user: {
            id: authUser.id,
            email: authUser.email || "",
            name:
              authUser.profile?.full_name ||
              authUser.email?.split("@")[0] ||
              "User",
            avatarUrl: authUser.profile?.avatar_url || null,
            subscriptionTier: authUser.profile?.subscription_tier || 'free',
            profile: authUser.profile,
          },
        });
      }

      // 2. Fetch Data
      const orgs = await orgService.getOrganizations();
      let goals: OrgGoal[] = [];
      let members: OrgMember[] = [];
      let invitations: OrgInvite[] = [];
      let pendingInvitations: OrgInvite[] = [];
      let memberGoalStatuses: MemberGoalStatus[] = [];

      if (orgId) {
        const [rawGoals, rawMembers, rawOrgInvites, rawCheckins] =
          await Promise.all([
            goalService.getGoals(orgId),
            orgService.getMembers(orgId),
            inviteService.getInvitations(orgId),
            goalService.getOrgCheckIns([orgId]),
          ]);

        goals = rawGoals.map(cleanGoalData);
        const orgCheckins: DailyCheckIn[] = rawCheckins;
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        invitations = rawOrgInvites
          .filter((i: RawInvite) => new Date(i.created_at) > sevenDaysAgo)
          .map(
            (i: RawInvite): OrgInvite =>
              ({
                id: i.id,
                orgId: i.org_id,
                email: i.email,
                role: i.role as OrgRole,
                status: i.status as "pending" | "accepted" | "declined",
                invitedBy: i.invited_by || "",
                createdAt: i.created_at,
                token: i.token,
              }),
          );

        if (authUser) {
          const rawUserInvites = await inviteService.getPendingForEmail(
            authUser.email ?? "",
          );
          pendingInvitations = rawUserInvites
            .filter((i: RawInvite) => new Date(i.created_at) > sevenDaysAgo)
            .map(
              (i: RawInvite): OrgInvite =>
                ({
                  id: i.id,
                  orgId: i.org_id,
                  email: i.email,
                  role: i.role as OrgRole,
                  status: i.status as "pending" | "accepted" | "declined",
                  token: i.token,
                  createdAt: i.created_at,
                  invitedBy: i.invited_by || "",
                }),
            );
        }

        members = (rawMembers as RawMember[]).map((m) => cleanMemberData(m, goals, orgCheckins));
      } else if (authUser) {
        // Dashboard view: Fetch ALL goals across user's organizations
        const rawGoals = await goalService.getGoalsForUser();
        goals = rawGoals.map(cleanGoalData);

        // Fetch user's own memberships to determine roles
        const userMemberships = await orgService.getMemberships(authUser.id);
        
        // Find orgs where the user is an owner or admin
        const adminedOrgIds = (userMemberships as RawMember[])
          .filter((m) => m.role === 'owner' || m.role === 'admin')
          .map((m) => m.org_id);

        let allMembers: RawMember[] = [];
        let finalStatuses: MemberGoalStatus[] = [];
        let orgCheckins: DailyCheckIn[] = [];

        if (adminedOrgIds.length > 0) {
          // Fetch all members for admined orgs, all statuses, AND all check-ins for streaks
          const [rawOrgMembers, rawOrgStatuses, rawCheckins] =
            await Promise.all([
              orgService.getMembers(adminedOrgIds),
              orgService.getMemberStatuses(adminedOrgIds),
              goalService.getOrgCheckIns(adminedOrgIds),
            ]);
          allMembers = rawOrgMembers;
          orgCheckins = rawCheckins;
          finalStatuses = rawOrgStatuses.map((row: Record<string, any>) => ({
            id: row.id as string,
            goalId: row.goal_id as string,
            userId: row.user_id as string,
            orgId: row.org_id as string,
            status: row.status as MemberGoalStatusValue,
            note: row.note as string | null,
            contribution: (row.contribution as number) ?? 0,
            updatedAt: row.updated_at as string,
            name: "",
            avatarUrl: null,
          }));
        }

        // For orgs where user is NOT an admin, still include the user's own membership info
        const nonAdminMemberships = (userMemberships as RawMember[]).filter((m) => !adminedOrgIds.includes(m.org_id));
        const selfMembers = nonAdminMemberships.map((m) => ({
          ...m,
          name: get().user?.name || "User",
          email: get().user?.email || "",
          profiles: {
            full_name: get().user?.name || "User",
            avatar_url: get().user?.avatarUrl
          }
        })) as RawMember[];

        // Combine and clean
        members = [...allMembers, ...selfMembers].map((m) =>
          cleanMemberData(m, goals, orgCheckins),
        );
        memberGoalStatuses = finalStatuses;

        // Fetch pending invitations
        const rawInvites = await inviteService.getPendingForEmail(
          authUser.email ?? "",
        );
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        pendingInvitations = rawInvites
          .filter((i: RawInvite) => new Date(i.created_at) > sevenDaysAgo)
          .map(
            (i: RawInvite): OrgInvite =>
              ({
                id: i.id,
                orgId: i.org_id,
                email: i.email,
                role: i.role as OrgRole,
                status: i.status as "pending" | "accepted" | "declined",
                token: i.token,
                createdAt: i.created_at,
                invitedBy: i.invited_by || "",
              }),
          );
      }

      // Sync goalCount for organizations based on actual goals fetched
      const finalOrgs = orgs.map((o) => cleanOrgData(o)).map((org) => {
        const orgGoals = goals.filter((g: OrgGoal) => g.orgId === org.id);
        if (orgGoals.length > 0 || (orgId && org.id === orgId)) {
          return { ...org, goalCount: orgGoals.length };
        }
        return org;
      });

      set({
        organizations: finalOrgs as Organization[],
        goals: goals,
        members: members,
        invitations: invitations,
        pendingInvitations: pendingInvitations,
        activities: get().activities,
        memberGoalStatuses: memberGoalStatuses,
        dailyCheckins: get().dailyCheckins,
        isLoading: false,
      });

      // 3. Removed client-side scheduled notifications (Moved to CRON)
      // if (orgId) {
      //   get().checkScheduledNotifications(orgId);
      // }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      set({ error: errorMessage, isLoading: false });
    }
  },

  addOrganization: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newOrg = await orgService.createOrganization(data);
      const cleanedOrg = cleanOrgData(newOrg);
      set((state) => ({
        organizations: [cleanedOrg as any, ...state.organizations],
        isLoading: false,
      }));
      return cleanedOrg.id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },


  sendInvitation: async (orgId, email, role) => {
    set({ isLoading: true });
    try {
      const inviteResp = await inviteService.createInvitation(
        orgId,
        email,
        role,
      );
      const newInvite: OrgInvite = {
        id: inviteResp.id,
        orgId: inviteResp.org_id,
        email: inviteResp.email,
        role: inviteResp.role as OrgRole,
        status: inviteResp.status,
        token: inviteResp.token,
        invitedBy: inviteResp.invited_by,
        createdAt: inviteResp.created_at,
      };
      set((state) => ({
        invitations: [newInvite, ...state.invitations],
        isLoading: false,
      }));
      return {
        link: inviteResp.inviteLink,
        emailError: inviteResp.emailError,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  cancelInvitation: async (inviteId) => {
    try {
      await inviteService.cancelInvitation(inviteId);
      set((state) => ({
        invitations: state.invitations.filter((i) => i.id !== inviteId),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  rejectInvitation: async (token) => {
    try {
      await inviteService.rejectInvitation(token);
      set((state) => ({
        pendingInvitations: state.pendingInvitations.filter((i) => i.token !== token),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      throw err;
    }
  },

  deleteOrganization: async (orgId) => {
    try {
      await orgService.deleteOrganization(orgId);
      set((state) => ({
        organizations: state.organizations.filter((o) => o.id !== orgId),
        goals: state.goals.filter((g) => g.orgId !== orgId),
        members: state.members.filter((m) => m.orgId !== orgId),
        invitations: state.invitations.filter((i) => i.orgId !== orgId),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      throw err;
    }
  },

  addGoal: async (goalData) => {
    set({ isLoading: true });
    try {
      const newGoal = await goalService.createGoal(goalData);
      const cleanedGoal = cleanGoalData(newGoal);

      // Telegram Notification
      const state = get();
      const org = state.organizations.find(o => o.id === cleanedGoal.orgId);
      if (org?.telegramChatId && (org.telegramSettings?.notify_on_creation !== false)) {
        const assigneeNames = (cleanedGoal.assignedTo || [])
          .map(id => state.members.find(m => m.id === id)?.name || "Someone");
        
        fetchWithRetry('/api/telegram/notify', {
          method: 'POST',
          body: JSON.stringify({ 
            chatId: org.telegramChatId, 
            method: 'sendNewGoalNotification', 
            args: [cleanedGoal, assigneeNames] 
          })
        }).catch(err => console.error("Telegram notify error:", err));
      }

      // Slack Notification (via server proxy)
      if (org?.slackWebhookUrl && (org.slackSettings?.notify_on_creation !== false)) {
        const assigneeNames = (cleanedGoal.assignedTo || [])
            .map(id => state.members.find(m => m.id === id)?.name || "Someone");
        fetchWithRetry('/api/slack/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendNewGoalNotification', args: [cleanedGoal, assigneeNames] }),
        }).catch(err => console.error("Slack notify error:", err));
      }

      set((state) => {
        const newGoals = [cleanedGoal, ...state.goals];
        return {
          goals: newGoals,
          members: syncMemberStats(
            newGoals,
            state.members,
            goalData.orgId,
            state.dailyCheckins,
          ),
          organizations: state.organizations.map((o) =>
            o.id === goalData.orgId
              ? { ...o, goalCount: (o.goalCount || 0) + 1 }
              : o,
          ),
          isLoading: false,
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message, isLoading: false });
    }
  },

  updateGoalProgress: async (goalId, currentValue, note) => {
    try {
      await goalService.updateProgress(goalId, currentValue, note);
      set((state) => {
        const newGoals = state.goals.map((g) => {
          if (g.id !== goalId) return g;

          // Recalculate progress percentage
          let progress = currentValue;
          if (g.targetNumber && g.targetNumber > 0) {
            progress = Math.min(
              100,
              Math.round((currentValue / g.targetNumber) * 100),
            );
          }

          return {
            ...g,
            currentValue,
            progress,
            updatedAt: new Date().toISOString(),
          };
        });

        const updatedGoal = newGoals.find((g) => g.id === goalId);
        if (!updatedGoal) return { goals: newGoals };

        // Handle Slack Win Notification on 100% Progress
        const org = state.organizations.find(o => o.id === updatedGoal.orgId);
        const oldGoal = state.goals.find(g => g.id === goalId);
        const member = state.members.find(m => updatedGoal.assignedTo.includes(m.id));
        const streakCount = member?.currentStreak || 0;
        
        if (org?.slackWebhookUrl && org.slackSettings?.notify_on_completion && updatedGoal.progress >= 100 && oldGoal && oldGoal.progress < 100) {
          fetchWithRetry('/api/slack/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendGoalCompletion', args: [state.user?.name || "Someone", updatedGoal, streakCount] }),
          }).catch(err => console.error("Slack notify error:", err));
        }

        if (org?.telegramChatId && org.telegramSettings?.notify_on_completion && updatedGoal.progress >= 100 && oldGoal && oldGoal.progress < 100) {
          const userName = state.user?.name || "Someone";
          fetchWithRetry('/api/telegram/notify', {
            method: 'POST',
            body: JSON.stringify({ 
              chatId: org.telegramChatId, 
              method: 'sendGoalCompletion', 
              args: [userName, updatedGoal, streakCount] 
            })
          }).catch(err => console.error("Telegram proxy error:", err));
        }

        // Handle Progress Updates (if enabled)
        if (updatedGoal.progress < 100 || (oldGoal && oldGoal.progress < 100)) {
          const userName = state.user?.name || "Someone";
          if (org?.slackWebhookUrl && org.slackSettings?.notify_on_checkin) {
            fetch('/api/slack/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendCheckInNotification', args: [userName, updatedGoal.title, note] }),
            }).catch(err => console.error("Slack checkin notify error:", err));
          }
          if (org?.telegramChatId && org.telegramSettings?.notify_on_checkin) {
             fetchWithRetry('/api/telegram/notify', {
              method: 'POST',
              body: JSON.stringify({ 
                chatId: org.telegramChatId, 
                method: 'sendCheckInNotification', 
                args: [userName, updatedGoal.title, note] 
              })
            }).catch(err => console.error("Telegram checkin proxy error:", err));
          }
        }

        return {
          goals: newGoals,
          members: syncMemberStats(
            newGoals,
            state.members,
            updatedGoal.orgId,
            state.dailyCheckins,
          ),
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  updateGoalStatus: async (goalId, status, reason) => {
    try {
      await goalService.updateStatus(goalId, status);
      set((state) => {
        const oldGoal = state.goals.find(g => g.id === goalId);
        const newGoals = state.goals.map((g) =>
          g.id === goalId
            ? { 
                ...g, 
                status, 
                reason: status === 'blocked' ? reason : (status === 'completed' ? undefined : g.reason),
                updatedAt: new Date().toISOString() 
              }
            : g,
        );

        const updatedGoal = newGoals.find((g) => g.id === goalId);
        if (!updatedGoal) return { goals: newGoals };

        // Trigger Slack Notifications
        const org = state.organizations.find(o => o.id === updatedGoal.orgId);
        if (oldGoal) {
          const userName = state.user?.name || "Someone";
          
          // Slack (via server proxy)
          if (org?.slackWebhookUrl) {
            if (status === "completed" && oldGoal.status !== "completed" && org.slackSettings?.notify_on_completion) {
              const member = state.members.find(m => updatedGoal.assignedTo.includes(m.id));
              const streakCount = member?.currentStreak || 0;
              fetchWithRetry('/api/slack/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendGoalCompletion', args: [userName, updatedGoal, streakCount] }),
              }).catch(e => console.error("Slack notify error:", e));
            } else if (status === "blocked" && oldGoal.status !== "blocked" && org.slackSettings?.notify_on_blocked) {
              fetchWithRetry('/api/slack/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendGoalBlocked', args: [userName, updatedGoal, reason || "No reason provided"] }),
              }).catch(e => console.error("Slack notify error:", e));
            }
          }

          // Telegram (Secure Proxy)
          if (org?.telegramChatId) {
            const sendNotify = async (method: string, args: any[]) => {
              try {
                await fetchWithRetry('/api/telegram/notify', {
                  method: 'POST',
                  body: JSON.stringify({ chatId: org.telegramChatId, method, args })
                });
              } catch (e) {
                console.error(`Telegram proxy error (${method}):`, e);
              }
            };

            if (status === "completed" && oldGoal.status !== "completed" && org.telegramSettings?.notify_on_completion) {
              const member = state.members.find(m => updatedGoal.assignedTo.includes(m.id));
              const streakCount = member?.currentStreak || 0;
              sendNotify('sendGoalCompletion', [userName, updatedGoal, streakCount]);
            } else if (status === "blocked" && oldGoal.status !== "blocked" && org.telegramSettings?.notify_on_blocked) {
              sendNotify('sendGoalBlocked', [userName, updatedGoal, reason || "No reason provided"]);
            }
          }
        }

        return {
          goals: newGoals,
          members: syncMemberStats(
            newGoals,
            state.members,
            updatedGoal.orgId,
            state.dailyCheckins,
          ),
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
    }
  },

  deleteGoal: async (goalId, orgId) => {
    const goalToDelete = get().goals.find((g) => g.id === goalId);
    if (!goalToDelete) return;

    try {
      await goalService.deleteGoal(goalId, orgId);
      set((state) => {
        const newGoals = state.goals.filter((g) => g.id !== goalId);
        return {
          goals: newGoals,
          members: syncMemberStats(
            newGoals,
            state.members,
            orgId,
            state.dailyCheckins,
          ),
          organizations: state.organizations.map((o) =>
            o.id === orgId
              ? { ...o, goalCount: Math.max(0, (o.goalCount || 0) - 1) }
              : o,
          ),
        };
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      set({ error: message });
      throw err;
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({
      user: null,
      organizations: [],
      goals: [],
      members: [],
      memberGoalStatuses: [],
      dailyCheckins: [],
    });
  },
  
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  fetchMemberStatuses: async (goalId) => {
    try {
      const statuses = await goalService.getMemberStatuses(goalId);
      set((state) => ({
        // Replace statuses for this goal, keep others
        memberGoalStatuses: [
          ...state.memberGoalStatuses.filter((s) => s.goalId !== goalId),
          ...statuses,
        ],
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("fetchMemberStatuses error:", message);
    }
  },

  upsertMemberStatus: async (goalId, orgId, status, note, contribution) => {
    await goalService.upsertMemberStatus(
      goalId,
      orgId,
      status,
      note,
      contribution,
    );
    // Refresh statuses for this goal so the UI updates immediately
    await get().fetchMemberStatuses(goalId);
  },

  dailyCheckIn: async (goalId, checkDate, note) => {
    await goalService.dailyCheckIn(goalId, checkDate, note);
    // Update local state optimistically
    const {
      data: { user },
    } = await (await import("@/lib/supabase")).getSupabase().auth.getUser();
    if (user) {
      const newCheckIn: DailyCheckIn = {
        id: crypto.randomUUID(),
        goalId,
        userId: user.id,
        checkDate,
        completed: true,
        note: note || null,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const updatedCheckins = [
          ...state.dailyCheckins.filter(
            (c) =>
              !(
                c.goalId === goalId &&
                c.userId === user.id &&
                c.checkDate === checkDate
              ),
          ),
          newCheckIn,
        ];
        const goal = state.goals.find((g) => g.id === goalId);
        return {
          dailyCheckins: updatedCheckins,
          members: goal
            ? syncMemberStats(
                state.goals,
                state.members,
                goal.orgId,
                updatedCheckins,
              )
            : state.members,
        };
      });

      // Telegram Notification
      const state = get();
      const goal = state.goals.find(g => g.id === goalId);
      const org = state.organizations.find(o => o.id === goal?.orgId);
      if (org?.telegramChatId && org.telegramSettings?.notify_on_checkin) {
        const userName = state.user?.name || "Someone";
        fetchWithRetry('/api/telegram/notify', {
          method: 'POST',
          body: JSON.stringify({ 
            chatId: org.telegramChatId, 
            method: 'sendCheckInNotification', 
            args: [userName, goal?.title || "Goal", note] 
          })
        }).catch(err => console.error("Telegram notify error:", err));
      }

      // Slack Notification (via server proxy)
      if (org?.slackWebhookUrl && org.slackSettings?.notify_on_checkin) {
        const userName = state.user?.name || "Someone";
        fetchWithRetry('/api/slack/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookUrl: org.slackWebhookUrl, method: 'sendCheckInNotification', args: [userName, goal?.title || "Goal", note] }),
        }).catch(err => console.error("Slack notify error:", err));
      }
    }
  },

  undoDailyCheckIn: async (goalId, checkDate) => {
    const {
      data: { user },
    } = await (await import("@/lib/supabase")).getSupabase().auth.getUser();
    await goalService.undoDailyCheckIn(goalId, checkDate);
    if (user) {
      set((state) => {
        const updatedCheckins = state.dailyCheckins.filter(
          (c) =>
            !(
              c.goalId === goalId &&
              c.userId === user.id &&
              c.checkDate === checkDate
            ),
        );
        const goal = state.goals.find((g) => g.id === goalId);
        return {
          dailyCheckins: updatedCheckins,
          members: goal
            ? syncMemberStats(
                state.goals,
                state.members,
                goal.orgId,
                updatedCheckins,
              )
            : state.members,
        };
      });
    }
  },

  fetchCheckIns: async (goalId) => {
    try {
      const checkins = await goalService.getCheckIns(goalId);
      set((state) => ({
        dailyCheckins: [
          ...state.dailyCheckins.filter((c) => c.goalId !== goalId),
          ...checkins,
        ],
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("fetchCheckIns error:", message);
    }
  },

  updateOrganization: async (orgId, data) => {
    try {
      const updatedOrg = await orgService.updateOrganization(orgId, data);
      set((state) => ({
        organizations: state.organizations.map((o) =>
          o.id === orgId ? { ...o, ...updatedOrg } : o,
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("updateOrganization error:", message);
      throw err;
    }
  },
}));
