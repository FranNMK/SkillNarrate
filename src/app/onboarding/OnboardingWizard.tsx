/*
 * src/app/onboarding/OnboardingWizard.tsx
 *
 * Client Component — the interactive 3-step onboarding wizard.
 *
 * WHY A SEPARATE FILE (not inline in page.tsx)?
 * page.tsx is a Server Component. You can't mix "use client" and
 * server-only code (like direct DB calls) in the same file.
 * The pattern is: Server Component page → passes data → Client Component UI.
 * This file handles all the step navigation, form state, and submission.
 *
 * ── HOW THE STEPS WORK ───────────────────────────────────────
 * We use a single <form> that spans all 3 steps. All inputs are
 * always present in the DOM (so the form data is complete when submitted),
 * but only the current step's inputs are VISIBLE (via conditional rendering).
 *
 * This means:
 *  - User can go back to step 1 without losing what they typed in step 2
 *  - The final submit sends all 3 steps' data in one FormData object
 *  - We don't need to manage any state outside of currentStep + form values
 *
 * ── THE SUBMIT ───────────────────────────────────────────────
 * On the last step, form.action = completeOnboardingAction (Server Action).
 * The Server Action validates, saves to DB, sets flag, sends welcome email,
 * and redirects to /dashboard. Done.
 */

"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import type { Institution } from "@/types/database";

// ── Step progress indicator ──────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-300"
          style={{
            width: i + 1 === current ? "2rem" : "0.5rem",
            height: "0.5rem",
            borderRadius: "9999px",
            backgroundColor:
              i + 1 < current
                ? "var(--color-brand-primary)"   // completed — solid teal
                : i + 1 === current
                ? "var(--color-brand-secondary)" // active — amber
                : "#D1D5DB",                     // upcoming — grey
          }}
        />
      ))}
    </div>
  );
}

// ── Institution search/select ────────────────────────────────
// A filtered dropdown — user types to search, selects from list.
function InstitutionSelect({
  institutions,
  value,
  onChange,
}: {
  institutions: Institution[];
  value: string;
  onChange: (id: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Filter institutions by name, town, or county
  const filtered = query.length < 2
    ? institutions
    : institutions.filter(
        (inst) =>
          inst.name.toLowerCase().includes(query.toLowerCase()) ||
          inst.nearest_town.toLowerCase().includes(query.toLowerCase()) ||
          inst.county.toLowerCase().includes(query.toLowerCase())
      );

  // Find the currently selected institution name for display
  const selectedName = institutions.find((i) => String(i.id) === value)?.name;

  return (
    <div className="relative">
      {/* Hidden input that actually holds the value for form submission */}
      <input type="hidden" name="institution_id" value={value} />

      {/* Search box */}
      <input
        type="text"
        placeholder={selectedName || "Search by institution name, town, or county…"}
        value={selectedName && !open ? selectedName : query}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
        autoComplete="off"
      />

      {/* Dropdown list */}
      {open && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No institutions found</p>
          ) : (
            filtered.slice(0, 80).map((inst) => (
              <button
                key={inst.id}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                onMouseDown={() => {
                  onChange(String(inst.id), inst.name);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="font-medium text-gray-800">{inst.name}</span>
                <span className="text-gray-400 text-xs ml-2">
                  {inst.nearest_town}, {inst.county}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main wizard ─────────────────────────────────────────────
function WizardInner({
  institutions,
  prefillName,
}: {
  institutions: Institution[];
  prefillName: string;
}) {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const stepParam = searchParams.get("step");

  const [currentStep, setCurrentStep] = useState(
    stepParam ? parseInt(stepParam, 10) : 1
  );
  const [pending, setPending] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const TOTAL_STEPS = 3;

  const stepTitles = [
    "What's your name?",
    "Where do you study?",
    "What are you studying?",
  ];

  const stepSubtitles = [
    "This is how you'll appear on your portfolio.",
    "Select your TVET institution from the list.",
    "Tell us your course so we can tailor the AI interview questions.",
  ];

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className="w-full max-w-md">
      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Progress dots */}
        <StepIndicator current={currentStep} total={TOTAL_STEPS} />

        {/* Step header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Step {currentStep} of {TOTAL_STEPS}
          </p>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--color-brand-text)" }}
          >
            {stepTitles[currentStep - 1]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stepSubtitles[currentStep - 1]}
          </p>
        </div>

        {/* Error banner (from redirect query param) */}
        {errorParam && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorParam}
          </div>
        )}

        {/*
         * SINGLE FORM — all inputs always mounted.
         * Only current step's inputs are visible.
         * This means FormData is always complete on submit.
         */}
        <form
          ref={formRef}
          action={completeOnboardingAction}
          onSubmit={() => setPending(true)}
        >
          {/* ── STEP 1: Full name ─────────────────────────── */}
          <div className={currentStep === 1 ? "block" : "hidden"}>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="full_name"
            >
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              defaultValue={prefillName}
              placeholder="e.g. Frank Mwangi"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {/* ── STEP 2: Institution ────────────────────────── */}
          <div className={currentStep === 2 ? "block" : "hidden"}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <InstitutionSelect
              institutions={institutions}
              value={institutionId}
              onChange={(id) => setInstitutionId(id)}
            />
            <p className="text-xs text-gray-400 mt-2">
              Can&apos;t find your institution? Type its name or nearest town.
            </p>
          </div>

          {/* ── STEP 3: Course + graduation year ─────────── */}
          <div className={currentStep === 3 ? "block space-y-4" : "hidden"}>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="course_field"
              >
                Course / field of study
              </label>
              <input
                id="course_field"
                name="course_field"
                type="text"
                placeholder="e.g. Electrical Engineering, ICT, Fashion Design"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="graduation_year"
              >
                Expected graduation year{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="graduation_year"
                name="graduation_year"
                type="number"
                min={2024}
                max={2035}
                placeholder={String(new Date().getFullYear() + 1)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
            </div>
          </div>

          {/* ── Navigation buttons ─────────────────────────── */}
          <div className="flex items-center justify-between mt-8">
            {/* Back button — only shown on steps 2 and 3 */}
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}

            {/* Next / Finish button */}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={pending}
                className="px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {pending ? "Saving…" : "Finish setup →"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Skip link — lets users bypass onboarding (sets flag too) */}
      <p className="text-center text-xs text-gray-400 mt-4">
        <a
          href="/dashboard"
          className="hover:underline"
          style={{ color: "var(--color-brand-primary)" }}
        >
          Skip for now
        </a>
        {" "}— you can fill this in from your profile settings later.
      </p>
    </div>
  );
}

// Export: wrap in Suspense for useSearchParams
export function OnboardingWizard(props: {
  institutions: Institution[];
  prefillName: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      }
    >
      <WizardInner {...props} />
    </Suspense>
  );
}
