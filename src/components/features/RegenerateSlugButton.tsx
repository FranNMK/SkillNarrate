"use client";
/*
 * src/components/features/RegenerateSlugButton.tsx
 *
 * WHY THIS EXISTS:
 * The portfolio settings page is a Server Component, but the "Regenerate URL"
 * button needs a browser confirm() dialog before submitting. onClick handlers
 * cannot live in Server Components — Next.js throws:
 *   "Event handlers cannot be passed to Client Component props"
 *
 * The fix is a tiny "use client" wrapper that handles the confirmation,
 * then submits the form to the regenerateSlugAction Server Action.
 * Everything else on the settings page stays as a Server Component.
 */

import { useRef } from "react";
import { regenerateSlugAction } from "@/lib/actions/portfolio";

export function RegenerateSlugButton() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleClick = () => {
    if (
      confirm(
        "This will change your portfolio URL. Your old link will stop working. Continue?"
      )
    ) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <form ref={formRef} action={regenerateSlugAction}>
      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        🔄 Regenerate URL
      </button>
    </form>
  );
}
