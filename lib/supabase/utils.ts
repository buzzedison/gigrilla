export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          timezone: string
          preferred_currency: string
          user_role: string
          is_verified: boolean
          is_active: boolean
          subscription_tier: string
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          preferred_currency?: string
          user_role?: string
          is_verified?: boolean
          is_active?: boolean
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          timezone?: string
          preferred_currency?: string
          user_role?: string
          is_verified?: boolean
          is_active?: boolean
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          genres: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          genres?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          genres?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
