/*
 * src/lib/actions/auth.ts
 *
 * Server Actions for authentication
 * ───────────────────────────────────
 * WHY SERVER ACTIONS?
 * In Next.js App Router, a "Server Action" is an async function marked with
 * "use server" that runs exclusively on the server. You can pass it directly
 * to a form's `action` prop, and Next.js handles the POST request for you —
 * no separate API route needed for form submissions.
 *
 * This is the modern, clean pattern for auth forms:
 *   <form action={loginAction}>  ← Next.js calls this on submit
 *     <input name="email" />
 *     <input name="password" />
 *     <button>Login</button>
 *   </form>
 *
 * Benefits:
 *  - The form still works even if JavaScript fails to load
 *  - No client-side fetch() needed for simple forms
 *  - TypeScript types flow all the way through
 *
 * HOW SUPABASE AUTH ERRORS WORK:
 * Every Supabase auth call returns { data, error }.
 * If error is non-null, something went wrong. We pass error messages back
 * to the page using redirect() with a query param (e.g. ?error=Invalid+email).
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── Helper: encode error message into a redirect URL ─────────
// Instead of throwing, we redirect to the same page with an error param.
// The page component reads this and shows the error message.
//
// WHY THE FALLBACK?
// Supabase occasionally returns an AuthError whose `.message` is undefined
// (e.g. when email signups are disabled, or the provider returns an empty
// error body). Passing undefined to encodeURIComponent produces the string
// "undefined"; passing the raw error object produces "{}". Both look broken.
// We normalise here so the user always sees a useful message.
function redirectWithError(path: string, message: string | undefined | null): never {
  const trimmed = typeof message === "string" ? message.trim() : "";
  // Reject empty strings and JSON-serialised objects like "{}" or "[]" that
  // Supabase occasionally surfaces when the server returns an empty error body.
  const isJunk = trimmed.length === 0 || /^\{.*\}$|^\[.*\]$/.test(trimmed);
  const msg = isJunk ? "An unexpected error occurred. Please try again." : trimmed;
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

// ────────────────────────────────────────────────────────────
// SIGN UP with email + password
// ────────────────────────────────────────────────────────────
// What happens after this runs:
//   1. Supabase creates a row in auth.users (unconfirmed)
//   2. Supabase sends a confirmation email (via our custom SMTP / Resend)
//   3. We redirect to a "check your email" page
//   4. The profile row is created by our DB trigger when the email is confirmed
// ────────────────────────────────────────────────────────────
export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  if (!email || !password || !fullName) {
    redirectWithError("/signup", "All fields are required.");
  }

  if (password.length < 8) {
    redirectWithError("/signup", "Password must be at least 8 characters.");
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // emailRedirectTo: where the user lands AFTER clicking the confirm link.
      // This must match the redirect URL you whitelist in Supabase Auth settings.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      // data stored in auth.users.raw_user_meta_data
      // Our trigger reads this to pre-fill profiles.full_name later
      data: { full_name: fullName },
    },
  });

  if (error) {
    // error.message can be undefined on certain Supabase error shapes.
    // Pull the best available human-readable message from the error object.
    const msg =
      error.message ||
      // @ts-expect-error — Supabase error objects sometimes have extra fields
      error.msg ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).error_description ||
      (typeof error.code === "string" ? `Sign-up failed (${error.code})` : null) ||
      "Sign-up failed. Please check your details and try again.";
    redirectWithError("/signup", msg);
  }

  // Supabase returns no error but user=null when the email already exists
  // (unconfirmed duplicate). Surface a helpful message instead of silently
  // redirecting to the confirm page.
  if (!signUpData?.user) {
    redirectWithError(
      "/signup",
      "An account with this email already exists. Please check your inbox for a confirmation link, or try signing in."
    );
  }

  // Success — tell the user to check their email
  redirect("/signup/confirm");
}

// ────────────────────────────────────────────────────────────
// SIGN IN with email + password
// ────────────────────────────────────────────────────────────
export async function signInAction(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Common errors: "Invalid login credentials", "Email not confirmed"
    redirectWithError("/login", error.message);
  }

  // Revalidate so the server re-checks the session on next render
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ────────────────────────────────────────────────────────────
// SIGN OUT
// ────────────────────────────────────────────────────────────
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Revalidate and redirect to landing page
  revalidatePath("/", "layout");
  redirect("/");
}

// ────────────────────────────────────────────────────────────
// GOOGLE OAUTH — initiate the redirect
// ────────────────────────────────────────────────────────────
// This doesn't process a form — it just kicks off the OAuth dance.
// Supabase returns a URL to redirect the user to (Google's login page).
// ────────────────────────────────────────────────────────────
export async function signInWithGoogleAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // After Google auth completes, Google redirects to this URL.
      // Supabase's middleware at /auth/callback handles the token exchange.
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        // "consent" forces Google to show the account picker every time.
        // Remove this in production if you want a smoother return-user experience.
        prompt: "consent",
        access_type: "offline",
      },
    },
  });

  if (error || !data.url) {
    redirectWithError("/login", "Could not initiate Google sign-in.");
  }

  // Redirect the user to Google's OAuth consent screen
  redirect(data.url);
}

// ────────────────────────────────────────────────────────────
// FORGOT PASSWORD — send reset email
// ────────────────────────────────────────────────────────────
export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    redirectWithError("/forgot-password", "Email is required.");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    // Supabase can return an empty-body error when its email provider is
    // misconfigured. Always show something useful.
    const msg =
      (error.message && error.message.trim().length > 0)
        ? error.message
        : "Could not send reset email. Please try again later.";
    redirectWithError("/forgot-password", msg);
  }

  // Always redirect to "sent" — even if the email doesn't exist in our DB.
  // This prevents email enumeration (don't tell attackers which emails exist).
  redirect("/forgot-password/sent");
}

// ────────────────────────────────────────────────────────────
// RESET PASSWORD — set new password after clicking email link
// ────────────────────────────────────────────────────────────
export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (password !== confirm) {
    redirectWithError("/auth/reset-password", "Passwords do not match.");
  }

  if (password.length < 8) {
    redirectWithError("/auth/reset-password", "Password must be at least 8 characters.");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectWithError("/auth/reset-password", error.message);
  }

  redirect("/login?message=Password+updated.+Please+sign+in.");
}
