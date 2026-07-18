/**
 * src/types/database.ts
 *
 * TypeScript types for the SkillNarrate Supabase schema.
 *
 * ── WHY HAND-WRITE THESE? ────────────────────────────────────
 * Supabase has a CLI command:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 * that auto-generates types from your live database.
 *
 * We write them by hand now so you can see the shape and understand it.
 * In Phase 5 (before deploying) we'll regenerate from the live schema
 * to make sure they're perfectly in sync.
 *
 * ── HOW THE TYPE SYSTEM WORKS ────────────────────────────────
 * The Database type is a nested object that mirrors your Postgres schema:
 *
 *   Database
 *   └── public
 *       ├── Tables
 *       │   ├── profiles      { Row, Insert, Update }
 *       │   ├── institutions  { Row, Insert, Update }
 *       │   └── ...
 *       └── Enums
 *           └── output_type   "case_study" | "linkedin_post" | ...
 *
 * Row    = the shape of a SELECT result (all columns, some nullable)
 * Insert = what you pass to INSERT (required columns, optional ones with defaults)
 * Update = what you pass to UPDATE (all columns optional — patch semantics)
 *
 * When you use these with the typed client:
 *   const supabase = createClient<Database>(...)
 *   const { data } = await supabase.from('projects').select('id, title')
 *   //     ^data is typed as { id: string; title: string }[] automatically
 */

// ── Enum type ────────────────────────────────────────────────
export type OutputType =
  | "case_study"
  | "linkedin_post"
  | "pitch_script"
  | "interview_answer";

// ── Table row shapes ─────────────────────────────────────────

export type Institution = {
  id: number;
  name: string;
  nearest_town: string;
  county: string;
  category: string;
  created_at: string; // ISO 8601 string — Supabase returns timestamps as strings
};

export type Profile = {
  id: string;                      // UUID — matches auth.users.id
  full_name: string | null;
  institution_id: number | null;
  course_field: string | null;
  graduation_year: number | null;
  onboarding_completed: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;                      // UUID
  user_id: string;                 // UUID
  title: string;
  description: string | null;
  raw_interview_answers: InterviewQA[]; // typed JSONB
  interview_completed: boolean;
  created_at: string;
  updated_at: string;
};

// The shape of each Q&A object stored in raw_interview_answers JSONB
export type InterviewQA = {
  question: string;
  answer: string;
};

export type Output = {
  id: string;                      // UUID
  project_id: string;              // UUID
  user_id: string;                 // UUID
  output_type: OutputType;
  content: string;
  prompt_used: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type PortfolioLink = {
  id: string;                      // UUID
  user_id: string;                 // UUID
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// ── Full Database type (passed to createClient<Database>) ─────

export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: Institution;
        Insert: Omit<Institution, "id" | "created_at"> & { id?: number; created_at?: string };
        Update: Partial<Omit<Institution, "id">>;
      };
      profiles: {
        Row: Profile;
        // Insert: id is required (must match auth user). Everything else optional.
        Insert: Pick<Profile, "id"> & Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      projects: {
        Row: Project;
        // Insert: user_id and title are required. id/timestamps are auto-generated.
        Insert: Pick<Project, "user_id" | "title"> & Partial<Omit<Project, "user_id" | "title" | "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Project, "id" | "user_id" | "created_at">>;
      };
      outputs: {
        Row: Output;
        // Insert: project_id, user_id, output_type, content are required.
        Insert: Pick<Output, "project_id" | "user_id" | "output_type" | "content"> & Partial<Omit<Output, "project_id" | "user_id" | "output_type" | "content" | "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Output, "id" | "user_id" | "project_id" | "created_at">>;
      };
      portfolio_links: {
        Row: PortfolioLink;
        Insert: Pick<PortfolioLink, "user_id" | "slug"> & Partial<Omit<PortfolioLink, "user_id" | "slug" | "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<PortfolioLink, "id" | "user_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      output_type: OutputType;
    };
  };
};
