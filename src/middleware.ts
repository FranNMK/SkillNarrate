/*
 * src/middleware.ts
 *
 * Next.js Middleware — runs on the Edge before every request
 * ──────────────────────────────────────────────────────────
 * Two jobs:
 *
 * 1. SESSION REFRESH (always runs)
 *    Supabase access_tokens expire after ~1 hour. The middleware
 *    intercepts every request, checks if the token needs refreshing,
 *    and silently swaps in a new one via the refresh_token cookie.
 *    Without this, the server would think the user is logged out
 *    even though they have a valid refresh_token.
 *
 * 2. ROUTE PROTECTION (redirects)
 *    - If a logged-out user tries to visit /dashboard or /onboarding
 *      → redirect them to /login
 *    - If a logged-in user visits /login or /signup
 *      → redirect them to /dashboard (no reason to show auth pages)
 *
 * WHY NOT PROTECT ROUTES IN THE PAGE COMPONENT?
 * You could call supabase.auth.getUser() at the top of every page, but:
 *   a) It's repetitive — you'd do it in every protected page
 *   b) The page HTML would briefly render before the redirect fires
 * Middleware runs BEFORE the page, so the redirect is instant and clean.
 */

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type SetAllCookies = Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0];

// Routes that require a logged-in user
// NOTE: /portfolio/* is intentionally NOT here — those are public pages.
// /settings/* IS protected — that's where portfolio management lives.
const PROTECTED_ROUTES = ["/dashboard", "/onboarding", "/projects", "/settings"];

// Routes that logged-in users shouldn't see (auth pages)
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SetAllCookies) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: This refreshes the session. Do NOT remove.
  const { data: { user } } = await supabase.auth.getUser();

  // ── Route protection ─────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Logged-out user visiting a protected route → send to login
  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    // Preserve where they were trying to go so we can redirect after login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in user visiting login/signup → send to dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
