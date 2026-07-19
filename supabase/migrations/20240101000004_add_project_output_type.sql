-- ============================================================
-- SkillNarrate — Add output_type to projects table
-- Migration: 20240101000004_add_project_output_type.sql
-- ============================================================
-- WHY THIS MIGRATION?
-- When a student creates a project, they choose which output they want
-- (case study, LinkedIn post, etc.) BEFORE the interview starts.
-- This guides both the AI interview questions AND the generation step.
--
-- We store this as a column on projects (not inside the JSONB array)
-- because:
--   1. It's a first-class attribute of the project, not interview data
--   2. We can query/filter by it easily (e.g. "show all case study projects")
--   3. The ENUM type gives us data integrity
--
-- HOW TO RUN THIS:
-- In Supabase Dashboard → SQL Editor → New Query → paste & run.
-- If using Supabase CLI: supabase db push
-- ============================================================

ALTER TABLE projects
  ADD COLUMN output_type output_type NOT NULL DEFAULT 'case_study';

-- Note: we set DEFAULT 'case_study' so existing rows (if any) get a value.
-- New projects will always supply the correct value from the form.

-- Index to allow filtering projects by output type
CREATE INDEX idx_projects_output_type ON projects(output_type);

COMMENT ON COLUMN projects.output_type IS
  'The format the student wants to generate from this interview. '
  'Set at project creation and guides both the AI questions and generation.';
