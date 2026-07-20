"use client";
/*
 * src/components/features/SignOutButton.tsx
 *
 * Renders a "Sign out" button that:
 *  1. Shows a confirmation dialog when clicked
 *  2. Shows a spinner + "Signing out…" while the server action runs
 *
 * Used inside the dashboard layout (which is a Server Component, so we
 * extract just this interactive bit into a small Client Component).
 */

import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import Spinner from "@/components/ui/Spinner";

export default function SignOutButton() {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending]       = useState(false);

  if (pending) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-500 px-2 py-1">
        <Spinner size={12} />
        Signing out…
      </span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 sn-slide-down">
        <span className="text-xs text-gray-600 mr-1">Sure?</span>
        <form
          action={async () => {
            setPending(true);
            await signOutAction();
          }}
        >
          <button
            type="submit"
            className="text-xs font-semibold px-2.5 py-1 rounded-md text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#ef4444" }}
          >
            Yes, sign out
          </button>
        </form>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
    >
      Sign out
    </button>
  );
}
