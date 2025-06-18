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
      profiles: {
        Row: {
          id: string
          email: string
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
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
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
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
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
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          media_urls: string[]
          created_at: string
          tags: string[]
          category: string
          startup_details: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          media_urls?: string[]
          created_at?: string
          tags: string[]
          category: string
          startup_details?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          media_urls?: string[]
          created_at?: string
          tags?: string[]
          category?: string
          startup_details?: Json | null
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
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