import { create } from "zustand";
import {
  Organization,
  OrgGoal,
  OrgMember,
  OrgRole,
  OrgInvite,
  ActivityItem,
  GoalStatus,
  MemberGoalStatus,
  MemberGoalStatusValue,
  DailyCheckIn,
  Profile,
} from "@/types";
import { goalService } from "./services/goals";
import { orgService } from "./services/orgs";
import { inviteService } from "./services/invites";
import { slackService } from "./services/slack";
import { telegramService } from "./services/telegram";

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
  checkScheduledNotifications: (orgId: string) => Promise<void>;
}

import { authService } from "./services/auth";

const cleanOrgData = (org: any) => {
  let name = org.name;
  let description = org.description;
  let emoji = org.emoji;

  // Handle data corrupted by the previous JSON stringification bug
  if (typeof name === "string" && name.startsWith("{")) {
    try {
      const parsed = JSON.parse(name);
      name = parsed.name || name;
      description = parsed.description || description;
      emoji = parsed.emoji || emoji;
    } catch (e) {
      console.warn("Failed to parse corrupted org name:", name);
    }
  }
  return { ...org, name, description, emoji };
};

const cleanGoalData = (goal: any): OrgGoal => {
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
    description: goal.description,
    category: goal.category,
    emoji: goal.emoji,
    status: goal.status,
    priority: goal.priority,
    targetValue: goal.target_value,
    targetNumber: targetNumber,
    unit: goal.unit,
    currentValue: currentValue,
    startDate: goal.start_date || goal.created_at,
    deadline: goal.deadline,
    frequency: goal.frequency || "one_time",
    createdBy: goal.created_by,
    assignedTo: goal.assigned_to || [],
    progress: progress,
    comments: [],
    createdAt: goal.created_at,
    updatedAt: goal.updated_at,
  };
};

import { getUserStreak } from "./store-utils";

