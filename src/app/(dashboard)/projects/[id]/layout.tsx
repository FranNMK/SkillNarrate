/*
 * src/app/(dashboard)/projects/[id]/layout.tsx
 *
 * Shared sidebar layout for all project sub-pages:
 *   /projects/[id]/interview
 *   /projects/[id]/generate
 *   /projects/[id]/settings
 *
 * SERVER COMPONENT — fetches the project title for the sidebar header.
 *
 * Layout (desktop):
 *   ┌──────────────┬────────────────────────────────────┐
 *   │   Sidebar    │          Main content              │
 *   │  (w-52)      │                                    │
 *   │  · Interview │                                    │
 *   │  · Generate  │                                    │
 *   │  · Settings  │                                    │
 *   └──────────────┴────────────────────────────────────┘
 *
 * Layout (mobile < md):
 *   Sidebar collapses into a horizontal tab strip pinned above the content.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectSidebarNav from "./ProjectSidebarNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch just enough to show the project title in the sidebar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from("projects")
    .select("title, interview_completed")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) redirect("/dashboard");

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-800 transition-colors">
          My Projects
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">
          {project.title}
        </span>
      </nav>

      {/* ── Two-column layout: sidebar + content ── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* ── Sidebar / tab nav (client component handles active highlighting) ── */}
        <ProjectSidebarNav
          projectId={id}
          interviewCompleted={project.interview_completed ?? false}
        />

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
