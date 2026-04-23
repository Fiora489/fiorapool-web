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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_progress: {
        Row: {
          consistency_score: number | null
          created_at: string
          id: string
          level: number
          prestige_title: string | null
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          consistency_score?: number | null
          created_at?: string
          id?: string
          level?: number
          prestige_title?: string | null
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          consistency_score?: number | null
          created_at?: string
          id?: string
          level?: number
          prestige_title?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          accent_champion: string | null
          accessibility_prefs: Json
          colour_blind_mode: boolean
          created_at: string
          id: string
          theme: string
          ui_scale: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_champion?: string | null
          accessibility_prefs?: Json
          colour_blind_mode?: boolean
          created_at?: string
          id?: string
          theme?: string
          ui_scale?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_champion?: string | null
          accessibility_prefs?: Json
          colour_blind_mode?: boolean
          created_at?: string
          id?: string
          theme?: string
          ui_scale?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      champ_select_sessions: {
        Row: {
          active: boolean
          session_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          session_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          session_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coaching_notes: {
        Row: {
          champion: string
          content: string
          enemy_champion: string | null
          id: string
          kind: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          champion: string
          content?: string
          enemy_champion?: string | null
          id?: string
          kind: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          champion?: string
          content?: string
          enemy_champion?: string | null
          id?: string
          kind?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          assists: number
          captured_at: string
          champion_id: number
          champion_name: string | null
          cs: number
          cs_diff_at_10: number | null
          cs_diff_at_20: number | null
          damage_dealt: number
          deaths: number
          enemy_champion_id: number | null
          enemy_champion_name: string | null
          game_duration_seconds: number
          game_id: number
          gold_diff_at_10: number | null
          id: string
          items_json: Json | null
          kills: number
          queue_type: string
          role: string | null
          spell_casts_json: Json | null
          user_id: string
          vision_score: number
          ward_events_json: Json | null
          wards_killed: number
          wards_placed: number
          win: boolean
        }
        Insert: {
          assists?: number
          captured_at?: string
          champion_id: number
          champion_name?: string | null
          cs?: number
          cs_diff_at_10?: number | null
          cs_diff_at_20?: number | null
          damage_dealt?: number
          deaths?: number
          enemy_champion_id?: number | null
          enemy_champion_name?: string | null
          game_duration_seconds?: number
          game_id: number
          gold_diff_at_10?: number | null
          id?: string
          items_json?: Json | null
          kills?: number
          queue_type?: string
          role?: string | null
          spell_casts_json?: Json | null
          user_id: string
          vision_score?: number
          ward_events_json?: Json | null
          wards_killed?: number
          wards_placed?: number
          win: boolean
        }
        Update: {
          assists?: number
          captured_at?: string
          champion_id?: number
          champion_name?: string | null
          cs?: number
          cs_diff_at_10?: number | null
          cs_diff_at_20?: number | null
          damage_dealt?: number
          deaths?: number
          enemy_champion_id?: number | null
          enemy_champion_name?: string | null
          game_duration_seconds?: number
          game_id?: number
          gold_diff_at_10?: number | null
          id?: string
          items_json?: Json | null
          kills?: number
          queue_type?: string
          role?: string | null
          spell_casts_json?: Json | null
          user_id?: string
          vision_score?: number
          ward_events_json?: Json | null
          wards_killed?: number
          wards_placed?: number
          win?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          puuid: string | null
          rank: string | null
          region: string | null
          summoner_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          puuid?: string | null
          rank?: string | null
          region?: string | null
          summoner_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          puuid?: string | null
          rank?: string | null
          region?: string | null
          summoner_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      summoner_profiles: {
        Row: {
          created_at: string
          id: string
          last_synced: string | null
          puuid: string
          region: string
          riot_id: string
          summoner_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_synced?: string | null
          puuid: string
          region: string
          riot_id: string
          summoner_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_synced?: string | null
          puuid?: string
          region?: string
          riot_id?: string
          summoner_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_matchup_stats: { Args: { p_champion: string }; Returns: Json }
      get_champion_stats: { Args: { p_champion: string }; Returns: Json }
      get_loss_streak: { Args: { p_limit?: number }; Returns: number }
      get_matchup_stats: {
        Args: { p_champion: string; p_enemy: string }
        Returns: Json
      }
      get_overview_stats: { Args: { p_recent_limit?: number }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
