-- ============================================================
-- SkillNarrate — Add project media/links fields
-- Migration: 20240101000005_project_media_fields.sql
-- ============================================================
-- Adds optional logo, demo video, demo link, and GitHub link
-- to the projects table. All fields are nullable — they're only
-- shown on the public portfolio when provided.
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS logo_url       TEXT,
  ADD COLUMN IF NOT EXISTS demo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS demo_link      TEXT,
  ADD COLUMN IF NOT EXISTS github_link    TEXT;
