# 🎬 DEMO RECORDING SCRIPT — SkillNarrate
### Delete this file after recording. Do not commit to the public repo.

> **Total target time:** under 3 minutes  
> **Read at a calm, natural pace** — do not rush.  
> `[BRACKETS]` = on-screen actions only. Do NOT say these out loud.  
> Everything outside brackets = your exact spoken words.

---

## BEFORE YOU HIT RECORD — BROWSER SETUP

Open all tabs **before** pressing record. Have them ready to switch to instantly.

| Tab # | URL to open | Used at timestamp |
|-------|-------------|-------------------|
| **Tab 1** | `skill-narrate.vercel.app/projects/new` | 0:28 — create the project live |
| **Tab 2** | Your pre-completed Smart Irrigation project → `/projects/[id]/generate` | 1:38 — skip straight to generate |
| **Tab 3** | `skill-narrate.vercel.app/portfolio/francis-6c050ff3` | 2:00 — show live portfolio |

> ⚠️ **Important:** Tab 2 must already have a **finished interview** (all 5 exchanges done,
> "End Interview" already clicked). Do this before recording so you don't waste
> time doing all 5 exchanges live. The live demo only shows Q1 and Q2.

---

---

## ▶ 00:00 — HOOK (10 sec)

**[Camera on face, or a plain title card showing "SkillNarrate — Build it. Tell it. Own it."]**

> "Every year, thousands of TVET students in Kenya complete real, impressive
> projects — smart systems, web apps, fabricated equipment. And then they walk
> into an interview and can't explain what they built."

---

## ▶ 00:10 — PROBLEM (18 sec)

**[Stay on camera or title card]**

> "The gap isn't skill — it's narration. Nobody teaches these students how to
> turn what they built into a case study, a LinkedIn post, or a confident
> interview answer. And that gap costs them jobs."

> "SkillNarrate closes it."

---

## ▶ 00:28 — DEMO: CREATE A PROJECT (20 sec)

**[Switch to Tab 1 — the `/projects/new` form is visible on screen]**

> "A student comes in, gives their project a name, and picks what they want
> to generate."

**[Click into the Project title field and type:]**

```
Smart Irrigation System
```

**[Click into the Description field and type:]**

```
An automated irrigation controller built with Arduino that monitors soil
moisture and waters crops only when needed.
```

**[Hover over each of the four output type cards so they are visible]**

> "Case study, LinkedIn post, pitch script, or a STAR-format interview answer.
> The AI tailors every question it asks to whichever format you pick."

**[Click the "Case Study" card to select it — it highlights teal]**

**[Click "Start Interview →"]**

---

## ▶ 00:48 — DEMO: QUESTION 1 — THE OPENING (18 sec)

