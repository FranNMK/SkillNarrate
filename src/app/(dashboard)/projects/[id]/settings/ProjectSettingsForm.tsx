"use client";
/*
 * src/app/(dashboard)/projects/[id]/settings/ProjectSettingsForm.tsx
 *
 * Client Component — form for editing project links/media on the settings page.
 * Same fields as ProjectLinksEditor but as a full page form (always visible,
 * not hidden behind a collapsible toggle).
 */

import { useState } from "react";
import { updateProjectLinksAction } from "@/lib/actions/profile";
import Spinner from "@/components/ui/Spinner";

interface ProjectSettingsFormProps {
  projectId: string;
  initial: {
    logo_url: string | null;
    demo_video_url: string | null;
    demo_link: string | null;
    github_link: string | null;
  };
}

export default function ProjectSettingsForm({ projectId, initial }: ProjectSettingsFormProps) {
  const [logoUrl,      setLogoUrl]      = useState(initial.logo_url ?? "");
  const [demoVideoUrl, setDemoVideoUrl] = useState(initial.demo_video_url ?? "");
  const [demoLink,     setDemoLink]     = useState(initial.demo_link ?? "");
  const [githubLink,   setGithubLink]   = useState(initial.github_link ?? "");
  const [pending,      setPending]      = useState(false);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent";
  const ringStyle = { "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-5">Project Details &amp; Links</h2>
      <p className="text-xs text-gray-400 mb-6 -mt-3">
        These appear on your public portfolio project card.
      </p>

      <form
        action={updateProjectLinksAction}
        onSubmit={() => setPending(true)}
        className="space-y-5"
      >
        {/* Hidden values */}
        <input type="hidden" name="project_id"     value={projectId} />
        <input type="hidden" name="logo_url"        value={logoUrl} />
        <input type="hidden" name="demo_video_url"  value={demoVideoUrl} />
        <input type="hidden" name="demo_link"       value={demoLink} />
        <input type="hidden" name="github_link"     value={githubLink} />

        {/* Project Logo URL */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Project Logo URL{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className={inputClass}
            style={ringStyle}
          />
          <p className="text-xs text-gray-400 mt-1">A square image (at least 64×64px) works best.</p>
        </div>

        {/* GitHub Repository */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            GitHub Repository{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/yourname/project"
            className={inputClass}
            style={ringStyle}
          />
        </div>

        {/* Live Demo Link */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Live Demo Link{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            placeholder="https://your-demo.vercel.app"
            className={inputClass}
            style={ringStyle}
          />
        </div>

        {/* Demo Video URL */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Demo Video URL{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={demoVideoUrl}
            onChange={(e) => setDemoVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://loom.com/share/..."
            className={inputClass}
            style={ringStyle}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending && <Spinner size={13} color="#fff" />}
          {pending ? "Saving…" : "Save project details"}
        </button>
      </form>
    </div>
  );
}
