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
      posts: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          media_urls: string[] | null
          created_at: string
          tags: string[] | null
          category: string | null
          startup_details: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          media_urls?: string[] | null
          created_at?: string
          tags?: string[] | null
          category?: string | null
          startup_details?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          media_urls?: string[] | null
          created_at?: string
          tags?: string[] | null
          category?: string | null
          startup_details?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          username: string
          user_type: 'entrepreneur' | 'investor'
          avatar_url: string | null
          bio: string | null
          location: string | null
          industry: string | null
          founded_year: number | null
          team_size: number | null
          investment_range: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          username: string
          user_type: 'entrepreneur' | 'investor'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          industry?: string | null
          founded_year?: number | null
          team_size?: number | null
          investment_range?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          username?: string
          user_type?: 'entrepreneur' | 'investor'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          industry?: string | null
          founded_year?: number | null
          team_size?: number | null
          investment_range?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}