**[Interview page loads. Wait for the AI's first question to appear in the chat.]**

**🤖 The AI will ask exactly this (or very close):**
> *"Could you please describe the specific problem or challenge within Kenyan
> agriculture that your 'Smart Irrigation System' aims to address?"*

**[Let the question sit on screen for 2 seconds so viewers can read it]**

> "The AI opens with a question shaped for a case study — asking about the
> problem, not just 'tell me about your project'."

**[Click into the answer input and type — or paste — this answer:]**

```
Farmers in my area were watering their crops manually, sometimes twice a day,
even when the soil already had enough water. They were wasting water and their
crops were getting overwatered. I wanted to automate it so the system only
waters when the soil moisture sensor reads below a set threshold.
```

**[Click Send]**

---

## ▶ 01:06 — DEMO: QUESTION 2 — THE ADAPTIVE MOMENT (32 sec)

**[Wait for the AI's second question to appear — it takes 2–3 seconds]**

**🤖 The AI will ask exactly this (or very close):**
> *"That's a clear problem you've identified. Can you tell me more about how your
> 'Smart Irrigation System' actually works to achieve this automation, from the
> sensor reading to the watering action?"*

**[Point to or zoom into the question on screen]**

> "Watch this question carefully."

> "I mentioned a moisture threshold in my answer — and the AI immediately
> followed up on that specific detail. It didn't move to a generic next question.
> It adapted to what I said."

> "This is the key differentiator. There's no fixed question list. Every
> conversation is different because every student's project is different."

**[Type — or paste — this answer:]**

```
I set the default threshold at 40% soil moisture, but I added a small
potentiometer on the circuit board so the farmer can adjust it depending on
the crop. Tomatoes need more water than maize, so I wanted it to be flexible
without having to reprogram anything.
```

**[Click Send]**

**[Wait for Question 3 to appear — let it sit briefly on screen, don't answer it]**

**🤖 The AI will ask something like:**
> *"That's a thoughtful feature for adaptability. What specific components —
> both hardware and software — did you use to build this system, particularly
> for reading the soil moisture and controlling the watering mechanism?"*

**[Don't answer — instead, speak:]**

> "The interview continues — each question building on the last. Once you've
> done enough exchanges, you end it and generate."

---

## ▶ 01:38 — DEMO: SKIP TO GENERATE (10 sec)

**[Switch to Tab 2 — the pre-completed project's generate page]**

**[Click "Generate Case Study"]**

> "One click."

**[Wait 3–5 seconds for the content to render]**

---

## ▶ 01:48 — DEMO: SHOW THE OUTPUT (12 sec)

**[Scroll slowly through the generated case study — pause briefly on each
section heading so viewers can read them:]**

- `## Project Overview`
- `## Problem Statement`
- `## Solution & Approach`
- `## Technologies Used`
- `## Results & Impact`
- `## Key Learnings`

> "Fully structured, written in the student's own voice, from their answers.
> They can regenerate with a tone instruction — 'make it more technical',
> 'make it shorter' — and it updates the same document."

---

## ▶ 02:00 — DEMO: PORTFOLIO LINK (12 sec)

**[Click "Add to Portfolio" — or if already published, point to the "View public ↗" link]**

**[Switch to Tab 3 — `skill-narrate.vercel.app/portfolio/francis-6c050ff3`]**

> "They publish it and get one shareable link. No login required for anyone
> who visits."

**[Scroll slightly to show the project output cards on the portfolio page]**

> "This is a real, live portfolio. Every published output — accessible to any
> employer with the link. Put it on a CV, send it on WhatsApp, done."

---

## ▶ 02:12 — TECH CREDIBILITY (18 sec)

**[Back to camera, or stay on the portfolio page]**

> "Under the hood: Next.js 15, Supabase for the database and auth, and
> Google Gemini 2.5 Flash as the AI — proxied through OpenRouter."

> "One real problem I had to solve: Google AI Studio's free tier has a hard
> daily cap. Mid-session, your app just dies. So I built a model fallback
> chain — if Gemini Flash hits a rate limit, the request automatically retries
> on Gemini Flash Lite. The student never sees an error."

---

## ▶ 02:30 — WHAT'S NEXT (14 sec)

**[Simple slide or back to camera]**

> "These are planned — not built yet. An employer discovery page so recruiters
> can find students by skill. Institution-branded portfolios. Verified project
> badges from lecturers. And peer feedback on drafts before publishing."

> "The goal is a full professional identity layer for TVET students — not just
> one output, but a career asset they own."

---

## ▶ 02:44 — CLOSE (10 sec)

**[Hold on the browser showing `skill-narrate.vercel.app` — the homepage or portfolio]**

> "SkillNarrate doesn't write for students — it helps them tell their own story,
> in their own voice, professionally. The platform is live. Try it."

**[Hold the URL on screen for 3 seconds, then cut]**

---
---

# 📋 FULL INTERVIEW Q&A — COPY-PASTE READY

Use this section to **pre-type or paste** answers quickly during recording.
The questions below are the **real questions the AI asked** in your live session,
cleaned up. The answers are polished versions of what you typed — same meaning,
no typos.

---

## Project setup — type these on `/projects/new`

| Field | What to type |
|-------|-------------|
| **Project title** | `Smart Irrigation System` |
| **Description** | `An automated irrigation controller built with Arduino that monitors soil moisture and waters crops only when needed.` |
| **Output type** | Select **Case Study** |

---

## Exchange 1

### 🤖 AI Question (real, from your session):
> "Could you please describe the specific problem or challenge within Kenyan
> agriculture that your 'Smart Irrigation System' aims to address?"

### ✍️ Your answer — paste this exactly:
```
Farmers in my area were watering their crops manually, sometimes twice a day,
even when the soil already had enough water. They were wasting water and their
crops were getting overwatered. I wanted to automate it so the system only
waters when the soil moisture sensor reads below a set threshold.
```

---

## Exchange 2

### 🤖 AI Question (real, from your session):
> "That's a clear problem you've identified. Can you tell me more about how your
> 'Smart Irrigation System' actually works to achieve this automation, from the
> sensor reading to the watering action?"

### ✍️ Your answer — paste this exactly:
```
I set the default threshold at 40% soil moisture, but I added a small
potentiometer on the circuit board so the farmer can adjust it depending on
the crop. Tomatoes need more water than maize, so I wanted it to be flexible
without having to reprogram anything.
```

---

## Exchange 3

### 🤖 AI Question (real, from your session):
> "That's a thoughtful feature for adaptability. What specific components —
> both hardware and software — did you use to build this system, particularly
> for reading the soil moisture and controlling the watering mechanism?"

### ✍️ Your answer — paste this exactly:
```
I used an Arduino Uno as the main controller, a capacitive soil moisture sensor,
a 5V relay module to switch the pump on and off, and a small submersible water
pump connected to a drip irrigation line. For software I used the Arduino IDE to
write the control logic — it reads the sensor every 10 seconds and triggers the
relay when the moisture drops below the threshold.
```

---

## Exchange 4

### 🤖 AI Question (the AI will adapt — likely about testing or results):
> Something like: "How did you test the system and what results did you observe
> once it was running?"

### ✍️ Your answer — paste this exactly:
```
I tested it on a small vegetable plot at my school's farm for two weeks. Water
usage dropped compared to manual watering, and none of the plants showed signs
of overwatering. The lecturer who supervised the project said it was the most
practical solution submitted that year.
```

---

## Exchange 5

### 🤖 AI Question (the AI will adapt — likely about improvements or lessons):
> Something like: "What would you improve if you built this again, and what did
> this project teach you?"

### ✍️ Your answer — paste this exactly:
```
I would add a GSM module so the farmer receives a text message when the water
tank is empty or if the sensor fails. Right now someone has to be nearby to
notice. This project taught me that both hardware and software need to fail
gracefully — getting the relay to stop triggering false positives was the
hardest part and I learned a lot from solving it.
```

---

> ✅ After Exchange 5 the **"End Interview"** button becomes active.
> Click it → redirects to the generate page → click **"Generate Case Study"**.

---
---

# ⏱ TIMING SUMMARY

| Section | Duration | Running total |
|---------|----------|---------------|
| Hook | 0:10 | 0:10 |
| Problem | 0:18 | 0:28 |
| Create project | 0:20 | 0:48 |
| Q1 + answer (live) | 0:18 | 1:06 |
| Q2 + adaptive callout + answer (live) | 0:32 | 1:38 |
| Skip to generate | 0:10 | 1:48 |
| Show output | 0:12 | 2:00 |
| Portfolio link | 0:12 | 2:12 |
| Tech credibility | 0:18 | 2:30 |
| What's next | 0:14 | 2:44 |
| Close | 0:10 | **2:54** |

**6 seconds of buffer** before the 3:00 hard limit.

---

*🗑️ Delete this file (`DEMO_SCRIPT.md`) before submitting your hackathon entry.*
*Run: `git rm DEMO_SCRIPT.md` or just delete it manually.*
