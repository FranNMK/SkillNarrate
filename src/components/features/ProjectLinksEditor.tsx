"use client";
/*
 * src/components/features/ProjectLinksEditor.tsx
 *
 * Collapsible card on the generate page that lets a student add optional
 * project metadata: logo URL, demo video URL, demo link, GitHub link.
 * These appear on the public portfolio project card.
 */

import { useState } from "react";
import { updateProjectLinksAction } from "@/lib/actions/profile";
import Spinner from "@/components/ui/Spinner";

interface ProjectLinksEditorProps {
  projectId: string;
  initial: {
    logo_url: string | null;
    demo_video_url: string | null;
    demo_link: string | null;
    github_link: string | null;
  };
}

export default function ProjectLinksEditor({ projectId, initial }: ProjectLinksEditorProps) {
  const [open,         setOpen]         = useState(false);
  const [logoUrl,      setLogoUrl]      = useState(initial.logo_url ?? "");
  const [demoVideoUrl, setDemoVideoUrl] = useState(initial.demo_video_url ?? "");
  const [demoLink,     setDemoLink]     = useState(initial.demo_link ?? "");
  const [githubLink,   setGithubLink]   = useState(initial.github_link ?? "");
  const [pending,      setPending]      = useState(false);

  const hasAny = !!(initial.logo_url || initial.demo_link || initial.demo_video_url || initial.github_link);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">Project Details & Links</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Add logo, demo video, live demo, and GitHub links — shown on your public portfolio.
            {hasAny && <span className="ml-1 text-green-600 font-medium">✓ Saved</span>}
          </p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className={`text-gray-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-6">
          <form
            action={updateProjectLinksAction}
            onSubmit={() => setPending(true)}
            className="space-y-4"
          >
            <input type="hidden" name="project_id" value={projectId} />
            <input type="hidden" name="logo_url"       value={logoUrl} />
            <input type="hidden" name="demo_video_url" value={demoVideoUrl} />
            <input type="hidden" name="demo_link"      value={demoLink} />
            <input type="hidden" name="github_link"    value={githubLink} />

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Project Logo URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
              <p className="text-xs text-gray-400 mt-1">A square image (at least 64×64px) works best.</p>
            </div>

            {/* GitHub link */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                GitHub Repository <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/yourname/project"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
            </div>

            {/* Live demo link */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Live Demo Link <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                placeholder="https://your-demo.vercel.app"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
            </div>

            {/* Demo video URL */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Demo Video URL <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              {pending && <Spinner size={13} color="#fff" />}
              {pending ? "Saving…" : "Save project details"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
