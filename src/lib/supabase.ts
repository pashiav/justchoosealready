import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types based on our schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          google_api_access: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          image?: string | null
          google_api_access?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          google_api_access?: boolean
          created_at?: string
        }
      }
      spins: {
        Row: {
          id: string
          user_id: string | null
          seed: string
          query: Record<string, unknown>
          options: Record<string, unknown>[]
          selected_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          seed: string
          query?: Record<string, unknown>
          options: Record<string, unknown>[]
          selected_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          seed?: string
          query?: Record<string, unknown>
          options?: Record<string, unknown>[]
          selected_id?: string
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          place_id: string
          snapshot: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          place_id: string
          snapshot: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          place_id?: string
          snapshot?: Record<string, unknown>
          created_at?: string
        }
      }
      places_cache: {
        Row: {
          key: string
          payload: Record<string, unknown>[]
          expires_at: string
          created_at: string
        }
        Insert: {
          key: string
          payload: Record<string, unknown>[]
          expires_at: string
          created_at?: string
        }
        Update: {
          key?: string
          payload?: Record<string, unknown>[]
          expires_at?: string
          created_at?: string
        }
      }
    }
  }
}
