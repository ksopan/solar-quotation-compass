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
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_questionnaires: {
        Row: {
          acceptance_deadline: string | null
          battery_reason: string | null
          created_at: string
          customer_id: string | null
          email: string
          first_name: string
          id: string
          interested_in_batteries: boolean
          is_completed: boolean
          last_name: string
          monthly_electric_bill: number
          ownership_status: string
          property_type: string
          proposal_deadline: string | null
          purchase_timeline: string
          roof_age_status: string
          status: Database["public"]["Enums"]["questionnaire_status"] | null
          submitted_at: string | null
          updated_at: string
          version: number | null
          willing_to_remove_trees: boolean
        }
        Insert: {
          acceptance_deadline?: string | null
          battery_reason?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          first_name: string
          id?: string
          interested_in_batteries?: boolean
          is_completed?: boolean
          last_name: string
          monthly_electric_bill?: number
          ownership_status?: string
          property_type?: string
          proposal_deadline?: string | null
          purchase_timeline?: string
          roof_age_status?: string
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          submitted_at?: string | null
          updated_at?: string
          version?: number | null
          willing_to_remove_trees?: boolean
        }
        Update: {
          acceptance_deadline?: string | null
          battery_reason?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          first_name?: string
          id?: string
          interested_in_batteries?: boolean
          is_completed?: boolean
          last_name?: string
          monthly_electric_bill?: number
          ownership_status?: string
          property_type?: string
          proposal_deadline?: string | null
          purchase_timeline?: string
          roof_age_status?: string
          status?: Database["public"]["Enums"]["questionnaire_status"] | null
          submitted_at?: string | null
          updated_at?: string
          version?: number | null
          willing_to_remove_trees?: boolean
        }
        Relationships: []
      }
      quotation_document_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          quotation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          quotation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          quotation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_document_files_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_proposal_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          proposal_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          proposal_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          proposal_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_proposal_attachments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "quotation_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_proposals: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          installation_timeframe: string
          property_questionnaire_id: string | null
          proposal_details: string
          quotation_request_id: string | null
          rejected_at: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          status_new: Database["public"]["Enums"]["proposal_status"] | null
          submitted_at: string | null
          total_price: number
          updated_at: string
          vendor_id: string
          warranty_period: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          installation_timeframe: string
          property_questionnaire_id?: string | null
          proposal_details: string
          quotation_request_id?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          status_new?: Database["public"]["Enums"]["proposal_status"] | null
          submitted_at?: string | null
          total_price: number
          updated_at?: string
          vendor_id: string
          warranty_period: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          installation_timeframe?: string
          property_questionnaire_id?: string | null
          proposal_details?: string
          quotation_request_id?: string | null
          rejected_at?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          status_new?: Database["public"]["Enums"]["proposal_status"] | null
          submitted_at?: string | null
          total_price?: number
          updated_at?: string
          vendor_id?: string
          warranty_period?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_proposals_property_questionnaire_id_fkey"
            columns: ["property_questionnaire_id"]
            isOneToOne: false
            referencedRelation: "property_questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_proposals_quotation_request_id_fkey"
            columns: ["quotation_request_id"]
            isOneToOne: false
            referencedRelation: "quotation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_requests: {
        Row: {
          additional_notes: string | null
          budget: number | null
          created_at: string
          customer_id: string
          energy_usage: number | null
          id: string
          location: string
          roof_area: number
          roof_type: string
          status: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          budget?: number | null
          created_at?: string
          customer_id: string
          energy_usage?: number | null
          id?: string
          location: string
          roof_area: number
          roof_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          budget?: number | null
          created_at?: string
          customer_id?: string
          energy_usage?: number | null
          id?: string
          location?: string
          roof_area?: number
          roof_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          email: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string
          email: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_proposal: { Args: { proposal_id: string }; Returns: boolean }
      can_edit_questionnaire: {
        Args: { questionnaire_id: string }
        Returns: boolean
      }
      customer_can_view_vendor: {
        Args: { customer_id: string; vendor_id: string }
        Returns: boolean
      }
    }
    Enums: {
      proposal_status:
        | "draft"
        | "submitted"
        | "accepted"
        | "rejected"
        | "withdrawn"
      questionnaire_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "proposals_received"
        | "completed"
        | "cancelled"
        | "pending_verification"
        | "active"
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
      proposal_status: [
        "draft",
        "submitted",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      questionnaire_status: [
        "draft",
        "submitted",
        "under_review",
        "proposals_received",
        "completed",
        "cancelled",
        "pending_verification",
        "active",
      ],
    },
  },
} as const
