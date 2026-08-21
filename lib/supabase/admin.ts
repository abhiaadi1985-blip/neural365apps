import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service role client for server-side admin operations that bypass RLS.
 * Only use in secure server contexts (Server Components, Route Handlers).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    return null
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
