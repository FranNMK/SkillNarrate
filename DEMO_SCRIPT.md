# 🎬 DEMO RECORDING SCRIPT — SkillNarrate
### Delete this file after recording. Do not commit.

> **Total target time:** under 3 minutes  
> **Read at a calm, natural pace** — do not rush.  
> Everything in `[BRACKETS]` = what to do on screen, not spoken aloud.  
> Everything outside brackets = what you say, word for word.

---

## BEFORE YOU HIT RECORD — BROWSER SETUP

Open these three tabs in order and keep them ready:

| Tab | URL | Used at |
|-----|-----|---------|
| Tab 1 | `skill-narrate.vercel.app/projects/new` | 0:28 |
| Tab 2 | `skill-narrate.vercel.app/projects/new` → go through interview live | 0:48 |
| Tab 3 | `skill-narrate.vercel.app/portfolio/francis-6c050ff3` | 1:48 |

> **Tip:** Have a second browser window with the already-completed project open so you
> can skip to the generate step without waiting through 5 live interview exchanges.
> Use your real logged-in demo account.

---

---

## ▶ 00:00 — HOOK (10 sec)

**[Camera on face, or simple dark title card: "SkillNarrate"]**

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

## ▶ 00:28 — DEMO STARTS: CREATE A PROJECT (20 sec)

**[Switch to browser — Tab 1: `/projects/new` page is visible]**

> "A student comes in, fills in their project name and picks what they want
> to generate."

**[Type in the Project title field:]**
```
Smart Irrigation System
```

**[Type in the Description field — optional, you can leave it blank or type:]**
```
An automated irrigation controller built with Arduino that monitors
soil moisture and waters crops only when needed.
```

