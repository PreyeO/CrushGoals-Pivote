export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_emoji: string | null
          badge_id: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_emoji?: string | null
          badge_id: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_emoji?: string | null
          badge_id?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      email_verification_otps: {
        Row: {
          attempts: number | null
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          otp_code: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      friend_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          goal_id: string | null
          id: string
          invite_token: string | null
          invitee_email: string
          inviter_id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          invite_token?: string | null
          invitee_email: string
          inviter_id: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          invite_token?: string | null
          invitee_email?: string
          inviter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_invites_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_templates: {
        Row: {
          category: string
          clarifying_questions: Json
          created_at: string
          daily_task_patterns: Json
          default_duration_days: number
          description: string
          emoji: string
          id: string
          name: string
          participant_count: number | null
          success_rate: number | null
          template_phases: Json
          updated_at: string
        }
        Insert: {
          category: string
          clarifying_questions?: Json
          created_at?: string
          daily_task_patterns?: Json
          default_duration_days?: number
          description: string
          emoji?: string
          id?: string
          name: string
          participant_count?: number | null
          success_rate?: number | null
          template_phases?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          clarifying_questions?: Json
          created_at?: string
          daily_task_patterns?: Json
          default_duration_days?: number
          description?: string
          emoji?: string
          id?: string
          name?: string
          participant_count?: number | null
          success_rate?: number | null
          template_phases?: Json
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          current_value: string | null
          deadline: string | null
          emoji: string | null
          goal_metadata: Json | null
          id: string
          is_paused: boolean | null
          name: string
          pause_reason: string | null
          paused_at: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          target_value: string | null
          task_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          current_value?: string | null
          deadline?: string | null
          emoji?: string | null
          goal_metadata?: Json | null
          id?: string
          is_paused?: boolean | null
          name: string
          pause_reason?: string | null
          paused_at?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          target_value?: string | null
          task_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          current_value?: string | null
          deadline?: string | null
          emoji?: string | null
          goal_metadata?: Json | null
          id?: string
          is_paused?: boolean | null
          name?: string
          pause_reason?: string | null
          paused_at?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          target_value?: string | null
          task_frequency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          success: boolean
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          success?: boolean
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          success?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          preferred_currency: string | null
          show_on_leaderboard: boolean | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          preferred_currency?: string | null
          show_on_leaderboard?: boolean | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          preferred_currency?: string | null
          show_on_leaderboard?: boolean | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      shared_goal_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          shared_goal_id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          shared_goal_id: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          shared_goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_goal_activities_shared_goal_id_fkey"
            columns: ["shared_goal_id"]
            isOneToOne: false
            referencedRelation: "shared_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_goal_comments: {
        Row: {
          comment_type: string
          content: string
          created_at: string
          id: string
          shared_goal_id: string
          user_id: string
        }
        Insert: {
          comment_type?: string
          content: string
          created_at?: string
          id?: string
          shared_goal_id: string
          user_id: string
        }
        Update: {
          comment_type?: string
          content?: string
          created_at?: string
          id?: string
          shared_goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_goal_comments_shared_goal_id_fkey"
            columns: ["shared_goal_id"]
            isOneToOne: false
            referencedRelation: "shared_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_goal_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invite_token: string
          invitee_email: string
          invitee_user_id: string | null
          inviter_id: string
          shared_goal_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invitee_email: string
          invitee_user_id?: string | null
          inviter_id: string
          shared_goal_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invitee_email?: string
          invitee_user_id?: string | null
          inviter_id?: string
          shared_goal_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_goal_invites_shared_goal_id_fkey"
            columns: ["shared_goal_id"]
            isOneToOne: false
            referencedRelation: "shared_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_goal_members: {
        Row: {
          goal_id: string | null
          id: string
          joined_at: string
          shared_goal_id: string
          user_id: string
        }
        Insert: {
          goal_id?: string | null
          id?: string
          joined_at?: string
          shared_goal_id: string
          user_id: string
        }
        Update: {
          goal_id?: string | null
          id?: string
          joined_at?: string
          shared_goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_goal_members_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_goal_members_shared_goal_id_fkey"
            columns: ["shared_goal_id"]
            isOneToOne: false
            referencedRelation: "shared_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_goals: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_id: string | null
          payment_provider: string | null
          plan: string | null
          status: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          plan?: string | null
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          goal_id: string | null
          id: string
          priority: string | null
          time_estimate: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: string | null
          time_estimate?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          goal_id?: string | null
          id?: string
          priority?: string | null
          time_estimate?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          perfect_days: number | null
          tasks_completed: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          perfect_days?: number | null
          tasks_completed?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          perfect_days?: number | null
          tasks_completed?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_audit_logs: {
        Args: { limit_count?: number }
        Returns: {
          action: string
          admin_id: string
          created_at: string
          id: string
          new_values: Json
          old_values: Json
          target_id: string
          target_table: string
        }[]
      }
      admin_get_stats: {
        Args: never
        Returns: {
          active_subscribers: number
          total_goals: number
          total_users: number
          trial_users: number
        }[]
      }
      admin_get_users: {
        Args: never
        Returns: {
          created_at: string
          current_streak: number
          email: string
          full_name: string
          goals_count: number
          level: number
          plan: string
          subscription_status: string
          total_xp: number
          trial_ends_at: string
          user_id: string
        }[]
      }
      check_admin_login_rate_limit: {
        Args: { check_email: string }
        Returns: number
      }
      check_invitee_email_exists: {
        Args: { p_email: string }
        Returns: boolean
      }
      check_login_rate_limit: { Args: { check_email: string }; Returns: number }
      generate_email_otp: {
        Args: { p_email: string; p_user_id: string }
        Returns: string
      }
      get_invitee_basic_info: {
        Args: { p_email: string }
        Returns: {
          avatar_url: string
          username: string
        }[]
      }
      get_leaderboard_data: {
        Args: { limit_count?: number }
        Returns: {
          current_streak: number
          display_name: string
          level: number
          tasks_completed: number
          total_xp: number
          user_id: string
        }[]
      }
      get_leaderboard_data_filtered: {
        Args: { limit_count?: number; time_filter?: string }
        Returns: {
          current_streak: number
          display_name: string
          level: number
          tasks_completed: number
          total_xp: number
          user_id: string
        }[]
      }
      get_shared_goal_progress: {
        Args: { p_shared_goal_id: string }
        Returns: {
          current_streak: number
          goal_progress: number
          tasks_completed_today: number
          tasks_completed_week: number
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_login_attempt: {
        Args: { attempt_email: string; attempt_success: boolean }
        Returns: undefined
      }
      verify_email_otp: {
        Args: { p_otp: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
