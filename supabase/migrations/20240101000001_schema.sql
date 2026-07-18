-- ============================================================
-- SkillNarrate — Core Schema
-- Migration: 20240101000001_schema.sql
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Or via CLI: supabase db push
--
-- READING GUIDE:
-- Each section has a comment explaining WHY we design it this way,
-- not just what the SQL does. Read top to bottom first time.
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- STEP 1: Custom ENUM type for output categories
-- ──────────────────────────────────────────────────────────────
-- WHY AN ENUM?
-- We could store output_type as a plain text column, but enums are
-- better for a fixed set of known values because:
--   1. The database rejects any value not in the list (data integrity)
--   2. TypeScript types can be generated directly from the enum
--   3. It's self-documenting — anyone reading the schema knows exactly
--      what values are valid
--
-- "output_type" represents the 4 formats Gemini can generate for you.
-- ──────────────────────────────────────────────────────────────
CREATE TYPE output_type AS ENUM (
  'case_study',
  'linkedin_post',
  'pitch_script',
  'interview_answer'
);


-- ──────────────────────────────────────────────────────────────
-- STEP 2: institutions table
-- ──────────────────────────────────────────────────────────────
-- WHY INSTITUTIONS FIRST?
-- Other tables (profiles) reference institutions, so it must exist first.
-- This is a "lookup table" — read-only reference data that students
-- pick from a dropdown. No user owns it; it's global.
--
-- We seed it with the HELB-approved TVET list (180 institutions).
-- Students cannot create new institutions — that prevents dirty data.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE institutions (
  id          SERIAL PRIMARY KEY,
  -- SERIAL = auto-incrementing integer. Simple and fine for lookup tables.
  -- (We use UUID for user-owned tables because UUIDs are harder to guess
  --  and safer to expose in URLs. For institutions we don't need that.)

  name        TEXT NOT NULL UNIQUE,
  -- UNIQUE ensures no duplicate institution names in the list.

  nearest_town TEXT NOT NULL,
  -- The town/centre listed in the HELB document

  county      TEXT NOT NULL,
  -- All 47 Kenyan counties appear in the data

  category    TEXT NOT NULL DEFAULT 'TTI/TVC',
  -- 'National Polytechnic', 'TTI/TVC', 'Institute of Technology'
  -- Lets us group the dropdown by category

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on county so we can quickly filter "show me institutions in Nairobi"
CREATE INDEX idx_institutions_county ON institutions(county);
-- Index on name for fast autocomplete search
CREATE INDEX idx_institutions_name ON institutions USING GIN(to_tsvector('english', name));


-- ──────────────────────────────────────────────────────────────
-- STEP 3: profiles table
-- ──────────────────────────────────────────────────────────────
-- WHY NOT JUST USE auth.users?
-- Supabase's auth system lives in a special "auth" schema that you
-- can READ from but not modify. It stores email, encrypted password,
-- last sign in, etc. — auth stuff only.
--
-- Any custom fields (name, institution, course, onboarding status)
-- go in THIS table. The link between them is:
--   profiles.id = auth.users.id  (same UUID, 1-to-1)
--
-- REFERENCES auth.users(id):
-- This is a FOREIGN KEY. It means:
--   "profiles.id must exist in auth.users.id"
-- ON DELETE CASCADE means:
--   "If the auth user is deleted, also delete their profile"
--   (so we don't leave orphaned rows)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- UUID because auth.users uses UUID primary keys.
  -- PRIMARY KEY means this is the unique identifier and can't be null.

  full_name             TEXT,
  -- Nullable — user fills this in during onboarding. Not required at signup.

  institution_id        INTEGER REFERENCES institutions(id) ON DELETE SET NULL,
  -- Which HELB institution they attend. SET NULL means if somehow the
  -- institution is deleted from our list, the profile stays but institution
  -- becomes null (rather than deleting the student's account).

  course_field          TEXT,
  -- e.g. "Electrical Engineering", "ICT", "Fashion Design"
  -- Free text because courses aren't standardized across institutions

  graduation_year       SMALLINT,
  -- e.g. 2025, 2026. SMALLINT uses 2 bytes vs 4 for INTEGER — fine for years.

  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  -- This flag gates the onboarding wizard in Phase 2.
  -- FALSE = show onboarding | TRUE = go straight to dashboard

  avatar_url            TEXT,
  -- URL to the user's profile photo in Supabase Storage (Phase 5)

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- TIMESTAMPTZ = timestamp WITH timezone. Always store UTC, display locally.
  -- Always use TIMESTAMPTZ, never plain TIMESTAMP — it's safer for global apps.
);

-- Index for looking up profile by institution (useful for analytics later)
CREATE INDEX idx_profiles_institution ON profiles(institution_id);


-- ──────────────────────────────────────────────────────────────
-- STEP 4: Trigger to auto-create a profile when a user signs up
-- ──────────────────────────────────────────────────────────────
-- WHY A TRIGGER?
-- When a student signs up via Supabase Auth, a row is created in
-- auth.users automatically. But our profiles table doesn't get a row
-- unless we create one. Without this trigger, every signup would need
-- a second API call to insert a profile row.
--
-- A TRIGGER is a function that Postgres runs automatically when something
-- happens to a table. This one fires AFTER a new row is inserted into
-- auth.users, and creates the matching profile row.
--
-- This is the standard Supabase pattern for auto-creating profiles.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with the privileges of the function creator (postgres),
                  -- not the calling user. Needed to write to profiles from auth context.
SET search_path = public  -- Security best practice: pin the schema
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  -- NEW.id = the id of the newly created auth.users row
  -- We only set the id; everything else is NULL until onboarding.
  RETURN NEW;
END;
$$;

-- Attach the function to auth.users as an AFTER INSERT trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ──────────────────────────────────────────────────────────────
-- STEP 5: Trigger to auto-update the updated_at timestamp
-- ──────────────────────────────────────────────────────────────
-- WHY?
-- Postgres doesn't auto-update updated_at on changes like some ORMs do.
-- This trigger handles it for us on the profiles table.
-- We'll reuse this pattern on other tables too.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ──────────────────────────────────────────────────────────────
-- STEP 6: projects table
-- ──────────────────────────────────────────────────────────────
-- A "project" is one thing a student built — an app, a device,
-- a system, etc. One student can have many projects.
--
-- raw_interview_answers (JSONB):
-- JSONB = Binary JSON stored in Postgres. It's compressed and indexable.
-- We store the entire interview conversation as:
--   [
--     { "question": "What problem does your project solve?",
--       "answer": "My app helps farmers..." },
--     { "question": "What tech did you use?",
--       "answer": "Arduino, C++, and a GSM module..." }
--   ]
-- This is flexible — we don't need to know the exact questions ahead of time.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- gen_random_uuid() = built-in Postgres function to generate a UUID v4.
  -- We use UUID (not SERIAL) for user-owned records because:
  --   1. Safe to put in URLs (can't enumerate by just incrementing a number)
  --   2. Can be generated client-side if needed
  --   3. No information leakage about how many projects exist in the system

  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Links this project to exactly one user.
  -- ON DELETE CASCADE: delete the project if the user deletes their account.

  title                   TEXT NOT NULL,
  -- The name the student gives their project, e.g. "Smart Irrigation System"

  description             TEXT,
  -- Optional short description written by the student (not AI-generated)

  raw_interview_answers   JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- The full Q&A from the AI interview session. Default is an empty array.
  -- '[]'::jsonb casts the string '[]' into a JSONB value.

  interview_completed     BOOLEAN NOT NULL DEFAULT FALSE,
  -- FALSE until the student finishes the interview flow

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The most common query will be "give me all projects for user X"
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Auto-update updated_at
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ──────────────────────────────────────────────────────────────
-- STEP 7: outputs table
-- ──────────────────────────────────────────────────────────────
-- One project can have multiple outputs — e.g. the student generates
-- a LinkedIn post AND a case study for the same project.
-- Each output is a separate row here.
--
-- WHY store the Gemini prompt? So we can regenerate or debug outputs
-- without losing the context that produced them.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE outputs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Links to the project. CASCADE: delete outputs if project is deleted.

  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Denormalized for RLS simplicity — lets us write policies like
  -- "user can access their own outputs" without joining through projects.
  -- This is a deliberate tradeoff: slight redundancy for much simpler security.

  output_type  output_type NOT NULL,
  -- Uses the ENUM we created in STEP 1

  content      TEXT NOT NULL,
  -- The actual generated text from Gemini

  prompt_used  TEXT,
  -- The exact prompt we sent to Gemini (useful for debugging/regeneration)

  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  -- TRUE = show on public portfolio | FALSE = private draft

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outputs_project_id ON outputs(project_id);
CREATE INDEX idx_outputs_user_id    ON outputs(user_id);

CREATE TRIGGER outputs_updated_at
  BEFORE UPDATE ON outputs
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();


-- ──────────────────────────────────────────────────────────────
-- STEP 8: portfolio_links table
-- ──────────────────────────────────────────────────────────────
-- A public portfolio is a shareable page at /portfolio/{slug}
-- that shows a student's published outputs to anyone — no login required.
--
-- WHY A SEPARATE TABLE instead of just a field on profiles?
-- Because a student might want multiple portfolios, or want to
-- regenerate the slug, or disable it entirely. Keeping it separate
-- is cleaner and more flexible.
--
-- The slug is like: "frank-abc12xyz" — name prefix + random suffix
-- ──────────────────────────────────────────────────────────────
CREATE TABLE portfolio_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- UNIQUE: one portfolio per user

  slug       TEXT NOT NULL UNIQUE,
  -- The URL-safe identifier, e.g. "frank-abc12xyz"
  -- UNIQUE: no two users can have the same public URL

  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  -- FALSE = portfolio is hidden/deactivated (URL returns 404)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by slug (this runs on every public portfolio page load)
CREATE INDEX idx_portfolio_links_slug ON portfolio_links(slug);

CREATE TRIGGER portfolio_links_updated_at
  BEFORE UPDATE ON portfolio_links
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
