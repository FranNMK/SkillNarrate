/*
 * src/lib/supabase/server.ts
 *
 * SERVER-SIDE Supabase client
 * ────────────────────────────
 * Use this inside Server Components, Route Handlers, and Server Actions.
 * It reads the session from cookies (managed by Next.js middleware) so that
 * the server always knows who the logged-in user is.
 *
 * Why a separate server client?
 * Browser and server have different ways of reading/writing cookies.
 * @supabase/ssr gives us two factory functions — one for each context —
 * so auth sessions stay in sync between server renders and client navigation.
 */

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// CookieMethodsServer["setAll"] gives us the correct type for the cookiesToSet
// parameter so TypeScript knows the shape of each cookie object.
type SetAllCookies = Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0];

export async function createClient() {
  // cookies() from next/headers gives us access to the request's cookie jar
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SetAllCookies) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can't set cookies. That's fine —
            // the middleware will refresh the session for us.
          }
        },
      },
    }
  );
}
