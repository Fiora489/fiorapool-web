export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      summoner_profiles: {
        Row: {
          id: string
          user_id: string
          puuid: string
          riot_id: string
          region: string
          summoner_level: number | null
          last_synced: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['summoner_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['summoner_profiles']['Insert']>
      }
      app_progress: {
        Row: {
          id: string
          user_id: string
          xp: number
          level: number
          streak: number
          prestige_title: string | null
          consistency_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['app_progress']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['app_progress']['Insert']>
      }
      app_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          accent_champion: string | null
          colour_blind_mode: boolean
          ui_scale: number
          accessibility_prefs: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>
      }
      matches: {
        Row: {
          id: string
          match_id: string
          puuid: string
          region: string
          game_mode: string | null
          game_type: string | null
          timestamp: string
          raw_data: Json
          cached_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'cached_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      match_stats: {
        Row: {
          id: string
          match_id: string
          puuid: string
          champion_id: number | null
          champion_name: string | null
          kills: number
          deaths: number
          assists: number
          cs: number
          vision_score: number
          damage_dealt: number
          gold_earned: number
          win: boolean
          items: Json
          full_stats: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['match_stats']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['match_stats']['Insert']>
      }
    }
  }
}

// Convenience row types
export type SummonerProfile = Database['public']['Tables']['summoner_profiles']['Row']
export type AppProgress     = Database['public']['Tables']['app_progress']['Row']
export type AppSettings     = Database['public']['Tables']['app_settings']['Row']
export type Match           = Database['public']['Tables']['matches']['Row']
export type MatchStats      = Database['public']['Tables']['match_stats']['Row']
