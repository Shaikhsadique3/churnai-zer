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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          hashed_key: string
          id: string
          is_active: boolean | null
          key: string
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hashed_key: string
          id?: string
          is_active?: boolean | null
          key: string
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hashed_key?: string
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          meta_description: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          meta_description?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_type: string
          brand_profile_id: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_primary: boolean | null
          mime_type: string | null
          user_id: string
        }
        Insert: {
          asset_type: string
          brand_profile_id?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          user_id: string
        }
        Update: {
          asset_type?: string
          brand_profile_id?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_primary?: boolean | null
          mime_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          brand_guidelines: string | null
          brand_keywords: string[] | null
          brand_name: string
          created_at: string
          do_not_use: string[] | null
          font_preferences: string | null
          id: string
          preferred_style: string | null
          primary_color: string | null
          secondary_color: string | null
          target_audience: string | null
          tone_of_voice: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_guidelines?: string | null
          brand_keywords?: string[] | null
          brand_name: string
          created_at?: string
          do_not_use?: string[] | null
          font_preferences?: string | null
          id?: string
          preferred_style?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_guidelines?: string | null
          brand_keywords?: string[] | null
          brand_name?: string
          created_at?: string
          do_not_use?: string[] | null
          font_preferences?: string | null
          id?: string
          preferred_style?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cancel_guard_coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          project_id: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          project_id: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_coupons_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "cancel_guard_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cancel_guard_decisions: {
        Row: {
          created_at: string
          customer_id: string | null
          decision: string
          decision_data: Json | null
          id: string
          offer_shown: string | null
          project_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          decision: string
          decision_data?: Json | null
          id?: string
          offer_shown?: string | null
          project_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          decision?: string
          decision_data?: Json | null
          id?: string
          offer_shown?: string | null
          project_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_decisions_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "cancel_guard_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cancel_guard_events: {
        Row: {
          created_at: string
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          project_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          project_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          project_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_events_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "cancel_guard_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cancel_guard_offers: {
        Row: {
          config: Json
          created_at: string
          description: string
          id: string
          is_active: boolean
          offer_type: string
          priority: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          offer_type: string
          priority?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          offer_type?: string
          priority?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_offers_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "cancel_guard_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cancel_guard_projects: {
        Row: {
          api_key_hash: string
          created_at: string
          domain: string
          id: string
          is_active: boolean
          name: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key_hash: string
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean
          name: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key_hash?: string
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cancel_guard_settings: {
        Row: {
          analytics_config: Json | null
          created_at: string
          domain_allowlist: string[] | null
          id: string
          modal_config: Json
          project_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          analytics_config?: Json | null
          created_at?: string
          domain_allowlist?: string[] | null
          id?: string
          modal_config?: Json
          project_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          analytics_config?: Json | null
          created_at?: string
          domain_allowlist?: string[] | null
          id?: string
          modal_config?: Json
          project_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_settings_project"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "cancel_guard_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      churn_analysis_results: {
        Row: {
          avg_cltv: number | null
          churn_rate: number | null
          cohort_retention_data: Json | null
          created_at: string
          feature_importance: Json | null
          high_risk_customers: number | null
          id: string
          low_risk_customers: number | null
          medium_risk_customers: number | null
          net_mrr_churn: number | null
          top_churn_drivers: Json | null
          total_customers: number
          upload_id: string
          user_id: string
        }
        Insert: {
          avg_cltv?: number | null
          churn_rate?: number | null
          cohort_retention_data?: Json | null
          created_at?: string
          feature_importance?: Json | null
          high_risk_customers?: number | null
          id?: string
          low_risk_customers?: number | null
          medium_risk_customers?: number | null
          net_mrr_churn?: number | null
          top_churn_drivers?: Json | null
          total_customers: number
          upload_id: string
          user_id: string
        }
        Update: {
          avg_cltv?: number | null
          churn_rate?: number | null
          cohort_retention_data?: Json | null
          created_at?: string
          feature_importance?: Json | null
          high_risk_customers?: number | null
          id?: string
          low_risk_customers?: number | null
          medium_risk_customers?: number | null
          net_mrr_churn?: number | null
          top_churn_drivers?: Json | null
          total_customers?: number
          upload_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "churn_analysis_results_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "csv_uploads"
            referencedColumns: ["id"]
          },
        ]
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
      content_exports: {
        Row: {
          content_generation_id: string | null
          created_at: string
          error_message: string | null
          export_data: Json | null
          export_type: string
          export_url: string | null
          exported_at: string | null
          id: string
          status: Database["public"]["Enums"]["export_status"] | null
          user_id: string
        }
        Insert: {
          content_generation_id?: string | null
          created_at?: string
          error_message?: string | null
          export_data?: Json | null
          export_type: string
          export_url?: string | null
          exported_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["export_status"] | null
          user_id: string
        }
        Update: {
          content_generation_id?: string | null
          created_at?: string
          error_message?: string | null
          export_data?: Json | null
          export_type?: string
          export_url?: string | null
          exported_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["export_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_exports_content_generation_id_fkey"
            columns: ["content_generation_id"]
            isOneToOne: false
            referencedRelation: "content_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generations: {
        Row: {
          brand_profile_id: string | null
          character_count: number | null
          created_at: string
          engagement_stats: Json | null
          generated_content: string
          hashtags: string[] | null
          id: string
          is_published: boolean | null
          mentions: string[] | null
          original_prompt: string
          platform: Database["public"]["Enums"]["content_platform"]
          published_at: string | null
          scheduled_for: string | null
          tone: Database["public"]["Enums"]["content_tone"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_profile_id?: string | null
          character_count?: number | null
          created_at?: string
          engagement_stats?: Json | null
          generated_content: string
          hashtags?: string[] | null
          id?: string
          is_published?: boolean | null
          mentions?: string[] | null
          original_prompt: string
          platform: Database["public"]["Enums"]["content_platform"]
          published_at?: string | null
          scheduled_for?: string | null
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_profile_id?: string | null
          character_count?: number | null
          created_at?: string
          engagement_stats?: Json | null
          generated_content?: string
          hashtags?: string[] | null
          id?: string
          is_published?: boolean | null
          mentions?: string[] | null
          original_prompt?: string
          platform?: Database["public"]["Enums"]["content_platform"]
          published_at?: string | null
          scheduled_for?: string | null
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generations_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          name: string
          platform: Database["public"]["Enums"]["content_platform"]
          template_content: string
          tone: Database["public"]["Enums"]["content_tone"] | null
          updated_at: string
          usage_count: number | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          platform: Database["public"]["Enums"]["content_platform"]
          template_content: string
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          platform?: Database["public"]["Enums"]["content_platform"]
          template_content?: string
          tone?: Database["public"]["Enums"]["content_tone"] | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          variables?: Json | null
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
      customer_churn_predictions: {
        Row: {
          analysis_id: string
          churn_probability: number
          contributing_factors: Json | null
          customer_id: string
          days_since_last_active: number | null
          days_since_signup: number | null
          id: string
          monthly_revenue: number | null
          recommended_actions: Json | null
          risk_level: string
          subscription_plan: string | null
        }
        Insert: {
          analysis_id: string
          churn_probability: number
          contributing_factors?: Json | null
          customer_id: string
          days_since_last_active?: number | null
          days_since_signup?: number | null
          id?: string
          monthly_revenue?: number | null
          recommended_actions?: Json | null
          risk_level: string
          subscription_plan?: string | null
        }
        Update: {
          analysis_id?: string
          churn_probability?: number
          contributing_factors?: Json | null
          customer_id?: string
          days_since_last_active?: number | null
          days_since_signup?: number | null
          id?: string
          monthly_revenue?: number | null
          recommended_actions?: Json | null
          risk_level?: string
          subscription_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_churn_predictions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "churn_analysis_results"
            referencedColumns: ["id"]
          },
        ]
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
      digests: {
        Row: {
          action: string
          content: string
          created_at: string
          id: string
          topic: string
          user_id: string
        }
        Insert: {
          action: string
          content: string
          created_at?: string
          id?: string
          topic: string
          user_id: string
        }
        Update: {
          action?: string
          content?: string
          created_at?: string
          id?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      digests_log: {
        Row: {
          created_at: string
          delivery_method: string
          delivery_status: string | null
          digest_content: Json
          digest_id: string | null
          error_message: string | null
          id: string
          sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_method: string
          delivery_status?: string | null
          digest_content: Json
          digest_id?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_method?: string
          delivery_status?: string | null
          digest_content?: Json
          digest_id?: string | null
          error_message?: string | null
          id?: string
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digests_log_digest_id_fkey"
            columns: ["digest_id"]
            isOneToOne: false
            referencedRelation: "digests"
            referencedColumns: ["id"]
          },
        ]
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
      founder_profile: {
        Row: {
          biggest_retention_challenge: string | null
          company_name: string
          company_size: string
          company_website: string | null
          completed_at: string | null
          created_at: string
          current_churn_rate: number | null
          existing_retention_tools: string | null
          founded_year: number | null
          id: string
          industry: string
          location: string
          main_competitors: string | null
          monthly_revenue: number | null
          onboarding_completed: boolean | null
          pricing_model: string
          product_description: string
          revenue_model: string
          success_metrics: string | null
          target_market: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biggest_retention_challenge?: string | null
          company_name: string
          company_size: string
          company_website?: string | null
          completed_at?: string | null
          created_at?: string
          current_churn_rate?: number | null
          existing_retention_tools?: string | null
          founded_year?: number | null
          id?: string
          industry: string
          location: string
          main_competitors?: string | null
          monthly_revenue?: number | null
          onboarding_completed?: boolean | null
          pricing_model: string
          product_description: string
          revenue_model: string
          success_metrics?: string | null
          target_market: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biggest_retention_challenge?: string | null
          company_name?: string
          company_size?: string
          company_website?: string | null
          completed_at?: string | null
          created_at?: string
          current_churn_rate?: number | null
          existing_retention_tools?: string | null
          founded_year?: number | null
          id?: string
          industry?: string
          location?: string
          main_competitors?: string | null
          monthly_revenue?: number | null
          onboarding_completed?: boolean | null
          pricing_model?: string
          product_description?: string
          revenue_model?: string
          success_metrics?: string | null
          target_market?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          attachments: Json | null
          body_html: string | null
          body_text: string | null
          created_at: string | null
          from_email: string
          id: string
          is_read: boolean | null
          priority: string | null
          received_at: string | null
          subject: string | null
          to_email: string
        }
        Insert: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          from_email: string
          id?: string
          is_read?: boolean | null
          priority?: string | null
          received_at?: string | null
          subject?: string | null
          to_email: string
        }
        Update: {
          attachments?: Json | null
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          from_email?: string
          id?: string
          is_read?: boolean | null
          priority?: string | null
          received_at?: string | null
          subject?: string | null
          to_email?: string
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
      integration_settings_audit: {
        Row: {
          action: string
          changed_at: string | null
          changed_fields: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_fields?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_fields?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_test_results: {
        Row: {
          api_key: string | null
          churn_score: number | null
          created_at: string
          domain: string
          founder_id: string
          id: string
          risk_level: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          churn_score?: number | null
          created_at?: string
          domain: string
          founder_id: string
          id?: string
          risk_level?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          churn_score?: number | null
          created_at?: string
          domain?: string
          founder_id?: string
          id?: string
          risk_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key: string
          checked_at: string
          created_at: string
          error_message: string | null
          founder_id: string
          id: string
          status: string
          trace_id: string | null
          user_id: string
          website: string
        }
        Insert: {
          api_key: string
          checked_at?: string
          created_at?: string
          error_message?: string | null
          founder_id: string
          id?: string
          status: string
          trace_id?: string | null
          user_id: string
          website: string
        }
        Update: {
          api_key?: string
          checked_at?: string
          created_at?: string
          error_message?: string | null
          founder_id?: string
          id?: string
          status?: string
          trace_id?: string | null
          user_id?: string
          website?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          is_test_mode: boolean | null
          lemon_squeezy_order_id: string | null
          plan_id: string | null
          status: string
          transaction_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_test_mode?: boolean | null
          lemon_squeezy_order_id?: string | null
          plan_id?: string | null
          status: string
          transaction_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_test_mode?: boolean | null
          lemon_squeezy_order_id?: string | null
          plan_id?: string | null
          status?: string
          transaction_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      preferences: {
        Row: {
          created_at: string
          delivery_format: string
          frequency: string
          id: string
          preferred_topics: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_format: string
          frequency: string
          id?: string
          preferred_topics?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_format?: string
          frequency?: string
          id?: string
          preferred_topics?: string[]
          updated_at?: string
          user_id?: string
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
      recovery_logs: {
        Row: {
          id: string
          owner_id: string
          recovered_at: string
          recovery_reason: string
          revenue_saved: number | null
          user_id: string
        }
        Insert: {
          id?: string
          owner_id: string
          recovered_at?: string
          recovery_reason: string
          revenue_saved?: number | null
          user_id: string
        }
        Update: {
          id?: string
          owner_id?: string
          recovered_at?: string
          recovery_reason?: string
          revenue_saved?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_insights: string | null
          analysis_id: string
          completed_at: string | null
          created_at: string
          file_size: number | null
          id: string
          pdf_file_path: string
          report_name: string
          report_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          ai_insights?: string | null
          analysis_id: string
          completed_at?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          pdf_file_path: string
          report_name: string
          report_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          ai_insights?: string | null
          analysis_id?: string
          completed_at?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          pdf_file_path?: string
          report_name?: string
          report_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "churn_analysis_results"
            referencedColumns: ["id"]
          },
        ]
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
      sdk_health_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          ping_timestamp: string
          request_data: Json | null
          response_time_ms: number | null
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          ping_timestamp?: string
          request_data?: Json | null
          response_time_ms?: number | null
          status?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          ping_timestamp?: string
          request_data?: Json | null
          response_time_ms?: number | null
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sdk_integrations: {
        Row: {
          api_key_hash: string | null
          created_at: string
          id: string
          timestamp: string
          trace_id: string
          user_id: string
          website: string
        }
        Insert: {
          api_key_hash?: string | null
          created_at?: string
          id?: string
          timestamp?: string
          trace_id?: string
          user_id: string
          website: string
        }
        Update: {
          api_key_hash?: string | null
          created_at?: string
          id?: string
          timestamp?: string
          trace_id?: string
          user_id?: string
          website?: string
        }
        Relationships: []
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
      subscription_plans: {
        Row: {
          created_at: string | null
          credits_per_month: number
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_per_month: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_per_month?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          updated_at?: string | null
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
      user_activity: {
        Row: {
          created_at: string
          email: string
          event: string
          id: string
          monthly_revenue: number | null
          owner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          event: string
          id?: string
          monthly_revenue?: number | null
          owner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          event?: string
          id?: string
          monthly_revenue?: number | null
          owner_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_available: number
          credits_limit: number
          credits_used: number
          id: string
          reset_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_available?: number
          credits_limit?: number
          credits_used?: number
          id?: string
          reset_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_available?: number
          credits_limit?: number
          credits_used?: number
          id?: string
          reset_date?: string | null
          updated_at?: string | null
          user_id?: string
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
          monthly_revenue: number | null
          owner_id: string
          plan: Database["public"]["Enums"]["plan_type"] | null
          recovered_at: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          source: string | null
          status: Database["public"]["Enums"]["user_prediction_status"] | null
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
          monthly_revenue?: number | null
          owner_id: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          recovered_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["user_prediction_status"] | null
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
          monthly_revenue?: number | null
          owner_id?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          recovered_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["user_prediction_status"] | null
          understanding_score?: number | null
          updated_at?: string | null
          usage?: number | null
          user_id?: string
          user_stage?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_test_mode: boolean | null
          lemon_squeezy_order_id: string | null
          lemon_squeezy_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_test_mode?: boolean | null
          lemon_squeezy_order_id?: string | null
          lemon_squeezy_subscription_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_test_mode?: boolean | null
          lemon_squeezy_order_id?: string | null
          lemon_squeezy_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          company: string | null
          created_at: string
          email: string
          email_sent: boolean
          id: string
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          email_sent?: boolean
          id?: string
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean
          id?: string
          name?: string
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
      deduct_user_credits: {
        Args: { credits_to_deduct: number; user_uuid: string }
        Returns: boolean
      }
      encrypt_sensitive_data: {
        Args: { data: string }
        Returns: string
      }
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      hash_api_key: {
        Args: { api_key: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_monthly_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_existing_user_insights: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_api_key: {
        Args: { input_key: string }
        Returns: string
      }
      verify_encrypted_credential: {
        Args: { input_plain: string; stored_encrypted: string }
        Returns: boolean
      }
    }
    Enums: {
      content_platform:
        | "twitter"
        | "linkedin"
        | "instagram"
        | "email"
        | "facebook"
        | "blog"
      content_tone:
        | "professional"
        | "witty"
        | "minimal"
        | "persuasive"
        | "friendly"
        | "authoritative"
      export_status: "pending" | "completed" | "failed"
      notification_type: "risk" | "recovery" | "email"
      plan_type: "Free" | "Pro" | "Enterprise"
      risk_level: "low" | "medium" | "high"
      user_prediction_status: "at_risk" | "recovered"
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
      content_platform: [
        "twitter",
        "linkedin",
        "instagram",
        "email",
        "facebook",
        "blog",
      ],
      content_tone: [
        "professional",
        "witty",
        "minimal",
        "persuasive",
        "friendly",
        "authoritative",
      ],
      export_status: ["pending", "completed", "failed"],
      notification_type: ["risk", "recovery", "email"],
      plan_type: ["Free", "Pro", "Enterprise"],
      risk_level: ["low", "medium", "high"],
      user_prediction_status: ["at_risk", "recovered"],
    },
  },
} as const