**[Click through the four output type cards slowly so they're visible]**

> "Case study, LinkedIn post, pitch script, or a STAR-format interview answer —
> and the AI tailors every question it asks to whichever one you pick."

**[Click the "Case Study" card to select it]**

**[Click "Start Interview →"]**

---

## ▶ 00:48 — DEMO: AI INTERVIEW — QUESTION 1 (20 sec)

**[Interview page loads. The AI's first question appears on screen.]**

> **The AI will ask something like:**
> *"What specific problem or need were you trying to solve with the
> Smart Irrigation System — what was happening that made you decide
> to build it?"*

**[Point to the question on screen]**

> "The AI opens with a question tailored to a case study output —
> asking about the problem, not just 'tell me about your project'."

**[Type the following answer into the chat input and click Send:]**
```
Farmers in my area were watering their crops manually, sometimes twice a day,
even when the soil was already wet. They were wasting water and their crops
were getting overwatered. I wanted to automate it so the system only waters
when the soil moisture sensor reads below a set threshold.
```

---

## ▶ 01:08 — DEMO: AI FOLLOW-UP — THE KEY MOMENT (30 sec)

**[Wait for the AI's next question to appear. It will follow up on something
specific from your answer — likely the sensor or the threshold logic.]**

> **The AI will ask something like:**
> *"You mentioned the system only waters when moisture drops below a set
> threshold — how did you decide what that threshold should be, and was
> it adjustable for different crops?"*

**[Point at the question on screen — this is your callout moment]**

> "Watch this — the AI just read my answer and followed up on the specific
> detail I mentioned: the moisture threshold. It didn't ask a generic
> next question. It adapted."

> "This is the key differentiator. There's no fixed question list.
> Every conversation is different because every student's project is different."

**[Type the following answer and click Send:]**
```
I set the default threshold at 40% moisture, but I added a small potentiometer
on the circuit board so the farmer can adjust it depending on the crop.
Tomatoes need more water than maize, so I wanted it to be flexible.
```

---

## ▶ 01:38 — DEMO: SKIP TO GENERATE (10 sec)

**[Switch to the pre-completed project's generate page — use your second
browser window that already has a finished interview]**

> "Once you've answered enough questions — the minimum is five exchanges
> for a case study — you end the interview and generate."

**[Click the "Generate Case Study" button]**

> "One click."

**[Wait for the content to render — about 3–5 seconds]**

---

## ▶ 01:48 — DEMO: SHOW THE OUTPUT (12 sec)

**[Scroll slowly through the generated case study, letting each section
heading be visible for a beat:]**
- `## Project Overview`
- `## Problem Statement`
- `## Solution & Approach`
- `## Technologies Used`
- `## Results & Impact`
- `## Key Learnings`

> "Fully structured, written in the student's own voice, from their answers.
> They can also regenerate with a tone instruction — 'make it more technical',
> 'make it shorter' — and it updates the same document."

---

## ▶ 02:00 — DEMO: PORTFOLIO LINK (12 sec)

**[Click "Add to Portfolio" button]**

**[Switch to Tab 3: `skill-narrate.vercel.app/portfolio/francis-6c050ff3`]**

> "They publish it — and get one shareable link. No login required
> for anyone who visits."

**[Scroll slightly to show the output cards on the portfolio page]**

> "This is a real live portfolio. Every published output for one student,
> accessible to any employer with the link — put it on a CV, send it in
> a WhatsApp message, done."

---

## ▶ 02:12 — TECH CREDIBILITY (18 sec)

**[Back to camera or stay on the portfolio page]**

> "Under the hood: Next.js 15, Supabase for the database and auth,
> Google Gemini 2.5 Flash as the AI — routed through OpenRouter."

> "One real engineering problem I had to solve: Google AI Studio's free
> tier has a hard daily cap. Mid-session, your app just dies. So I built
> an automatic model fallback — if Gemini Flash hits a rate limit, the
> request silently retries on Gemini Flash Lite. The student never sees
> an error."

---

## ▶ 02:30 — WHAT'S NEXT (14 sec)

**[Simple slide or back to camera]**

> "These are planned — not built yet. An employer discovery page so
> recruiters can search students by skill. Institution-branded portfolios.
> Verified project badges from lecturers. And peer feedback on drafts
> before publishing."

> "The goal is a full professional identity layer for TVET students — not
> just one output, but a career asset they own."

---

## ▶ 02:44 — CLOSE (10 sec)

**[Hold on the live URL: `skill-narrate.vercel.app`]**

> "SkillNarrate doesn't write for students — it helps them tell their own
> story, in their own voice, professionally. The platform is live. Try it."

**[Hold the URL on screen for 3 seconds, then cut]**

---

---

## FULL INTERVIEW Q&A — copy-paste ready

Use these if you want to pre-type answers to paste quickly during recording.

### Project details to enter on `/projects/new`

| Field | Value |
|-------|-------|
| **Project title** | `Smart Irrigation System` |
| **Description** | `An automated irrigation controller built with Arduino that monitors soil moisture and waters crops only when needed.` |
| **Output type** | `Case Study` |

---

### Exchange 1

**AI opens with** *(expected — based on the case study opening prompt in the code)*:
> "What specific problem or need were you trying to solve with the Smart Irrigation
> System — what was happening that made you decide to build it?"

**YOUR ANSWER — paste this:**
```
Farmers in my area were watering their crops manually, sometimes twice a day, even
when the soil was already wet. They were wasting water and their crops were getting
overwatered. I wanted to automate it so the system only waters when the soil moisture
sensor reads below a set threshold.
```

---

### Exchange 2

**AI follow-up** *(will adapt to your answer — likely about the threshold or sensor)*:
> Something like: "You mentioned the moisture threshold — how did you decide what
> level to set it at, and could the farmer adjust it?"

**YOUR ANSWER — paste this:**
```
I set the default at 40% soil moisture. I also added a small potentiometer on the
circuit board so the farmer can turn it up or down depending on the crop. Tomatoes
need more water than maize, so I wanted it to be flexible without reprogramming.
```

---

### Exchange 3

**AI follow-up** *(will adapt — likely about the hardware components or build process)*:
> Something like: "What components did you use to build this, and what was the
> hardest part of getting the hardware to work reliably?"

**YOUR ANSWER — paste this:**
```
I used an Arduino Uno, a capacitive soil moisture sensor, a 5V relay module, and a
small water pump. The hardest part was the relay — it kept triggering false positives
when the pump switched on because of voltage spikes. I fixed it by adding a flyback
diode across the relay coil.
```

---

### Exchange 4

**AI follow-up** *(will adapt — likely about testing or results)*:
> Something like: "How did you test it in the field, and what results did you
> actually see when it was running?"

**YOUR ANSWER — paste this:**
```
I tested it on a small vegetable plot at my school's farm for two weeks. Water usage
went down noticeably compared to manual watering, and none of the plants showed signs
of overwatering. The lecturer who supervised the project said it was the most practical
solution we'd submitted that year.
```

---

### Exchange 5

**AI follow-up** *(will adapt — likely about what you learned or what you'd improve)*:
> Something like: "What's one thing you would improve if you built this again, and
> what did this project teach you as an engineer?"

**YOUR ANSWER — paste this:**
```
I would add a GSM module so the farmer gets a text message when the tank is empty or
if the sensor fails. Right now it only works if someone is nearby to notice. This
project taught me that hardware and software both have to fail gracefully — the relay
diode fix was a lesson I won't forget.
```

---

> **After Exchange 5** the "End Interview" button becomes active (the code sets
> `minExchanges = 5` for case study). Click it, then click "Generate Case Study".

---

## TIMING SUMMARY

| Section | Says | Clock |
|---------|------|-------|
| Hook | 0:10 | 0:10 |
| Problem | 0:18 | 0:28 |
| Create project | 0:20 | 0:48 |
| Q1 + answer | 0:20 | 1:08 |
| Q2 + callout moment | 0:30 | 1:38 |
| Skip to generate | 0:10 | 1:48 |
| Show output | 0:12 | 2:00 |
| Portfolio link | 0:12 | 2:12 |
| Tech credibility | 0:18 | 2:30 |
| What's next | 0:14 | 2:44 |
| Close | 0:10 | **2:54** |

6 seconds to spare before the 3:00 limit.

---

*Delete this file (`DEMO_SCRIPT.md`) before submitting. Do not commit it to the public repo.*
