/*
 * src/app/onboarding/OnboardingWizard.tsx
 *
 * Client Component — the interactive 3-step onboarding wizard.
 *
 * ARCHITECTURE (v2 — step-isolated design):
 * -----------------------------------------
 * The previous single-<form> design caused a recurring bug: any
 * keystroke that triggered a native form submit (Enter in a number
 * input, autocomplete selection, mobile keyboard "Done" button) would
 * fire the server action with whatever hidden-input values were in the
 * DOM at that moment — often empty, producing "Please enter your course"
 * errors and a jarring page refresh.
 *
 * The fix: there is NO shared <form> wrapping all steps.
 *
 *  - Steps 1 and 2 use plain <div>s with controlled inputs and
 *    type="button" Next buttons. No form, no submit event possible.
 *  - Step 3 has a small <form> whose action IS the server action. It
 *    contains only the step-3 inputs (displayed) plus hidden inputs for
 *    the values collected in steps 1 and 2. The submit button on step 3
 *    is the only element that can fire the action.
 *  - All Enter-key presses on visible inputs are blocked with onKeyDown.
 *
 * This makes accidental submission structurally impossible on steps 1/2,
 * and tightly controlled on step 3.
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
                ? "var(--color-brand-primary)"    // completed — solid teal
                : i + 1 === current
                ? "var(--color-brand-secondary)"  // active — amber
                : "#D1D5DB",                      // upcoming — grey
          }}
        />
      ))}
    </div>
  );
}

// ── Institution search/select ────────────────────────────────
function InstitutionSelect({
  institutions,
  value,
  onChange,
}: {
  institutions: Institution[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered =
    query.length < 2
      ? institutions
      : institutions.filter(
          (inst) =>
            inst.name.toLowerCase().includes(query.toLowerCase()) ||
            inst.nearest_town.toLowerCase().includes(query.toLowerCase()) ||
            inst.county.toLowerCase().includes(query.toLowerCase())
        );

  const selectedName = institutions.find((i) => String(i.id) === value)?.name;

  return (
    <div className="relative">
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
        // Prevent Enter from doing anything unexpected
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
        autoComplete="off"
      />

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No institutions found</p>
          ) : (
            filtered.slice(0, 80).map((inst) => (
              <button
                key={inst.id}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                onMouseDown={() => {
                  onChange(String(inst.id));
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

// ── Inline validation message ────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-red-600 mt-1.5">{msg}</p>;
}

// ── Main wizard ──────────────────────────────────────────────
function WizardInner({
  institutions,
  prefillName,
}: {
  institutions: Institution[];
  prefillName: string;
}) {
  const searchParams  = useSearchParams();
  const serverError   = searchParams.get("error");

  const [currentStep,     setCurrentStep]     = useState(1);
  const [pending,         setPending]         = useState(false);

  // Step 1
  const [fullName,        setFullName]        = useState(prefillName);
  const [nameError,       setNameError]       = useState("");

  // Step 2
  const [institutionId,   setInstitutionId]   = useState("");
  const [instError,       setInstError]       = useState("");

  // Step 3
  const [courseField,     setCourseField]     = useState("");
  const [courseError,     setCourseError]     = useState("");
  const [graduationYear,  setGraduationYear]  = useState("");

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

  // ── Step navigation ──────────────────────────────────────
  function goNext() {
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setNameError("Please enter your full name.");
        return;
      }
      setNameError("");
    }
    if (currentStep === 2) {
      if (!institutionId) {
        setInstError("Please select your institution from the list.");
        return;
      }
      setInstError("");
    }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  // ── Final submit handler ─────────────────────────────────
  // Only called from step 3's form onSubmit.
  function handleFinalSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!courseField.trim()) {
      e.preventDefault();
      setCourseError("Please enter your course or field of study.");
      document.getElementById("course_field_input")?.focus();
      return;
    }
    setCourseError("");
    setPending(true);
    // Let the form submit naturally to the server action
  }

  return (
    <div className="w-full max-w-md">
      {/* ── Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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

        {/* Server error banner (from any prior server-action redirect) */}
        {serverError && currentStep === 3 && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
         *  STEP 1 — Full name
         *  Plain <div>, NOT a <form>. No submit event possible.
         * ─────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1.5"
              htmlFor="full_name_input"
            >
              Full name
            </label>
            <input
              id="full_name_input"
              type="text"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setNameError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goNext(); } }}
              placeholder="e.g. Frank Mwangi"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
            />
            {nameError && <FieldError msg={nameError} />}
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
         *  STEP 2 — Institution
         *  Plain <div>. Dropdown uses onMouseDown so blur fires first.
         * ─────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Institution
            </label>
            <InstitutionSelect
              institutions={institutions}
              value={institutionId}
              onChange={(id) => { setInstitutionId(id); setInstError(""); }}
            />
            {instError && <FieldError msg={instError} />}
            <p className="text-xs text-gray-400 mt-2">
              Can&apos;t find yours? Type its name, town, or county.
            </p>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────
         *  STEP 3 — Course + graduation year
         *  This is the ONLY <form> in the wizard. It submits to the
         *  server action. Hidden inputs carry values from steps 1 & 2.
         *  All Enter keys are blocked on the visible inputs so the
         *  only way to submit is the explicit "Finish setup" button.
         * ─────────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <form
            ref={formRef}
            action={completeOnboardingAction}
            onSubmit={handleFinalSubmit}
            className="space-y-4"
          >
            {/* Carry step 1 + 2 values as hidden inputs */}
            <input type="hidden" name="full_name"       value={fullName} />
            <input type="hidden" name="institution_id"  value={institutionId} />
            <input type="hidden" name="course_field"    value={courseField} />
            <input type="hidden" name="graduation_year" value={graduationYear} />

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="course_field_input"
              >
                Course / field of study
              </label>
              <input
                id="course_field_input"
                type="text"
                autoFocus
                value={courseField}
                onChange={(e) => { setCourseField(e.target.value); setCourseError(""); }}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                placeholder="e.g. Electrical Engineering, ICT, Fashion Design"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
              {courseError && <FieldError msg={courseError} />}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1.5"
                htmlFor="graduation_year_input"
              >
                Expected graduation year{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="graduation_year_input"
                type="number"
                min={2024}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                placeholder={String(new Date().getFullYear() + 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
              />
            </div>

            {/* Navigation inside the form */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={goBack}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
                style={{ backgroundColor: "var(--color-brand-primary)" }}
              >
                {pending ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Finish setup →"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── Navigation buttons for steps 1 and 2 (outside any form) ── */}
        {currentStep < TOTAL_STEPS && (
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Skip link */}
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
