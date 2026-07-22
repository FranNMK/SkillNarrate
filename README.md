# SkillNarrate

> **Build it. Tell it. Own it.**

AI-guided interview platform that turns TVET and technical students' projects into
polished professional outputs — case studies, LinkedIn posts, pitch scripts, and
structured interview answers — through a short adaptive conversation.

Built for the **AI Builders Challenge — July Challenge: Creative Industries** (IBM Bob).
Developed using **IBM Bob** as the primary development environment.
Runtime AI is powered by **Google Gemini 2.5 Flash** via the OpenRouter proxy.

Deployed at: **[skill-narrate.vercel.app](https://skill-narrate.vercel.app)**
Repository: **[github.com/FranNMK/SkillNarrate](https://github.com/FranNMK/SkillNarrate)**

---

## 1. Problem Statement

TVET (Technical and Vocational Education and Training) students in Kenya regularly
complete real, technically sophisticated projects — embedded systems, web applications,
fabricated equipment — during their training. Most cannot articulate what they built in
a way that translates to employment or further education opportunities.

The gap is not skill; it is narration. Students who could demonstrate practical competence
in an interview frequently cannot write a case study, draft a LinkedIn post, or answer
"tell me about a project you're proud of" with any structure or confidence.

**SkillNarrate closes that gap.** Students answer a short AI-guided interview about a
project they already built. The platform synthesizes those answers into a formatted,
publishable output in the student's own voice — and makes it shareable via a public
portfolio URL that requires no login to view.

---

## 2. AI Approach and Architecture

### How the AI interview works

The interview engine sits entirely on the server. When a student submits an answer, the
browser calls `POST /api/interview/ask`. That route:

1. Verifies the student's session (Supabase Auth, server-side).
2. Verifies they own the project they're interviewing for.
3. Constructs a **format-specific system prompt** that tells the model it is interviewing
   a TVET student and that the conversation will be synthesized into a specific output type
   (e.g. case study, LinkedIn post, pitch script, or STAR-format interview answer). The
   system prompt also instructs the model to ask exactly **one** adaptive follow-up
   question per turn and never follow a fixed script.
4. Reconstructs the full conversation history from the Q&A pairs stored in the database
   and passes it to the model on every request — this is how the model "remembers" what
   was said earlier (the model itself is stateless).
5. Calls Google Gemini 2.5 Flash via OpenRouter and returns the next question.

The minimum number of exchanges before a student may end the interview is tiered by
output type: 3 for a LinkedIn post, 4 for a pitch script or interview answer, 5 for a
case study. There is no hard maximum — the model continues until the student ends the
session.

### Why OpenRouter instead of direct Gemini API

Google AI Studio's free tier enforces a hard daily cap of 1,500 requests per project.
OpenRouter proxies the same Gemini models through an OpenAI-compatible endpoint
(`POST https://openrouter.ai/api/v1/chat/completions`) with per-token pricing and no
daily hard limit, so the app cannot be knocked offline mid-session by a quota hit.

A model fallback chain is implemented in [`src/lib/gemini.ts`](src/lib/gemini.ts):
`google/gemini-2.5-flash` is tried first; if it returns HTTP 429 (rate-limited) or 404
(model unavailable), the request is retried automatically on `google/gemini-2.5-flash-lite`.

### Content generation

After the interview is complete, `POST /api/outputs/generate` fetches the stored Q&A
pairs, builds a format-specific **synthesis prompt**, and calls Gemini at a lower
temperature (0.6 vs. 0.8 for interviews) to produce consistent structured output. Each
format has its own explicit prompt contract:

| Output type | Structure instructed in prompt |
|---|---|
| Case Study | `## Project Overview`, `## Problem Statement`, `## Solution & Approach`, `## Technologies Used`, `## Implementation Highlights`, `## Results & Impact`, `## Key Learnings` |
| LinkedIn Post | Hook → Story → Impact → Skills → Call to action; 150–250 words; ends with hashtags |
| Pitch Script | `[HOOK]`, `[PROBLEM]`, `[SOLUTION]`, `[DEMO MOMENT]`, `[IMPACT]`, `[CLOSE]`; written to be spoken aloud |
| Interview Answer | STAR method: **Situation / Task / Action / Result**; 250–350 words |

Students can regenerate with a tone instruction (e.g. "make it more concise" or "more
technical"). Regenerating updates the existing output row rather than inserting a new
one — keeping the data model clean while allowing unlimited revisions.

### Security

`GEMINI_API_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are server-only
environment variables. All Gemini calls are made inside Next.js Route Handlers; the API
key is never sent to the browser. Supabase Row Level Security (RLS) policies enforce
ownership at the database layer — a user cannot read or write another user's projects,
outputs, or portfolio data.

### Architecture diagram

```
Browser (React)
    │
    │── Server Actions ──► Next.js server  ──► Supabase DB (RLS-protected)
    │
    │── POST /api/interview/ask    ──► OpenRouter → Gemini 2.5 Flash
    │── POST /api/interview/save   ──► Supabase DB
    │── POST /api/outputs/generate ──► OpenRouter → Gemini 2.5 Flash ──► Supabase DB
    │
    └── Server Components ──────────────── Supabase DB (direct, server-side reads)
```

---

## 3. Challenge Theme

**July Challenge — Creative Industries**

SkillNarrate directly addresses the creative challenge of professional self-presentation.
The platform treats the act of narrating one's own technical work as a creative and
career-defining skill — one that TVET students are rarely taught but frequently assessed
on. By giving students a structured way to generate and publish their own professional
content (case studies, posts, scripts), SkillNarrate contributes to the creative economy
at the point where technical training meets professional identity.

---

## 4. How IBM Bob Was Used in Development

IBM Bob was the primary development environment for this project throughout all seven
build phases.

**Architecture and planning.** Bob was used to design the database schema, define Row
Level Security policies across five tables, and plan the phased build sequence before
a single line of application code was written. The full completion plan
([`skillnarrate-completion-plan.md`](skillnarrate-completion-plan.md)) was produced
with Bob and used as the working specification.

**Feature implementation.** Every significant feature was built with Bob in agent mode:
the Supabase authentication flow (email/password + Google OAuth), the 3-step onboarding
wizard, the AI interview engine, the content generation pipeline, and the public portfolio
system. Bob wrote, reviewed, and debugged each component.

**AI integration decisions.** The shift from the native Gemini API to the OpenRouter
proxy — to avoid the Google AI Studio daily hard cap — was identified and implemented
with Bob. The model fallback chain in [`src/lib/gemini.ts`](src/lib/gemini.ts) was
designed to handle rate limits gracefully without surfacing errors to the student.

**Prompt engineering.** The format-specific system prompts for all four output types
(in [`src/app/api/interview/ask/route.ts`](src/app/api/interview/ask/route.ts) and
[`src/app/api/outputs/generate/route.ts`](src/app/api/outputs/generate/route.ts)) were
iteratively developed and refined using Bob as a development partner.

**Documentation.** This README was written by Bob based on verified codebase inspection —
no details were invented; all technical claims trace back to actual source files.

---

## 5. Live Demo and Examples

### Full portfolio (all published projects for one user)

**[https://skill-narrate.vercel.app/portfolio/francis-6c050ff3](https://skill-narrate.vercel.app/portfolio/francis-6c050ff3)**

This is a student's public portfolio page. It shows every project that student has
published, with each output accessible as a card. The URL is shareable with no login
required — this is the link a student would put on a CV or send to an employer.

### Individual output (one specific generated case study)

**[https://skill-narrate.vercel.app/portfolio/francis-6c050ff3/output/2addab28-c14c-42e2-b35d-fd48046d6c2e](https://skill-narrate.vercel.app/portfolio/francis-6c050ff3/output/2addab28-c14c-42e2-b35d-fd48046d6c2e)**

This is a direct link to one specific generated output — a single case study produced
by the AI interview and generation pipeline. Judges can use this link to see the quality
and format of a finished piece without navigating through the full portfolio.

**Difference between the two links:** The portfolio link shows a student's complete
collection of published work in one place. The individual output link shares exactly one
specific piece — useful for sharing a particular case study or post directly with someone
who only needs that one result.

---

## 6. Real-World Testing: SkillNarrate as Its Own Test Case

To verify the interview and generation flow work correctly end-to-end, the platform was
tested on itself.

A project was created inside SkillNarrate describing **SkillNarrate's own development**:
the problem it solves, the technical decisions made during the build, the AI architecture,
and what was learned. The full AI interview was completed for that project, and a case
study output was generated from those interview answers.

This meta-test served as end-to-end validation: if the interview engine could surface
meaningful answers about a software platform and the generation pipeline could turn those
answers into a coherent, structured case study, the core flow was working correctly.

The generated case study for SkillNarrate itself is published and accessible here:

**[https://skill-narrate.vercel.app/portfolio/francis-6c050ff3/output/2addab28-c14c-42e2-b35d-fd48046d6c2e](https://skill-narrate.vercel.app/portfolio/francis-6c050ff3/output/2addab28-c14c-42e2-b35d-fd48046d6c2e)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + React 19 |
| Styling | Tailwind CSS v4 |
| Backend / DB / Auth | Supabase (PostgreSQL + RLS + Auth) |
| AI model (runtime) | Google Gemini 2.5 Flash (primary) / Gemini 2.5 Flash Lite (fallback) |
| AI proxy | OpenRouter (`https://openrouter.ai/api/v1`) |
| Transactional email | Resend |
| Deployment | Vercel |
| Development tool | IBM Bob |

---

## Database Schema

| Table | Purpose |
|---|---|
| `institutions` | 180 HELB-approved Kenyan TVET institutions (seed data, read-only) |
| `profiles` | Extended user data (name, institution, course, onboarding status) |
| `projects` | Student projects; interview Q&A stored as JSONB in `raw_interview_answers` |
| `outputs` | Generated content per project (`case_study`, `linkedin_post`, `pitch_script`, `interview_answer`) |
| `portfolio_links` | Public shareable slugs — maps `slug` to `user_id`, with `is_active` toggle |

All tables have Row Level Security enabled. Users can only read and write their own rows.
Published outputs are publicly readable when the associated portfolio link is active.

---

## Output Formats

| Format | Appropriate for | Approximate length |
|---|---|---|
| Case Study | Portfolio, job applications, GitHub README | 400–600 words |
| LinkedIn Post | Social media, networking | 150–250 words + hashtags |
| Pitch Script | Hackathons, demo days, competitions | 60–90 seconds spoken (~150–200 words) |
| Interview Answer | Technical job/internship interviews (STAR format) | 250–350 words |

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
# Fill in your Supabase, OpenRouter/Gemini, and Resend credentials
```

See [`.env.example`](.env.example) for descriptions of every required variable.

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret key) |
| `GEMINI_API_KEY` | [OpenRouter dashboard](https://openrouter.ai/keys) — used as the bearer token |
| `RESEND_API_KEY` | [Resend dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Your verified sender address in Resend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Run database migrations

In your Supabase dashboard → SQL Editor, run each file in order:

```
supabase/migrations/20240101000001_schema.sql
supabase/migrations/20240101000002_rls.sql
supabase/migrations/20240101000003_seed_institutions.sql
supabase/migrations/20240101000004_add_project_output_type.sql
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, forgot-password pages
│   ├── (dashboard)/         # Logged-in app pages (session-protected)
│   │   ├── dashboard/       # Project list + portfolio card
│   │   ├── projects/
│   │   │   ├── new/         # Create project form
│   │   │   └── [id]/
│   │   │       ├── interview/  # AI chat interview
│   │   │       └── generate/   # Content generation + publish
│   │   └── settings/portfolio/ # Portfolio link management
│   ├── (marketing)/         # Public pages (navbar + footer layout)
│   │   ├── about/
│   │   ├── support/
│   │   └── portfolio/
│   │       └── [slug]/
│   │           └── output/
│   │               └── [outputId]/  # Individual output share page
│   └── api/
│       ├── interview/ask/      # Adaptive Gemini question generation
│       ├── interview/save/     # Persist Q&A to database
│       ├── interview/complete/ # Mark interview done
│       ├── outputs/generate/   # Synthesize interview → output format
│       └── email/welcome/      # Onboarding welcome email
├── components/
│   ├── marketing/              # Navbar, Footer
│   └── features/
│       ├── InterviewChat.tsx   # AI chat UI (Client Component)
│       └── OutputGenerator.tsx # Generate / copy / publish UI (Client Component)
├── lib/
│   ├── supabase/               # Browser and server Supabase clients
│   ├── actions/                # Server Actions (auth, onboarding, projects, outputs, portfolio)
│   ├── gemini.ts               # OpenRouter/Gemini API helper (server-only)
│   └── resend.ts               # Resend email helper (server-only)
├── middleware.ts               # Session refresh + route protection (Edge)
└── types/database.ts           # TypeScript types for the Supabase schema
```

---

## License

MIT — free to use, modify, and build upon.
