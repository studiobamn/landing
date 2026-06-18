import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public, anon-key client used by Server Components for published reads.
// Returns `null` when env vars are absent so the app still boots/builds
// before Supabase is configured (queries fall back to empty results).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/**
 * Server-only privileged client (service role). Use sparingly, never in a
 * Client Component. Returns null if env is missing.
 */
export function createServerSupabase(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
