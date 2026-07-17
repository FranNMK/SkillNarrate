# SkillNarrate

> **Build it. Tell it. Own it.**

AI-guided interview tool that turns technical/TVET students' projects into polished case studies, LinkedIn posts, pitch scripts, and interview answers — powered by IBM watsonx.ai (Granite model).

Built for the **AI Builders Challenge with IBM Bob** (July 2026, Creative Industries theme).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js 15](https://nextjs.org) (App Router) + TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Backend / DB / Auth | [Supabase](https://supabase.com) |
| AI (runtime) | [IBM watsonx.ai](https://www.ibm.com/watsonx) — Granite model |
| Transactional Email | [Resend](https://resend.com) |
| Deployment | [Vercel](https://vercel.com) |

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

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/FranNMK/SkillNarrate.git
cd SkillNarrate
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase, watsonx.ai, and Resend credentials
```

See [`.env.example`](.env.example) for descriptions of every variable.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, signup, password reset pages
│   ├── (dashboard)/         # Logged-in app pages
│   ├── api/
│   │   ├── watsonx/         # Server route — calls IBM watsonx.ai
│   │   └── email/           # Server route — sends via Resend
│   ├── layout.tsx           # Root HTML shell
│   └── page.tsx             # Landing page "/"
├── components/
│   ├── ui/                  # Generic primitives (Button, Card, Input…)
│   └── features/            # Feature components (InterviewChat, ProjectCard…)
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser Supabase client
│   │   └── server.ts        # Server Supabase client (cookies-based)
│   ├── watsonx.ts           # watsonx.ai REST helper
│   └── resend.ts            # Resend email helper
├── middleware.ts             # Session refresh middleware (runs on every request)
└── types/
    └── database.ts          # Supabase schema types (generated in Phase 1)
```

---

## How the Services Talk to Each Other

```
Browser (React)
    │
    │── reads/writes → Supabase (auth + database, using anon key + RLS)
    │
    │── POST → /api/watsonx/generate  (Next.js API Route — server only)
    │                │
    │                └──► IBM watsonx.ai  (Granite model, API key stays secret)
    │
    └── POST → /api/email/send  (Next.js API Route — server only)
                     │
                     └──► Resend  (API key stays secret)
```

**The golden rule:** `WATSONX_API_KEY`, `RESEND_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are server-only secrets. They never reach the browser.

---

## Build Phases

| Phase | Description | Status |
|---|---|---|
| **0** | Project setup & scaffolding | ✅ Complete |
| **1** | Supabase auth + database schema + RLS | 🔜 Next |
| **2** | Dashboard — project CRUD | ⏳ Pending |
| **3** | AI interview engine (watsonx.ai) | ⏳ Pending |
| **4** | Content generation & editor | ⏳ Pending |
| **5** | Polish, onboarding email, deploy to Vercel | ⏳ Pending |

---

## License

MIT