const cleanMemberData = (
  m: any,
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
          .filter((i: any) => new Date(i.created_at) > sevenDaysAgo)
          .map(
            (i: any) =>
              ({
                id: i.id,
                orgId: i.org_id,
                email: i.email,
                role: i.role,
                status: i.status,
                invitedBy: i.invited_by,
                createdAt: i.created_at,
                token: i.token,
              }) as any,
          );

        if (authUser) {
          const rawUserInvites = await inviteService.getPendingForEmail(
            authUser.email ?? "",
          );
          pendingInvitations = rawUserInvites
            .filter((i: any) => new Date(i.created_at) > sevenDaysAgo)
            .map(
              (i: any) =>
                ({
                  id: i.id,
                  orgId: i.org_id,
                  email: i.email,
                  role: i.role,
                  status: i.status,
                  token: i.token,
                  createdAt: i.created_at,
                }) as any,
            );
        }

        members = rawMembers.map((m: any) => cleanMemberData(m, goals, orgCheckins));
      } else if (authUser) {
        // Dashboard view: Fetch ALL goals across user's organizations
        const rawGoals = await goalService.getGoalsForUser();
        goals = rawGoals.map(cleanGoalData);

        // Fetch user's own memberships to determine roles
        const userMemberships = await orgService.getMemberships(authUser.id);
        
        // Find orgs where the user is an owner or admin
        const adminedOrgIds = userMemberships
          .filter((m: any) => m.role === 'owner' || m.role === 'admin')
          .map((m: any) => m.org_id);

        let allMembers: any[] = [];
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
          finalStatuses = rawOrgStatuses.map((row: any) => ({
            id: row.id,
            goalId: row.goal_id,
            userId: row.user_id,
            orgId: row.org_id,
            status: row.status,
            note: row.note,
            contribution: row.contribution ?? 0,
            updatedAt: row.updated_at,
            name: "",
            avatarUrl: null,
          }));
        }

        // For orgs where user is NOT an admin, still include the user's own membership info
        const nonAdminMemberships = userMemberships.filter((m: any) => !adminedOrgIds.includes(m.org_id));
        const selfMembers = nonAdminMemberships.map((m: any) => ({
          ...m,
          name: get().user?.name || "User",
          email: get().user?.email || "",
          profiles: {
            full_name: get().user?.name || "User",
            avatar_url: get().user?.avatarUrl
          }
        }));

        // Combine and clean
        members = [...allMembers, ...selfMembers].map((m: any) =>
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
          .filter((i: any) => new Date(i.created_at) > sevenDaysAgo)
          .map(
            (i: any) =>
              ({
                id: i.id,
                orgId: i.org_id,
                email: i.email,
                role: i.role,
                status: i.status,
                token: i.token,
                createdAt: i.created_at,
              }) as any,
          );
      }

      // Sync goalCount for organizations based on actual goals fetched
      const finalOrgs = orgs.map(cleanOrgData).map((org: any) => {
        const orgGoals = goals.filter((g: OrgGoal) => g.orgId === org.id);
        if (orgGoals.length > 0 || (orgId && org.id === orgId)) {
          return { ...org, goalCount: orgGoals.length };
        }
        return org;
      });

      set({
        organizations: finalOrgs as any,
        goals: goals as any,
        members: members as any,
        invitations: invitations as any,
        pendingInvitations: pendingInvitations as any,
        activities: get().activities,
        memberGoalStatuses: memberGoalStatuses,
        dailyCheckins: get().dailyCheckins,
        isLoading: false,
      });

      // 3. Check for scheduled Slack messages
      if (orgId) {
        get().checkScheduledNotifications(orgId);
      }

    } catch (err: any) {
      set({ error: err.message, isLoading: false });
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
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
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
        role: inviteResp.role as any,
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
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  cancelInvitation: async (inviteId) => {
    try {
      await inviteService.cancelInvitation(inviteId);
      set((state) => ({
        invitations: state.invitations.filter((i) => i.id !== inviteId),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addGoal: async (goalData) => {
    set({ isLoading: true });
    try {
      const newGoal = await goalService.createGoal(goalData);
      const cleanedGoal = cleanGoalData(newGoal);
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
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
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
        
        if (org?.slackWebhookUrl && org.slackSettings?.notify_on_completion && updatedGoal.progress >= 100 && oldGoal && oldGoal.progress < 100) {
            slackService.sendGoalCompletion(
              org.slackWebhookUrl, 
              state.user?.name || "Someone", 
              updatedGoal
            ).catch(err => console.error("Slack notify error:", err));
        }

        if (org?.telegramChatId && org.telegramSettings?.notify_on_completion && updatedGoal.progress >= 100 && oldGoal && oldGoal.progress < 100) {
          const userName = state.user?.name || "Someone";
          fetch('/api/telegram/notify', {
            method: 'POST',
            body: JSON.stringify({ 
              chatId: org.telegramChatId, 
              method: 'sendGoalCompletion', 
              args: [userName, updatedGoal] 
            })
          }).catch(err => console.error("Telegram proxy error:", err));
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
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateGoalStatus: async (goalId, status, reason) => {
    try {
      await goalService.updateStatus(goalId, status);
      set((state) => {
        const oldGoal = state.goals.find(g => g.id === goalId);
        const newGoals = state.goals.map((g) =>
          g.id === goalId
            ? { ...g, status, updatedAt: new Date().toISOString() }
            : g,
        );

        const updatedGoal = newGoals.find((g) => g.id === goalId);
        if (!updatedGoal) return { goals: newGoals };

        // Trigger Slack Notifications
        const org = state.organizations.find(o => o.id === updatedGoal.orgId);
        if (oldGoal) {
          const userName = state.user?.name || "Someone";
          
          // Slack
          if (org?.slackWebhookUrl) {
            if (status === "completed" && oldGoal.status !== "completed" && org.slackSettings?.notify_on_completion) {
              slackService.sendGoalCompletion(org.slackWebhookUrl, userName, updatedGoal)
                .catch(e => console.error("Slack notify error:", e));
            } else if (status === "blocked" && oldGoal.status !== "blocked" && org.slackSettings?.notify_on_blocked) {
              slackService.sendGoalBlocked(org.slackWebhookUrl, userName, updatedGoal, reason || "No reason provided")
                .catch(e => console.error("Slack notify error:", e));
            }
          }

          // Telegram (Secure Proxy)
          if (org?.telegramChatId) {
            const sendNotify = async (method: string, args: any[]) => {
              try {
                await fetch('/api/telegram/notify', {
                  method: 'POST',
                  body: JSON.stringify({ chatId: org.telegramChatId, method, args })
                });
              } catch (e) {
                console.error(`Telegram proxy error (${method}):`, e);
              }
            };

            if (status === "completed" && oldGoal.status !== "completed" && org.telegramSettings?.notify_on_completion) {
              sendNotify('sendGoalCompletion', [userName, updatedGoal]);
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
    } catch (err: any) {
      set({ error: err.message });
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
    } catch (err: any) {
      set({ error: err.message });
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
    } catch (err: any) {
      console.error("fetchMemberStatuses error:", err.message);
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
    } catch (err: any) {
      console.error("fetchCheckIns error:", err.message);
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
    } catch (err: any) {
      console.error("updateOrganization error:", err.message);
      throw err;
    }
  },

  checkScheduledNotifications: async (orgId) => {
    if (get().isCheckingNotifications) return;

    const org = get().organizations.find(o => o.id === orgId);
    if (!org?.slackWebhookUrl && !org?.telegramBotToken) return;

    const now = new Date();
    const isMonday = now.getDay() === 1;
    const hour = now.getHours();

    set({ isCheckingNotifications: true });

    try {
      // 1. Weekly Summary (Monday 8-11am)
      const shouldSendSummary = isMonday && hour >= 8 && hour < 11 && (
        !org.lastWeeklySummaryAt || 
        new Date(org.lastWeeklySummaryAt).getTime() < now.getTime() - 24 * 60 * 60 * 1000 * 6 // 6 days
      );

      if (shouldSendSummary) {
        // Optimistically update
        set((state) => ({
          organizations: state.organizations.map(o => 
            o.id === orgId ? { ...o, lastWeeklySummaryAt: now.toISOString() } : o
          )
        }));

        const orgGoals = get().goals.filter(g => g.orgId === orgId);
        const crushed = orgGoals.filter(g => g.status === 'completed').length;
        const blocked = orgGoals.filter(g => g.status === 'blocked').length;
        const active = orgGoals.length - crushed - blocked;

        if (org.slackWebhookUrl) {
          await slackService.sendWeeklySummary(org.slackWebhookUrl, crushed, active, blocked);
        }
        if (org.telegramChatId) {
          fetch('/api/telegram/notify', {
            method: 'POST',
            body: JSON.stringify({ 
              chatId: org.telegramChatId, 
              method: 'sendWeeklySummary', 
              args: [crushed, active, blocked] 
            })
          }).catch(err => console.error("Telegram proxy error:", err));
        }
        await orgService.updateOrganization(orgId, { lastWeeklySummaryAt: now.toISOString() });
      }

      // 2. Stale Goal Nudge (Daily check, once per 24h)
      const shouldCheckStaleSlack = org.slackWebhookUrl && org.slackSettings?.notify_on_stale && (
        !org.lastSlackNudgeAt || 
        new Date(org.lastSlackNudgeAt).getTime() < now.getTime() - 24 * 60 * 60 * 1000 // 24 hours
      );

      const shouldCheckStaleTelegram = org.telegramChatId && org.telegramSettings?.notify_on_stale && (
        !org.lastTelegramNudgeAt || 
        new Date(org.lastTelegramNudgeAt).getTime() < now.getTime() - 24 * 60 * 60 * 1000 // 24 hours
      );

      if (shouldCheckStaleSlack || shouldCheckStaleTelegram) {
        // Optimistically update
        set((state) => ({
          organizations: state.organizations.map(o => {
            if (o.id !== orgId) return o;
            const update: any = {};
            if (shouldCheckStaleSlack) update.lastSlackNudgeAt = now.toISOString();
            if (shouldCheckStaleTelegram) update.lastTelegramNudgeAt = now.toISOString();
            return { ...o, ...update };
          })
        }));

        const slackThreshold = org.slackSettings?.stale_threshold_days || 7;
        const telegramThreshold = org.telegramSettings?.stale_threshold_days || 7;
        
        const orgGoals = get().goals.filter(g => g.orgId === orgId && g.status !== 'completed');
        
        const getStaleFor = (threshold: number) => orgGoals.filter(g => {
          const lastUpdate = new Date(g.updatedAt);
          const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceUpdate >= threshold;
        }).map(g => {
          const owner = get().members.find(m => g.assignedTo.includes(m.id));
          return {
            title: g.title,
            memberName: owner?.name || "Someone",
            days: Math.floor((now.getTime() - new Date(g.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
          };
        });

        if (shouldCheckStaleSlack) {
          const staleSlack = getStaleFor(slackThreshold);
          if (staleSlack.length > 0) {
            await slackService.sendStaleNudge(org.slackWebhookUrl!, staleSlack);
          }
          await orgService.updateOrganization(orgId, { lastSlackNudgeAt: now.toISOString() });
        }

        if (shouldCheckStaleTelegram) {
          const staleTelegram = getStaleFor(telegramThreshold);
          if (staleTelegram.length > 0) {
            fetch('/api/telegram/notify', {
              method: 'POST',
              body: JSON.stringify({ 
                chatId: org.telegramChatId!, 
                method: 'sendStaleNudge', 
                args: [staleTelegram] 
              })
            }).catch(err => console.error("Telegram proxy error:", err));
          }
          await orgService.updateOrganization(orgId, { lastTelegramNudgeAt: now.toISOString() });
        }
      }
    } catch (err) {
      console.error("Scheduled notifications error:", err);
    } finally {
      set({ isCheckingNotifications: false });
    }
  }
}));
