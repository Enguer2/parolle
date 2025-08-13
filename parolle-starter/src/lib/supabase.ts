// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL!        // e.g. https://kxebryhkvevyyktedtoj.supabase.co
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY!   // anon public key

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, detectSessionInUrl: true }
})
