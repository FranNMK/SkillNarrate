# Supabase Migrations

This folder contains all database migrations for SkillNarrate, in order.

## How to run

### Option A — Supabase Dashboard (easiest, no CLI needed)
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project → **SQL Editor** → **New query**
3. Run each file **in order** by pasting the contents and clicking **Run**:

| Order | File | What it does |
|---|---|---|
| 1 | `20240101000001_schema.sql` | Creates all tables, indexes, triggers |
| 2 | `20240101000002_rls.sql` | Enables RLS and adds all security policies |
| 3 | `20240101000003_seed_institutions.sql` | Seeds the 180 HELB-approved institutions |

> ⚠️ **Order matters.** The RLS file references tables that must exist first.
> The seed file inserts into `institutions` which must exist first.

### Option B — Supabase CLI (advanced)
```bash
npm install -g supabase
supabase login
supabase link --project-ref rbkayzrpcthhyxwuxuid
supabase db push
```

## Verify the seed worked

After running migration 3, run this query in the SQL Editor:

```sql
SELECT category, COUNT(*) as total
FROM institutions
GROUP BY category
ORDER BY category;
```

Expected result:
```
Institute of Technology  |  7
National Polytechnic     | 12
TTI/TVC                  | 161
```

## Re-running safely

All migrations use `ON CONFLICT DO NOTHING` (seed) or `CREATE OR REPLACE`
(functions/triggers) so they are safe to run multiple times.
