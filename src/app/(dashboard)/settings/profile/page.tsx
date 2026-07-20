/*
 * src/app/(dashboard)/settings/profile/page.tsx  →  URL: /settings/profile
 *
 * Profile settings page — student can edit their name, course, institution,
 * graduation year, avatar image URL, and preview their public info.
 *
 * SERVER COMPONENT that fetches profile + institution list, then passes
 * to a Client Component form for interactivity.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "My Profile — SkillNarrate" };

export default async function ProfileSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch current profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("full_name, course_field, graduation_year, institution_id, avatar_url, institutions(name)")
    .eq("id", user.id)
    .single();

  // Fetch institution list for the select
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: institutions } = await (supabase as any)
    .from("institutions")
    .select("id, name, nearest_town, county")
    .order("name", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">My Profile</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-brand-text)" }}>
          My Profile
        </h1>
        <p className="text-sm text-gray-500">
          Update your personal information. This appears on your public portfolio.
        </p>
      </div>

      {/* ── Banners ── */}
      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {decodeURIComponent(error)}
        </div>
      )}
      {saved === "true" && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          ✅ Profile updated successfully.
        </div>
      )}

      <ProfileForm
        profile={{
          full_name: profile?.full_name ?? "",
          course_field: profile?.course_field ?? "",
          graduation_year: profile?.graduation_year ?? null,
          institution_id: profile?.institution_id ?? null,
          avatar_url: profile?.avatar_url ?? "",
        }}
        institutions={institutions ?? []}
        email={user.email ?? ""}
      />
    </div>
  );
}
