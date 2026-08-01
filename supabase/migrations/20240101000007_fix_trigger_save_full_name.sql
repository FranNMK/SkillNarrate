-- ============================================================
-- SkillNarrate — Fix: save full_name from signup metadata
-- Migration: 20240101000007_fix_trigger_save_full_name.sql
-- ============================================================
-- PROBLEM:
--   The original handle_new_user() trigger only inserted the user's id
--   into the profiles table. The full_name supplied during signup was
--   stored in auth.users.raw_user_meta_data but never copied to profiles.
--   This meant every email-signup user had NULL for full_name.
--
-- FIX:
--   Read NEW.raw_user_meta_data->>'full_name' (set by signUpAction via
--   supabase.auth.signUp options.data) and write it into profiles.full_name
--   at the moment the profile row is first created.
--
-- RUN THIS IN:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    -- Read full_name from the metadata passed during signUp.
    -- For Google OAuth users this comes from the OAuth profile automatically.
    -- For email signups this is set via options.data in signUpAction.
    -- Coalesce handles the case where neither source has a name (safe fallback to NULL).
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'   -- Google OAuth uses 'name' not 'full_name'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  -- ON CONFLICT: safety net in case a profile row already exists (e.g. re-confirms)
  RETURN NEW;
END;
$$;
