/*
 * src/app/(dashboard)/dashboard/page.tsx  →  URL: /dashboard
 *
 * Main dashboard — reads the user's profile and shows a personalised
 * welcome state. Will show projects list in Phase 4.
 *
 * This is a SERVER COMPONENT — reads the user session and profile
 * directly from the DB without a client-side fetch.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile with institution name (a JOIN via foreign key)
  // Supabase supports this with `institutions(name)` syntax in .select()
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, course_field, graduation_year, institutions(name)")
    .eq("id", user.id)
    .returns<{
      full_name: string | null;
      course_field: string | null;
      graduation_year: number | null;
      institutions: { name: string } | null;
    }[]>()
    .single();

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    "there";

  return (
    <div>
      {/* ── Welcome header ── */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-brand-text)" }}
        >
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500">
          {profile?.course_field && profile?.institutions
            ? `${profile.course_field} · ${(profile.institutions as { name: string }).name}`
            : "Ready to turn your projects into great content."}
        </p>
      </div>

      {/* ── Empty state / CTA (projects come in Phase 4) ── */}
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center bg-white">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          📁
        </div>
        <h2 className="text-base font-semibold text-gray-700 mb-2">
          No projects yet
        </h2>
        <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
          Add your first project and let the AI interview you about it. Takes about 5 minutes.
        </p>
        <Link
          href="/projects/new"
          className="inline-block px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          + Add your first project
        </Link>
        <p className="text-xs text-gray-400 mt-3">
          (Project creation coming in Phase 4)
        </p>
      </div>

      {/* ── Quick stats strip (will fill in Phase 4) ── */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { label: "Projects", value: "0" },
          { label: "Outputs generated", value: "0" },
          { label: "Portfolio views", value: "0" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-gray-200 text-center"
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-brand-primary)" }}
            >
              {value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
