"use client";
/*
 * src/app/(dashboard)/settings/profile/ProfileForm.tsx
 *
 * Client Component — interactive profile editing form.
 * Uses controlled inputs so values persist across re-renders.
 */

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import type { Institution } from "@/types/database";
import Spinner from "@/components/ui/Spinner";

interface ProfileFormProps {
  profile: {
    full_name: string;
    course_field: string;
    graduation_year: number | null;
    institution_id: number | null;
    avatar_url: string;
  };
  institutions: Institution[];
  email: string;
}

// ── Institution search/select (same pattern as onboarding) ───
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
  const [open, setOpen]   = useState(false);

  const filtered = query.length < 2
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
      <input type="hidden" name="institution_id" value={value} />
      <input
        type="text"
        placeholder={selectedName || "Search by institution name, town, or county…"}
        value={selectedName && !open ? selectedName : query}
        onFocus={() => { setOpen(true); setQuery(""); }}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
        style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
        autoComplete="off"
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">No institutions found</p>
          ) : (
            filtered.slice(0, 80).map((inst) => (
              <button
                key={inst.id}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                onMouseDown={() => { onChange(String(inst.id)); setOpen(false); setQuery(""); }}
              >
                <span className="font-medium text-gray-800">{inst.name}</span>
                <span className="text-gray-400 text-xs ml-2">{inst.nearest_town}, {inst.county}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────
export default function ProfileForm({ profile, institutions, email }: ProfileFormProps) {
  const [fullName,        setFullName]        = useState(profile.full_name);
  const [courseField,     setCourseField]     = useState(profile.course_field);
  const [graduationYear,  setGraduationYear]  = useState(String(profile.graduation_year ?? ""));
  const [institutionId,   setInstitutionId]   = useState(String(profile.institution_id ?? ""));
  const [avatarUrl,       setAvatarUrl]       = useState(profile.avatar_url);
  const [pending,         setPending]         = useState(false);

  const initial = fullName.charAt(0).toUpperCase() || "?";

  return (
    <form
      action={updateProfileAction}
      onSubmit={() => setPending(true)}
      className="space-y-6"
    >
      {/* Hidden controlled values */}
      <input type="hidden" name="full_name"       value={fullName} />
      <input type="hidden" name="course_field"    value={courseField} />
      <input type="hidden" name="graduation_year" value={graduationYear} />
      <input type="hidden" name="avatar_url"      value={avatarUrl} />

      {/* ── Avatar preview + URL input ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          {/* Preview */}
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt="Profile photo"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-black shrink-0"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              {initial}
            </div>
          )}

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Photo URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Paste a public image URL. Your photo appears on your portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* ── Basic info ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Personal Information</h2>

        {/* Email (read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">
            Email cannot be changed here.
          </p>
        </div>

        {/* Full name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="pf_full_name">
            Full name
          </label>
          <input
            id="pf_full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Frank Mwangi"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>

        {/* Course / field of study */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="pf_course">
            Course / field of study
          </label>
          <input
            id="pf_course"
            type="text"
            value={courseField}
            onChange={(e) => setCourseField(e.target.value)}
            placeholder="e.g. Electrical Engineering, ICT, Fashion Design"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>

        {/* Institution */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Institution
          </label>
          <InstitutionSelect
            institutions={institutions}
            value={institutionId}
            onChange={setInstitutionId}
          />
        </div>

        {/* Graduation year */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="pf_grad_year">
            Expected graduation year{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="pf_grad_year"
            type="number"
            min={2020}
            max={2035}
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            placeholder={String(new Date().getFullYear() + 1)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: "var(--color-brand-primary)" }}
        >
          {pending && <Spinner size={14} color="#fff" />}
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
