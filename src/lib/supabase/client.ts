import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isLocalMode = !url || !key
export const configurationError = null

export const supabase = url && key
  ? createClient(url, key, { db: { schema: 'api' } })
  : null
