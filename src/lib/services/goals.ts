import { getSupabase } from "@/lib/supabase";
import { OrgGoal, GoalStatus, DailyCheckIn } from "@/types";

export const goalService = {
  async getGoals(orgIdOrIds: string | string[]) {
    let query = getSupabase().from("goals").select("*");

    if (Array.isArray(orgIdOrIds)) {
      query = query.in("org_id", orgIdOrIds);
    } else {
      query = query.eq("org_id", orgIdOrIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getGoalsForUser() {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) return [];

    // First find orgs user is in
    const { data: memberOf } = await getSupabase()
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id);

    if (!memberOf || memberOf.length === 0) return [];
    const orgIds = memberOf.map((m: { org_id: string }) => m.org_id);

    return this.getGoals(orgIds);
  },

  async createGoal(
    goal: Omit<
      OrgGoal,
      "id" | "createdAt" | "updatedAt" | "progress" | "comments"
    >,
  ) {
    const { data, error } = await getSupabase()
      .from("goals")
      .insert([
        {
          org_id: goal.orgId,
          title: goal.title,
          description: goal.description,
          emoji: goal.emoji,
          target_value: goal.targetValue,
          target_number: goal.targetNumber,
          unit: goal.unit,
          current_value: 0,
          frequency: goal.frequency || "one_time",
          start_date: goal.startDate || new Date().toISOString(),
          deadline: goal.deadline,
          category: goal.category,
          status: "not_started",
          priority: goal.priority,
          assigned_to: goal.assignedTo,
          created_by: goal.createdBy,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Goal creation error:", error);
      if (error.code === "42501") {
        throw new Error(
          "Permission denied. You don't have permission to create goals in this organization.",
        );
      }
      throw error;
    }
    return data;
  },

  async updateProgress(goalId: string, progress: number, note?: string) {
    // Update goal progress
    const { error: goalError } = await getSupabase()
      .from("goals")
      .update({ current_value: progress, updated_at: new Date().toISOString() })
      .eq("id", goalId);

    if (goalError) {
      console.error("Goal progress update error:", goalError);
      if (goalError.code === "42501") {
        throw new Error(
          "Permission denied. You don't have permission to update this goal's progress.",
        );
      }
      throw goalError;
    }

    // If a note is provided, add it to progress_updates
    if (note) {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      if (user) {
        await getSupabase()
          .from("progress_updates")
          .insert([
            {
              goal_id: goalId,
              user_id: user.id,
              content: note,
              progress_value: progress,
            },
          ]);
      }
    }
  },

  async updateGoal(goalId: string, data: Partial<OrgGoal>) {
    const { error } = await getSupabase()
      .from("goals")
      .update({
        title: data.title,
        description: data.description,
        emoji: data.emoji,
        target_value: data.targetValue,
        target_number: data.targetNumber,
        unit: data.unit,
        start_date: data.startDate,
        deadline: data.deadline,
        category: data.category,
        priority: data.priority,
        status: data.status,
        assigned_to: data.assignedTo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (error) {
      console.error("Goal update error:", error);
      throw error;
    }
  },

  async updateStatus(goalId: string, status: GoalStatus, reason?: string) {
    const { error } = await getSupabase()
      .from("goals")
      .update({ 
        status, 
        reason: status === 'blocked' ? reason : (status === 'completed' ? null : undefined), 
        updated_at: new Date().toISOString() 
      })
      .eq("id", goalId);
    if (error) throw error;
  },

  async deleteGoal(goalId: string, orgId: string) {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    console.log(
      "Delete attempt by:",
      user?.id,
      "for goal:",
      goalId,
      "in org:",
      orgId,
    );

    // Verify membership role first
    const { data: member } = await getSupabase()
      .from("org_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user?.id)
      .single();

    console.log("Member role in DB:", member?.role);

    // 1. Delete associated progress updates first
    const { error: updatesError } = await getSupabase()
      .from("progress_updates")
      .delete()
      .eq("goal_id", goalId);

    if (updatesError) {
      console.error("Error deleting updates:", updatesError);
    }

    // 2. Delete the goal itself
    const { data, error } = await getSupabase()
      .from("goals")
      .delete()
      .eq("id", goalId)
      .select();

    if (error) {
      console.error("Goal deletion error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      // Check if goal exists but was just blocked by RLS
      const { data: exists } = await getSupabase()
        .from("goals")
        .select("id")
        .eq("id", goalId)
        .single();
      if (exists) {
        throw new Error(
          `Permission denied. You are a ${member?.role || "unknown"} in this org, but the database RLS policy is blocking this deletion. This usually means only the goal creator can delete it.`,
        );
      } else {
        throw new Error("Goal not found or already deleted.");
      }
    }
  },

  async getMemberStatuses(goalId: string) {
    const { data, error } = await getSupabase()
      .from("member_goal_status")
      .select("*")
      .eq("goal_id", goalId);

    if (error) {
      console.error("getMemberStatuses error:", error);
      throw error;
    }

    console.log("getMemberStatuses raw data for goal", goalId, data);

    return (data ?? []).map((row: Record<string, any>) => ({
      id: row.id,
      goalId: row.goal_id,
      userId: row.user_id,
      orgId: row.org_id,
      status: row.status,
      note: row.note,
      contribution: row.contribution ?? 0,
      updatedAt: row.updated_at,
      // name/avatarUrl will be resolved in GoalCard from the store members
      name: "",
      avatarUrl: null,
    }));
  },

  async upsertMemberStatus(
    goalId: string,
    orgId: string,
    status: string,
    note: string,
    contribution?: number,
  ) {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) throw new Error("Not authenticated");

    console.log("upsertMemberStatus called:", {
      goalId,
      orgId,
      userId: user.id,
      status,
      note,
      contribution,
    });

    const { data, error } = await getSupabase()
      .from("member_goal_status")
      .upsert(
        {
          goal_id: goalId,
          user_id: user.id,
          org_id: orgId,
          status,
          note: note || null,
          contribution: contribution ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "goal_id,user_id" },
      )
      .select();

    if (error) {
      console.error("upsertMemberStatus error:", error);
      throw error;
    }

    console.log("upsertMemberStatus result:", data);
  },

  async dailyCheckIn(goalId: string, checkDate: string, note?: string) {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await getSupabase()
      .from("daily_checkins")
      .upsert(
        {
          goal_id: goalId,
          user_id: user.id,
          check_date: checkDate,
          completed: true,
          note: note || null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "goal_id,user_id,check_date" },
      )
      .select();

    if (error) {
      console.error("dailyCheckIn error:", error);
      throw error;
    }
    return data;
  },

  async undoDailyCheckIn(goalId: string, checkDate: string) {
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await getSupabase()
      .from("daily_checkins")
      .delete()
      .eq("goal_id", goalId)
      .eq("user_id", user.id)
      .eq("check_date", checkDate);

    if (error) {
      console.error("undoDailyCheckIn error:", error);
      throw error;
    }
  },

  async getCheckIns(goalId: string, startDate?: string, endDate?: string) {
    let query = getSupabase()
      .from("daily_checkins")
      .select("*")
      .eq("goal_id", goalId);

    if (startDate) query = query.gte("check_date", startDate);
    if (endDate) query = query.lte("check_date", endDate);

    const { data, error } = await query.order("check_date", { ascending: false });
    if (error) {
      console.error("getCheckIns error:", error);
      throw error;
    }

    return (data ?? []).map((row: Record<string, any>): DailyCheckIn => ({
      id: row.id,
      goalId: row.goal_id,
      userId: row.user_id,
      checkDate: row.check_date,
      completed: row.completed,
      note: row.note,
      createdAt: row.created_at,
    }));
  },

  async getOrgCheckIns(orgIdOrIds: string | string[]) {
    // 1. Get all goal IDs for these orgs
    const { data: goals, error: goalsError } = await getSupabase()
        .from('goals')
        .select('id')
        .in('org_id', Array.isArray(orgIdOrIds) ? orgIdOrIds : [orgIdOrIds]);

    if (goalsError) throw goalsError;
    if (!goals || goals.length === 0) return [];

    const goalIds = goals.map((g: { id: string }) => g.id);

    // 2. Fetch all check-ins for those goals
    const { data, error } = await getSupabase()
        .from('daily_checkins')
        .select('*')
        .in('goal_id', goalIds)
        .order('check_date', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((row: Record<string, any>): DailyCheckIn => ({
        id: row.id,
        goalId: row.goal_id,
        userId: row.user_id,
        checkDate: row.check_date,
        completed: row.completed,
        note: row.note,
        createdAt: row.created_at,
    }));
  },
};
