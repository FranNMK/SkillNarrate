"use client";
/*
 * src/app/(dashboard)/projects/[id]/ProjectSidebarNav.tsx
 *
 * Client Component — sidebar navigation for a single project.
 *
 * On desktop (md+): vertical pill-list on the left.
 * On mobile (<md):  horizontal scrollable tab strip pinned above content.
 *
 * Uses usePathname() to highlight the currently active section.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProjectSidebarNavProps {
  projectId: string;
  interviewCompleted: boolean;
}

export default function ProjectSidebarNav({
  projectId,
  interviewCompleted,
}: ProjectSidebarNavProps) {
  const pathname = usePathname();

  const links = [
    {
      href: `/projects/${projectId}/interview`,
      label: "Interview",
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
        </svg>
      ),
      badge: interviewCompleted ? "Done" : null,
      badgeColor: interviewCompleted ? { bg: "#f0fdf4", text: "#16a34a" } : null,
    },
    {
      href: `/projects/${projectId}/generate`,
      label: "Generate",
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
        </svg>
      ),
      badge: null,
      badgeColor: null,
    },
    {
      href: `/projects/${projectId}/settings`,
      label: "Settings",
      icon: (
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
        </svg>
      ),
      badge: null,
      badgeColor: null,
    },
  ];

  return (
    <>
      {/* ── Mobile: horizontal tab strip ── */}
      <div className="md:hidden w-full">
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
          {links.map(({ href, label, icon, badge, badgeColor }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center"
                style={
                  isActive
                    ? { backgroundColor: "var(--color-brand-primary)", color: "#fff" }
                    : { color: "#6b7280" }
                }
              >
                {icon}
                {label}
                {badge && badgeColor && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-0.5"
                    style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Desktop: vertical sidebar ── */}
      <aside className="hidden md:flex flex-col w-48 shrink-0 sticky top-6">
        <div className="bg-white rounded-xl border border-gray-200 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1">
            This Project
          </p>
          <nav className="flex flex-col gap-0.5">
            {links.map(({ href, label, icon, badge, badgeColor }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { backgroundColor: "var(--color-brand-primary)", color: "#fff" }
                      : { color: "#374151" }
                  }
                >
                  {icon}
                  <span className="flex-1">{label}</span>
                  {badge && badgeColor && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={
                        isActive
                          ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                          : { backgroundColor: badgeColor.bg, color: badgeColor.text }
                      }
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
