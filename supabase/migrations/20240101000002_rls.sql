-- ============================================================
-- SkillNarrate — Row Level Security (RLS) Policies
-- Migration: 20240101000002_rls.sql
-- ============================================================
-- Run this AFTER 20240101000001_schema.sql
--
-- ── DEEP DIVE: How RLS works in Supabase ──────────────────────
--
-- Every table has RLS disabled by default. When you call:
--   ALTER TABLE x ENABLE ROW LEVEL SECURITY;
-- Postgres adds a "security layer" to the table. From that moment:
--
--   • If NO policies exist → NOBODY can read or write (even the owner!)
--   • Policies are ADDITIVE — a row is accessible if ANY policy allows it
--   • The special function auth.uid() returns the UUID of the currently
--     authenticated Supabase user (from their JWT token)
--
-- POLICY TYPES:
--   SELECT  → controls who can read rows (GET)
--   INSERT  → controls who can add rows
--   UPDATE  → controls who can modify rows
--   DELETE  → controls who can remove rows
--   ALL     → shorthand for all four above
--
-- USING vs WITH CHECK:
--   USING      → applied when reading existing rows (SELECT, UPDATE, DELETE)
--   WITH CHECK → applied when writing new/modified rows (INSERT, UPDATE)
--   For SELECT, only USING applies.
--   For INSERT, only WITH CHECK applies.
--   For UPDATE, both apply (USING to find the row, WITH CHECK on the new data).
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- institutions: READ-ONLY for everyone
-- ──────────────────────────────────────────────────────────────
-- WHY NO RLS HERE?
-- institutions is seeded reference data — like a lookup table.
-- It has no user ownership. Anyone (logged in or not) should be
-- able to read it for the signup dropdown.
--
-- We enable RLS but grant a public SELECT policy so logged-out
-- users can still populate the institution dropdown on the signup form.
-- Nobody should INSERT/UPDATE/DELETE institutions from the app — only
-- admins via the SQL editor.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institutions_read_public"
  ON institutions
  FOR SELECT
  USING (TRUE);
-- USING (TRUE) = allow all SELECT, regardless of who's asking.
-- No INSERT/UPDATE/DELETE policy = nobody can modify via the API.


-- ──────────────────────────────────────────────────────────────
-- profiles: users own their own row
-- ──────────────────────────────────────────────────────────────
-- auth.uid() is a Supabase function that returns the UUID of
-- the currently authenticated user from their session JWT.
--
-- So "profiles.id = auth.uid()" means:
--   "You can only access profile rows where the id is YOUR id"
-- ──────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Read your own profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Update your own profile (you can't change your id)
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert is handled by the trigger (handle_new_user), not the client.
-- No INSERT policy needed here because the trigger runs as SECURITY DEFINER
-- (with postgres-level privileges, bypassing RLS).


-- ──────────────────────────────────────────────────────────────
-- projects: users own their own projects
-- ──────────────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Read your own projects
CREATE POLICY "projects_select_own"
  ON projects
  FOR SELECT
  USING (user_id = auth.uid());

-- Create a new project (user_id must be set to YOUR id — no faking)
CREATE POLICY "projects_insert_own"
  ON projects
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update your own projects
CREATE POLICY "projects_update_own"
  ON projects
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Delete your own projects
CREATE POLICY "projects_delete_own"
  ON projects
  FOR DELETE
  USING (user_id = auth.uid());


-- ──────────────────────────────────────────────────────────────
-- outputs: users own their outputs, PLUS public portfolio reads
-- ──────────────────────────────────────────────────────────────
-- This table has TWO read paths:
--
-- Path 1 (private): The logged-in owner reads their own outputs
--   → standard user_id = auth.uid() check
--
-- Path 2 (public): Anyone reads outputs that are:
--   a) is_published = TRUE
--   b) The owner has an active portfolio_link
--
-- For Path 2, we do a subquery: "Does a portfolio_links row exist for
-- this output's user_id where is_active = TRUE?"
-- If yes, and is_published is true, the row is visible to everyone.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

-- Path 1: Owner reads their own outputs (published or drafts)
CREATE POLICY "outputs_select_own"
  ON outputs
  FOR SELECT
  USING (user_id = auth.uid());

-- Path 2: Public reads published outputs from users with active portfolios
CREATE POLICY "outputs_select_public_portfolio"
  ON outputs
  FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM portfolio_links
      WHERE portfolio_links.user_id = outputs.user_id
        AND portfolio_links.is_active = TRUE
    )
  );
-- EXISTS(...) is a Postgres pattern that returns TRUE if the subquery
-- finds at least one matching row. Very efficient — stops at first match.

-- Owner creates outputs (user_id must be theirs)
CREATE POLICY "outputs_insert_own"
  ON outputs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner updates their outputs
CREATE POLICY "outputs_update_own"
  ON outputs
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owner deletes their outputs
CREATE POLICY "outputs_delete_own"
  ON outputs
  FOR DELETE
  USING (user_id = auth.uid());


-- ──────────────────────────────────────────────────────────────
-- portfolio_links: users own their link, public can look up by slug
-- ──────────────────────────────────────────────────────────────
-- The public portfolio page at /portfolio/{slug} needs to read
-- this table WITHOUT the visitor being logged in — to find which
-- user owns that slug and load their published outputs.
--
-- So we have two read policies here too:
--   1. Owner can read and manage their own link
--   2. Anyone can SELECT a link by slug (to resolve the public page)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE portfolio_links ENABLE ROW LEVEL SECURITY;

-- Owner reads and manages their portfolio link
CREATE POLICY "portfolio_links_select_own"
  ON portfolio_links
  FOR SELECT
  USING (user_id = auth.uid());

-- Public: anyone can look up a portfolio link (needed to render /portfolio/[slug])
-- This is safe because portfolio links are intentionally public URLs.
CREATE POLICY "portfolio_links_select_by_slug"
  ON portfolio_links
  FOR SELECT
  USING (is_active = TRUE);
-- is_active = TRUE ensures deactivated portfolios are invisible to the public.
-- The owner's own SELECT policy above has no is_active check, so they can
-- still see and re-enable their deactivated link.

-- Owner creates their portfolio link
CREATE POLICY "portfolio_links_insert_own"
  ON portfolio_links
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner updates their portfolio link (toggle is_active, change slug)
CREATE POLICY "portfolio_links_update_own"
  ON portfolio_links
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owner deletes their portfolio link
CREATE POLICY "portfolio_links_delete_own"
  ON portfolio_links
  FOR DELETE
  USING (user_id = auth.uid());
