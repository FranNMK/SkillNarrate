/*
 * src/middleware.ts
 *
 * Next.js Middleware — runs on the Edge (before every request is handled)
 * ─────────────────────────────────────────────────────────────────────────
 * WHY DO WE NEED THIS FOR AUTH?
 *
 * Supabase sessions use two tokens stored in cookies:
 *  - access_token  (expires after ~1 hour)
 *  - refresh_token (used to get a new access_token)
 *
 * When the access_token expires, it needs to be refreshed BEFORE the
 * Server Component tries to use it — otherwise the server will think
 * the user is logged out even though they have a valid refresh_token.
 *
 * This middleware intercepts every request, checks if the session needs
 * refreshing, and sets the updated cookies — all before the page renders.
 *
 * The `matcher` below excludes static files and Next.js internals
 * so we don't run auth logic on images, CSS, etc.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // First update the outgoing request cookies (for downstream middleware)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Then update the response cookies (so the browser gets them)
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This call refreshes the session if expired — it's the key reason
  // middleware exists. Don't remove it even if you don't use the user object.
  await supabase.auth.getUser();

  return supabaseResponse;
}

// Only run this middleware on app routes (skip Next.js internals and static files)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
