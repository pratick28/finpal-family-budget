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
      family_members: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: 'owner' | 'member'
          family_id: string
          status: 'pending' | 'active'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: 'owner' | 'member'
          family_id: string
          status: 'pending' | 'active'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: 'owner' | 'member'
          family_id?: string
          status?: 'pending' | 'active'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 