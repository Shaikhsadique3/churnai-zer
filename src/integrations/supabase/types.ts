export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      churn_predictions: {
        Row: {
          churn_probability: number | null
          explanation: string | null
          feature_importance: Json | null
          id: string
          is_active: boolean | null
          model_version: string | null
          prediction_date: string | null
          user_id: string | null
        }
        Insert: {
          churn_probability?: number | null
          explanation?: string | null
          feature_importance?: Json | null
          id?: string
          is_active?: boolean | null
          model_version?: string | null
          prediction_date?: string | null
          user_id?: string | null
        }
        Update: {
          churn_probability?: number | null
          explanation?: string | null
          feature_importance?: Json | null
          id?: string
          is_active?: boolean | null
          model_version?: string | null
          prediction_date?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      churn_trigger_logs: {
        Row: {
          action_taken: string
          churn_score: number
          created_at: string
          error_message: string | null
          id: string
          playbook_name: string
          success: boolean
          target_user_id: string
          trigger_reason: string | null
          triggered_at: string
          user_id: string
        }
        Insert: {
          action_taken: string
          churn_score: number
          created_at?: string
          error_message?: string | null
          id?: string
          playbook_name?: string
          success?: boolean
          target_user_id: string
          trigger_reason?: string | null
          triggered_at?: string
          user_id: string
        }
        Update: {
          action_taken?: string
          churn_score?: number
          created_at?: string
          error_message?: string | null
          id?: string
          playbook_name?: string
          success?: boolean
          target_user_id?: string
          trigger_reason?: string | null
          triggered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_logs: {
        Row: {
          created_at: string
          id: string
          is_test: boolean | null
          request_payload: Json | null
          response_body: string | null
          response_status: number | null
          status: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean | null
          request_payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          status?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean | null
          request_payload?: Json | null
          response_body?: string | null
          response_status?: number | null
          status?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
      csv_uploads: {
        Row: {
          created_at: string | null
          export_data: Json | null
          filename: string
          id: string
          rows_failed: number | null
          rows_processed: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          export_data?: Json | null
          filename: string
          id?: string
          rows_failed?: number | null
          rows_processed?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          export_data?: Json | null
          filename?: string
          id?: string
          rows_failed?: number | null
          rows_processed?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_metrics: {
        Row: {
          avg_session_duration: unknown | null
          billing_cycle: string | null
          company_size: string | null
          created_at: string | null
          failed_payments: number | null
          feature_usage: Json | null
          id: string
          industry: string | null
          last_login: string | null
          location: string | null
          login_frequency: number | null
          next_renewal_date: string | null
          plan_type: string | null
          refund_requests: number | null
          subscription_start_date: string | null
          total_payments: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_session_duration?: unknown | null
          billing_cycle?: string | null
          company_size?: string | null
          created_at?: string | null
          failed_payments?: number | null
          feature_usage?: Json | null
          id?: string
          industry?: string | null
          last_login?: string | null
          location?: string | null
          login_frequency?: number | null
          next_renewal_date?: string | null
          plan_type?: string | null
          refund_requests?: number | null
          subscription_start_date?: string | null
          total_payments?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_session_duration?: unknown | null
          billing_cycle?: string | null
          company_size?: string | null
          created_at?: string | null
          failed_payments?: number | null
          feature_usage?: Json | null
          id?: string
          industry?: string | null
          last_login?: string | null
          location?: string | null
          login_frequency?: number | null
          next_renewal_date?: string | null
          plan_type?: string | null
          refund_requests?: number | null
          subscription_start_date?: string | null
          total_payments?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          created_at: string
          email_data: Json | null
          error_message: string | null
          id: string
          opened_at: string | null
          playbook_id: string | null
          sent_at: string | null
          status: string
          target_email: string
          target_user_id: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          email_data?: Json | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          playbook_id?: string | null
          sent_at?: string | null
          status?: string
          target_email: string
          target_user_id?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          email_data?: Json | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          playbook_id?: string | null
          sent_at?: string | null
          status?: string
          target_email?: string
          target_user_id?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          created_at: string
          crm_api_key: string | null
          crm_webhook_url: string | null
          email_api_key: string | null
          email_provider: string | null
          id: string
          is_crm_connected: boolean | null
          sender_email: string | null
          sender_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          status: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          crm_api_key?: string | null
          crm_webhook_url?: string | null
          email_api_key?: string | null
          email_provider?: string | null
          id?: string
          is_crm_connected?: boolean | null
          sender_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          crm_api_key?: string | null
          crm_webhook_url?: string | null
          email_api_key?: string | null
          email_provider?: string | null
          id?: string
          is_crm_connected?: boolean | null
          sender_email?: string | null
          sender_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      playbook_actions_queue: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          error_message: string | null
          execute_at: string
          executed_at: string | null
          id: string
          playbook_id: string | null
          status: string
          step_index: number
          target_user_id: string
          user_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          created_at?: string
          error_message?: string | null
          execute_at?: string
          executed_at?: string | null
          id?: string
          playbook_id?: string | null
          status?: string
          step_index?: number
          target_user_id: string
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          error_message?: string | null
          execute_at?: string
          executed_at?: string | null
          id?: string
          playbook_id?: string | null
          status?: string
          step_index?: number
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_actions_queue_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_audit_log: {
        Row: {
          action_data: Json
          action_type: string
          error_message: string | null
          executed_at: string
          id: string
          playbook_id: string | null
          status: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          error_message?: string | null
          executed_at?: string
          id?: string
          playbook_id?: string | null
          status: string
          target_user_id: string
          user_id: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          error_message?: string | null
          executed_at?: string
          id?: string
          playbook_id?: string | null
          status?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_audit_log_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbook_logs: {
        Row: {
          action_taken: string
          log_id: string
          playbook_id: string | null
          triggered_at: string
          user_id: string
        }
        Insert: {
          action_taken: string
          log_id?: string
          playbook_id?: string | null
          triggered_at?: string
          user_id: string
        }
        Update: {
          action_taken?: string
          log_id?: string
          playbook_id?: string | null
          triggered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playbook_logs_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
          webhook_enabled: boolean | null
          webhook_trigger_conditions: Json | null
          webhook_url: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
          webhook_enabled?: boolean | null
          webhook_trigger_conditions?: Json | null
          webhook_url?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
          webhook_enabled?: boolean | null
          webhook_trigger_conditions?: Json | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      retention_emails: {
        Row: {
          clicked_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      smtp_providers: {
        Row: {
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          is_verified: boolean
          provider_name: string | null
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port: number
          smtp_username: string
          test_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          is_verified?: boolean
          provider_name?: string | null
          smtp_host: string
          smtp_password_encrypted: string
          smtp_port?: number
          smtp_username: string
          test_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          is_verified?: boolean
          provider_name?: string | null
          smtp_host?: string
          smtp_password_encrypted?: string
          smtp_port?: number
          smtp_username?: string
          test_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_interactions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          resolution_time: unknown | null
          resolved_at: string | null
          sentiment_score: number | null
          status: string | null
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolution_time?: unknown | null
          resolved_at?: string | null
          sentiment_score?: number | null
          status?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolution_time?: unknown | null
          resolved_at?: string | null
          sentiment_score?: number | null
          status?: string | null
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_data: {
        Row: {
          action_recommended: string | null
          churn_reason: string | null
          churn_score: number | null
          created_at: string | null
          days_until_mature: number | null
          id: string
          is_deleted: boolean | null
          last_login: string | null
          owner_id: string
          plan: Database["public"]["Enums"]["plan_type"] | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          understanding_score: number | null
          updated_at: string | null
          usage: number | null
          user_id: string
          user_stage: string | null
        }
        Insert: {
          action_recommended?: string | null
          churn_reason?: string | null
          churn_score?: number | null
          created_at?: string | null
          days_until_mature?: number | null
          id?: string
          is_deleted?: boolean | null
          last_login?: string | null
          owner_id: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          understanding_score?: number | null
          updated_at?: string | null
          usage?: number | null
          user_id: string
          user_stage?: string | null
        }
        Update: {
          action_recommended?: string | null
          churn_reason?: string | null
          churn_score?: number | null
          created_at?: string | null
          days_until_mature?: number | null
          id?: string
          is_deleted?: boolean | null
          last_login?: string | null
          owner_id?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          understanding_score?: number | null
          updated_at?: string | null
          usage?: number | null
          user_id?: string
          user_stage?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          error_message: string | null
          id: string
          payload: Json
          playbook_id: string | null
          response_body: string | null
          response_status: number | null
          success: boolean | null
          target_user_id: string
          triggered_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          payload: Json
          playbook_id?: string | null
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          target_user_id: string
          triggered_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          error_message?: string | null
          id?: string
          payload?: Json
          playbook_id?: string | null
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          target_user_id?: string
          triggered_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          high_risk_count: number | null
          id: string
          low_risk_count: number | null
          medium_risk_count: number | null
          report_date: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          high_risk_count?: number | null
          id?: string
          low_risk_count?: number | null
          medium_risk_count?: number | null
          report_date: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          high_risk_count?: number | null
          id?: string
          low_risk_count?: number | null
          medium_risk_count?: number | null
          report_date?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_existing_user_insights: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      plan_type: "Free" | "Pro" | "Enterprise"
      risk_level: "low" | "medium" | "high"
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
      plan_type: ["Free", "Pro", "Enterprise"],
      risk_level: ["low", "medium", "high"],
    },
  },
} as const
