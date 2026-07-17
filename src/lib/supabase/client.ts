/*
 * src/lib/supabase/client.ts
 *
 * BROWSER-SIDE Supabase client
 * ─────────────────────────────
 * Use this client inside Client Components (files that start with "use client").
 * It uses the anon key and respects Row Level Security (RLS) for the logged-in user.
 *
 * "Row Level Security" — What is it?
 * Supabase lets you write SQL policies that say things like:
 *   "A user can only SELECT rows from the 'projects' table where user_id = their own id"
 * This means even if someone hacks the frontend, they can't read other users' data.
 * We'll set up RLS policies in Phase 1 when we create the database schema.
 *
 * Why @supabase/ssr instead of @supabase/supabase-js directly?
 * The @supabase/ssr package handles cookie-based auth sessions properly
 * in Next.js, where requests can come from the browser, server, or edge.
 * Using the plain supabase-js client in Next.js can cause auth token mismatches.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  // These two environment variables are prefixed with NEXT_PUBLIC_ which means
  // they are intentionally exposed to the browser (they are safe to expose).
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
