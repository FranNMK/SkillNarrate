"use client";
/*
 * src/components/features/SignOutButton.tsx
 *
 * Sign-out button that shows a professional centred modal confirmation
 * dialog before signing the user out.
 */

import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import Spinner from "@/components/ui/Spinner";

export default function SignOutButton() {
  const [showModal, setShowModal] = useState(false);
  const [pending, setPending]     = useState(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
      >
        Sign out
      </button>

      {/* Modal overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => { if (!pending) setShowModal(false); }}
        >
          {/* Dialog card */}
          <div
            className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
              style={{ backgroundColor: "#fef2f2" }}
            >
              👋
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Sign out?
            </h2>
            <p className="text-sm text-gray-500 mb-7">
              You&apos;ll be returned to the login page. Any unsaved progress
              in an open interview will be lost.
            </p>

            <div className="flex gap-3">
              {/* Cancel */}
              <button
                onClick={() => setShowModal(false)}
                disabled={pending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Confirm sign-out */}
              <form
                className="flex-1"
                action={async () => {
                  setPending(true);
                  await signOutAction();
                }}
              >
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#ef4444" }}
                >
                  {pending && <Spinner size={13} color="#fff" />}
                  {pending ? "Signing out…" : "Yes, sign out"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
