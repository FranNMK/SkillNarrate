/*
 * src/types/database.ts
 *
 * TypeScript types for our Supabase database schema.
 *
 * WHY THIS FILE EXISTS:
 * Supabase can auto-generate types from your actual database schema using
 * the Supabase CLI. That generated file is usually called `database.types.ts`.
 *
 * For Phase 0 we define a minimal placeholder type so our Supabase client
 * setup compiles without errors. In Phase 1, after we design and create
 * the real database schema, we'll replace this with the generated types.
 *
 * The pattern `createServerClient<Database>` in src/lib/supabase/server.ts
 * threads these types through every query, giving you autocomplete like:
 *   const { data } = await supabase.from('projects').select('id, title')
 *                                                          ^^^^^^^^^^^^^^^
 *                                                          TypeScript knows the shape!
 */

// This is the shape Supabase's generated types follow.
// Replace this with `supabase gen types typescript` output in Phase 1.
export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
