-- ============================================================
-- SkillNarrate — Add pending_ai_question to projects
-- Migration: 20240101000006_pending_ai_question.sql
-- ============================================================
-- WHY THIS COLUMN?
-- When the AI asks a question, we show it immediately in the chat UI.
-- If the student navigates away (or closes the tab) before answering,
-- the question is lost — only fully-answered Q&As are in raw_interview_answers.
--
-- This column stores the last AI question that is still waiting for an answer.
-- On resume, we display it in the chat so the student can answer it and
-- the interview continues from exactly where it left off.
--
-- It is NULL when there is no pending unanswered question (e.g. right after
-- the student sends an answer, before the next AI question arrives).
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS pending_ai_question TEXT;
