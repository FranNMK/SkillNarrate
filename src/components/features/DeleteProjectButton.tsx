"use client";

/*
 * src/components/features/DeleteProjectButton.tsx
 *
 * Client component — renders a trash-icon button that shows a native
 * confirm() dialog before calling deleteProjectAction.
 */

import { useState, useTransition } from "react";
import { deleteProjectAction } from "@/lib/actions/projects";

interface Props {
  projectId: string;
  projectTitle: string;
}

export default function DeleteProjectButton({ projectId, projectTitle }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const confirmed = window.confirm(
      `Delete "${projectTitle}"?\n\nThis will permanently remove the project and all its generated outputs. This action cannot be undone.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result.error) {
        setError(result.error);
      }
      // On success, revalidatePath in the action refreshes the dashboard automatically.
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        title="Delete project"
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? (
          /* Tiny spinner while deleting */
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-spin"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : (
          /* Trash icon */
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Inline error (rare — shows below the button row) */}
      {error && (
        <p className="absolute top-full right-0 mt-1 text-xs text-red-500 bg-white border border-red-200 rounded px-2 py-1 whitespace-nowrap shadow-sm z-10">
          {error}
        </p>
      )}
    </div>
  );
}
