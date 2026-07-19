/*
 * src/lib/actions/portfolio.ts
 *
 * Server Actions for portfolio link management
 * ──────────────────────────────────────────────
 *
 * createOrActivatePortfolioAction
 *   — Creates a portfolio_links row (with a generated slug) if the user
 *     doesn't have one yet, OR re-activates an existing inactive one.
 *     Called when the student clicks "Activate My Portfolio".
 *
 * togglePortfolioActiveAction
 *   — Flips is_active TRUE ↔ FALSE.
 *     Deactivating hides the public page (URL returns 404).
 *     The slug is preserved so reactivating restores the same URL.
 *
 * regenerateSlugAction
 *   — Generates a new random slug for the student's portfolio.
 *     Their old URL stops working; the new URL is shown.
 *     Use case: student wants a fresh URL (e.g. after a name change).
 *
 * ── HOW SLUGS ARE GENERATED ──────────────────────────────────
 * Format: "{first-name}-{8 hex chars}"
 * Example: "jane-a3f8e201"
 *
 * We use crypto.randomUUID().replace(/-/g, '').slice(0, 8) as the
 * random suffix (8 hex characters = 4 billion combinations — plenty
 * for a small app, and still readable in a URL).
 *
 * WHY NOT JUST USE THE USER'S NAME?
 * Names aren't unique. Two students named "John Kamau" would collide.
 * The random suffix guarantees uniqueness without needing a DB uniqueness
 * check loop (though we do try/catch for the tiny chance of collision).
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── Slug generator ────────────────────────────────────────────
// Takes the user's first name and appends 8 random hex characters.
// Result: "jane-a3f8e201" — readable yet unique.
function generateSlug(fullName: string | null): string {
  const firstName = (fullName ?? "student")
    .split(" ")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")   // strip anything that isn't a letter or digit
    .slice(0, 20)                  // cap at 20 chars so the slug doesn't get too long
    || "student";                  // fallback if name was entirely special characters

  // crypto is available in Node.js 19+ and on the edge runtime.
  // randomUUID() gives us a v4 UUID; we strip dashes and take 8 chars.
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);

  return `${firstName}-${suffix}`;
}

// ────────────────────────────────────────────────────────────
// CREATE OR ACTIVATE PORTFOLIO
// ────────────────────────────────────────────────────────────
export async function createOrActivatePortfolioAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Check if the user already has a portfolio_links row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("portfolio_links")
    .select("id, is_active")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Row exists — just make sure it's active
    if (!existing.is_active) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("portfolio_links")
        .update({ is_active: true })
        .eq("id", existing.id);
    }
  } else {
    // No row yet — create one with a fresh slug
    // Get the user's name for a nicer slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const slug = generateSlug(profile?.full_name ?? null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from("portfolio_links")
      .insert({
        user_id: user.id,
        slug,
        is_active: true,
      });

    if (insertError) {
      redirect(
        `/settings/portfolio?error=${encodeURIComponent(insertError.message)}`
      );
    }
  }

  revalidatePath("/settings/portfolio");
  redirect("/settings/portfolio?activated=true");
}

// ────────────────────────────────────────────────────────────
// TOGGLE PORTFOLIO ACTIVE / INACTIVE
// ────────────────────────────────────────────────────────────
export async function togglePortfolioActiveAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const currentActive = formData.get("current_active") === "true";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("portfolio_links")
    .update({ is_active: !currentActive })
    .eq("user_id", user.id);

  if (error) {
    redirect(`/settings/portfolio?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings/portfolio");
  redirect("/settings/portfolio");
}

// ────────────────────────────────────────────────────────────
// REGENERATE SLUG
// ────────────────────────────────────────────────────────────
// Gives the user a fresh URL. The old URL stops working immediately.
// ────────────────────────────────────────────────────────────
export async function regenerateSlugAction() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // Get the user's name for the new slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const newSlug = generateSlug(profile?.full_name ?? null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("portfolio_links")
    .update({ slug: newSlug })
    .eq("user_id", user.id);

  if (error) {
    redirect(`/settings/portfolio?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings/portfolio");
  redirect("/settings/portfolio?regenerated=true");
}
