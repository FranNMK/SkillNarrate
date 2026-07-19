# SkillNarrate

> **Build it. Tell it. Own it.**

AI-guided interview tool that turns technical/TVET students' projects into polished case studies, LinkedIn posts, pitch scripts, and interview answers.

Built for the **AI Builders Challenge with IBM Bob** (July 2026, Creative Industries theme).
Developed using **IBM Bob** as the primary development tool; **Google Gemini 2.0 Flash** powers the in-app AI interview and content generation.

---

## What It Does

1. Student signs up and fills in a short onboarding (name, institution, course)
2. Creates a project (title + description + chooses output format)
3. AI interviews them with **adaptive questions** — each question responds to the previous answer
4. Student answers 4–7 questions about what they built, why, and how
5. Gemini synthesizes the interview into a polished output in the chosen format
6. Student can regenerate with a different tone, copy to clipboard, or publish to their portfolio
7. Public portfolio page at `/portfolio/[slug]` — shareable with employers, no login required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js 15](https://nextjs.org) (App Router) + TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Backend / DB / Auth | [Supabase](https://supabase.com) |
| AI (runtime) | [Google Gemini API](https://aistudio.google.com) — Gemini 2.0/1.5 Flash |
| Transactional Email | [Resend](https://resend.com) |
| Deployment | [Vercel](https://vercel.com) |
| Dev Tool | IBM Bob (AI Builders Challenge requirement) |

---

## Brand

| Token | Value |
|---|---|
| Primary | Deep Teal `#0F766E` |
| Secondary | Warm Amber `#F59E0B` |
| Accent | Terracotta `#C2410C` |
| Text | Charcoal `#1F2937` |
| Background | Off-white `#F9FAFB` |

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/FranNMK/SkillNarrate.git
cd SkillNarrate
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase, Gemini, and Resend credentials
```

See [`.env.example`](.env.example) for descriptions of every variable.

### 3. Run the database migrations

In your Supabase dashboard → SQL Editor, run each migration in order:

```
supabase/migrations/20240101000001_schema.sql
supabase/migrations/20240101000002_rls.sql
supabase/migrations/20240101000003_seed_institutions.sql
supabase/migrations/20240101000004_add_project_output_type.sql
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "chore: ready for deployment"
git push origin main
```

### 2. Create Vercel project

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Framework preset: **Next.js** (auto-detected)

### 3. Add environment variables

In Vercel → Project Settings → Environment Variables, add all variables from `.env.local`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Your verified sender address in Resend |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g. `https://skillnarrate.vercel.app`) |

### 4. Configure Supabase for production

After your first Vercel deploy, update these settings in Supabase:

**Auth → URL Configuration:**
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

**Auth → Providers → Google OAuth:**
- Add `https://your-app.vercel.app/auth/callback` to Authorized redirect URIs in Google Cloud Console

### 5. Deploy

Click **Deploy** in Vercel — it builds and deploys in ~2 minutes.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, password reset pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/         # Logged-in app pages (route-protected)
│   │   ├── dashboard/       # Project list + portfolio card
│   │   ├── projects/
│   │   │   ├── new/         # Create project form
│   │   │   └── [id]/
│   │   │       ├── interview/  # AI chat interview
│   │   │       └── generate/   # Content generation + publish
│   │   └── settings/
│   │       └── portfolio/   # Portfolio link management
│   ├── (marketing)/         # Public pages (navbar + footer layout)
│   │   ├── about/
│   │   ├── support/
│   │   └── portfolio/
│   │       └── [slug]/      # Public portfolio page
│   │           └── output/
│   │               └── [outputId]/  # Individual output share page
│   ├── api/
│   │   ├── interview/
│   │   │   ├── ask/         # Adaptive Gemini question generation
│   │   │   ├── save/        # Persist Q&A to database
│   │   │   └── complete/    # Mark interview done
│   │   ├── outputs/
│   │   │   └── generate/    # Synthesize answers → output format
│   │   └── email/
│   │       └── welcome/     # Onboarding welcome email
│   ├── auth/
│   │   └── callback/        # OAuth + email confirmation handler
│   ├── not-found.tsx         # Global 404 page
│   ├── layout.tsx            # Root HTML shell
│   └── page.tsx              # Landing page "/"
├── components/
│   ├── marketing/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── features/
│       ├── InterviewChat.tsx    # AI chat UI (Client Component)
│       └── OutputGenerator.tsx  # Generate/copy/publish UI (Client Component)
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   └── server.ts        # Server Supabase client (cookies-based)
│   ├── actions/
│   │   ├── auth.ts          # Sign up/in/out Server Actions
│   │   ├── onboarding.ts    # Onboarding wizard Server Action
│   │   ├── projects.ts      # Create project, complete interview
│   │   ├── outputs.ts       # Publish/unpublish output
│   │   └── portfolio.ts     # Portfolio link management
│   ├── emails/
│   │   └── templates.ts     # HTML email templates
│   ├── gemini.ts            # Gemini API REST helper (server-only)
│   └── resend.ts            # Resend email helper (server-only)
├── middleware.ts             # Session refresh + route protection
└── types/
    └── database.ts          # Supabase schema TypeScript types
```

---

## How the Services Talk to Each Other

```
Browser (React)
    │
    │── form actions ──► Next.js Server Actions (lib/actions/)
    │                         │
    │                         └──► Supabase DB (RLS-protected)
    │
    │── fetch POST ──► /api/interview/ask    ──► Google Gemini API
    │── fetch POST ──► /api/interview/save   ──► Supabase DB
    │── fetch POST ──► /api/outputs/generate ──► Google Gemini API ──► Supabase DB
    │
    └── (server renders) ──► Supabase DB directly (Server Components)
```

**Security rule:** `GEMINI_API_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` never reach the browser. All Gemini calls go through server-side API routes.

---

## Database Schema

| Table | Purpose |
|---|---|
| `institutions` | 180 HELB-approved Kenyan TVET institutions (seed data) |
| `profiles` | Extended user data (name, institution, course, onboarding flag) |
| `projects` | Student projects with interview Q&A stored as JSONB |
| `outputs` | Generated content per project (case study, LinkedIn post, etc.) |
| `portfolio_links` | Public shareable slugs per user |

All tables have Row Level Security (RLS) enabled. Users can only read/write their own data. Published outputs are publicly readable when the user has an active portfolio.

---

## Build Status

| Phase | Description | Status |
|---|---|---|
| **0** | Project setup, env vars, folder structure | ✅ Complete |
| **1** | Database schema, RLS, 180 institutions seeded | ✅ Complete |
| **2** | Email/password + Google OAuth, onboarding wizard | ✅ Complete |
| **3** | Homepage, About, Support, Dashboard | ✅ Complete |
| **4** | AI interview engine (adaptive Gemini questioning) | ✅ Complete |
| **5** | Content generation (4 formats), copy, regenerate | ✅ Complete |
| **6** | Public portfolio, individual output share links | ✅ Complete |
| **7** | Error handling, loading states, Vercel deployment | ✅ Complete |

---

## License

MIT — free to use, modify, and build upon.
