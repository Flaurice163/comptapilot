import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      companies: { Row: Record<string, unknown> }
      accounts: { Row: Record<string, unknown> }
      journal_entries: { Row: Record<string, unknown> }
      journal_entry_lines: { Row: Record<string, unknown> }
    }
  }
}
