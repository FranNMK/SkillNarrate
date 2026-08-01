"use client";

/*
 * src/components/features/SessionEnforcer.tsx
 *
 * Enforces "ephemeral" (browser-session-only) login.
 *
 * HOW IT WORKS:
 * Supabase stores auth tokens in cookies, which can persist across browser
 * restarts. When a user logs in WITHOUT "Remember me", the login page writes
 * "sn_ephemeral=1" into sessionStorage.
 *
 * sessionStorage is cleared when:
 *   - The browser tab is closed
 *   - The browser window is closed
 *   - The browser itself is closed
 * It is NOT cleared when navigating between pages in the same tab.
 *
 * On every app load, this component checks:
 *   1. Is the user currently signed in? (Supabase cookie exists)
 *   2. Is "sn_ephemeral=1" ABSENT from sessionStorage?
 *      (Means this is a fresh browser session — the key was cleared.)
 *   3. Is "sn_was_ephemeral=1" in localStorage?
 *      (We write this on ephemeral login so we know to enforce the check
 *       even after sessionStorage is wiped.)
 *
 * If all three are true → sign the user out automatically.
 *
 * WHY localStorage for sn_was_ephemeral?
 * We need to remember "this account logged in ephemerally" AFTER the
 * browser closes. sessionStorage is wiped on close (that's the point),
 * so we write a companion flag to localStorage. This flag is removed
 * on normal sign-out or when the user logs in with "Remember me".
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SessionEnforcer() {
  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      // Was this login marked ephemeral?
      const wasEphemeral = localStorage.getItem("sn_was_ephemeral") === "1";
      if (!wasEphemeral) return; // Normal persistent login — nothing to do.

      // Is the ephemeral key still alive in sessionStorage?
      const sessionAlive = sessionStorage.getItem("sn_ephemeral") === "1";
      if (sessionAlive) return; // Same browser session — user is still active.

      // sessionStorage key is gone → browser was closed and re-opened.
      // Sign the user out automatically.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.removeItem("sn_was_ephemeral");
        await supabase.auth.signOut();
        // Force a hard reload to clear Next.js RSC cache and redirect to login
        window.location.replace("/login");
      } else {
        // Already signed out — clean up the localStorage marker
        localStorage.removeItem("sn_was_ephemeral");
      }
    }

    checkSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invisible — renders nothing
  return null;
}
