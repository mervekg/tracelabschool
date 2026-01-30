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
      assignments: {
        Row: {
          assignment_type: string | null
          class_id: string
          created_at: string
          description: string | null
          due_date: string | null
          external_link: string | null
          id: string
          pdf_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignment_type?: string | null
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          external_link?: string | null
          id?: string
          pdf_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string | null
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          external_link?: string | null
          id?: string
          pdf_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_join_codes: {
        Row: {
          class_id: string
          code: string
          created_at: string
          expires_at: string | null
          id: string
        }
        Insert: {
          class_id: string
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
        }
        Update: {
          class_id?: string
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_join_codes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: true
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color: string | null
          created_at: string
          grade_level: string
          id: string
          is_favorite: boolean | null
          name: string
          section: string
          subject: string
          teacher_id: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          grade_level: string
          id?: string
          is_favorite?: boolean | null
          name: string
          section: string
          subject: string
          teacher_id: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          grade_level?: string
          id?: string
          is_favorite?: boolean | null
          name?: string
          section?: string
          subject?: string
          teacher_id?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          class_id: string | null
          created_at: string
          id: string
          is_email_sent: boolean
          is_read: boolean
          recipient_email: string | null
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          body: string
          class_id?: string | null
          created_at?: string
          id?: string
          is_email_sent?: boolean
          is_read?: boolean
          recipient_email?: string | null
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          body?: string
          class_id?: string | null
          created_at?: string
          id?: string
          is_email_sent?: boolean
          is_read?: boolean
          recipient_email?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          class_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          ai_feedback: string | null
          assignment_id: string
          content: string | null
          created_at: string
          handwriting_image_url: string | null
          id: string
          score: number | null
          status: string
          student_id: string
          submitted_at: string | null
          teacher_feedback: string | null
          updated_at: string
        }
        Insert: {
          ai_feedback?: string | null
          assignment_id: string
          content?: string | null
          created_at?: string
          handwriting_image_url?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string
        }
        Update: {
          ai_feedback?: string | null
          assignment_id?: string
          content?: string | null
          created_at?: string
          handwriting_image_url?: string | null
          id?: string
          score?: number | null
          status?: string
          student_id?: string
          submitted_at?: string | null
          teacher_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string
          email: string
          enrolled_at: string
          full_name: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          class_id: string
          email: string
          enrolled_at?: string
          full_name: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          class_id?: string
          email?: string
          enrolled_at?: string
          full_name?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          created_at: string
          custom_subject: string | null
          grade_level: string
          id: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_subject?: string | null
          grade_level: string
          id?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_subject?: string | null
          grade_level?: string
          id?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student" | "parent"
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
      app_role: ["admin", "teacher", "student", "parent"],
    },
  },
} as const
