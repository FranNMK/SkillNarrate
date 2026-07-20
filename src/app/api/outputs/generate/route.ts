/*
 * src/app/api/outputs/generate/route.ts
 *
 * POST /api/outputs/generate
 *
 * ── WHAT THIS ROUTE DOES ──────────────────────────────────────
 * After the student completes the interview, this route:
 *
 *  1. Verifies the user is logged in and owns the project
 *  2. Fetches the project's raw_interview_answers and output_type
 *  3. Builds a format-specific synthesis prompt for Gemini
 *     (different prompt for case study vs LinkedIn post vs pitch script, etc.)
 *  4. Calls the Gemini API to generate the content
 *  5. Upserts to the outputs table (insert on first generate, update on regenerate)
 *  6. Returns the generated content + output ID to the client
 *
 * ── REGENERATION ─────────────────────────────────────────────
 * If the student clicks "Regenerate", they can optionally provide a
 * `toneInstruction` (e.g. "make it shorter", "more technical", "casual tone").
 * We append this to the end of the generation prompt and re-call Gemini.
 * We UPSERT the output row (update if exists, insert if not) so the student
 * always has one current version per project.
 *
 * ── WHY UPSERT, NOT ALWAYS INSERT? ───────────────────────────
 * If we inserted a new row every time the student regenerates, they'd
 * accumulate dozens of output rows for the same project. That clutters
 * the portfolio and makes the data model harder to reason about.
 * For now: one output per project (same output_type).
 * In a future "history" feature, we could keep all versions.
 *
 * ── PROMPT ENGINEERING ───────────────────────────────────────
 * The synthesis prompts are format-specific. Each one:
 *  - Tells Gemini what structure to follow
 *  - Includes all the Q&A pairs as context
 *  - Sets the appropriate tone and length
 *  - Instructs Gemini to write in first person (student's voice)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini";
import type { OutputType, InterviewQA } from "@/types/database";

// ── Request body shape ────────────────────────────────────────
interface GenerateRequestBody {
  projectId: string;
  toneInstruction?: string;  // optional: "make it shorter", "more technical", etc.
  outputType?: OutputType;   // optional override — if omitted, uses project's primary type
}

// ── Format-specific synthesis prompts ────────────────────────
// Each returns a complete prompt string given the project info and Q&As.
// The prompt explicitly tells Gemini:
//   1. What structure to use
//   2. The word/length target
//   3. The tone to write in
//   4. That the source material is the Q&A transcript below

function buildSynthesisPrompt(
  outputType: OutputType,
  projectTitle: string,
  qaHistory: InterviewQA[],
  toneInstruction?: string
): string {
  // Convert Q&A pairs into a readable transcript for Gemini to reference
  const transcript = qaHistory
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join("\n\n");

  const basePrompts: Record<OutputType, string> = {

    // ── CASE STUDY ──────────────────────────────────────────
    // A structured professional document. Think portfolio piece or README.
    case_study: `You are a professional technical writer. Based on the interview transcript below about a student's project called "${projectTitle}", write a polished case study.

Structure the case study with these exact sections (use ## headings):
## Project Overview
## Problem Statement
## Solution & Approach
## Technologies Used
## Implementation Highlights
## Results & Impact
## Key Learnings

WRITING RULES:
- Write in first person (the student's voice): "I built...", "My approach was..."
- Be specific — use any numbers, percentages, or outcomes mentioned in the interview
- Keep each section concise but meaningful (2-5 sentences each)
- Technical enough to impress, clear enough for anyone to understand
- Total length: 400–600 words
- Do NOT invent details that weren't in the interview — only use what was shared

INTERVIEW TRANSCRIPT:
${transcript}`,

    // ── LINKEDIN POST ────────────────────────────────────────
    // Short, punchy, engaging. LinkedIn rewards storytelling, not resumes.
    linkedin_post: `You are an expert LinkedIn ghostwriter who specialises in tech and TVET student success stories. Based on the interview transcript below, write a LinkedIn post for the student about their project "${projectTitle}".

STRUCTURE (do NOT use headers — it should flow as natural paragraphs):
1. HOOK (first line) — an attention-grabbing opening that makes people stop scrolling. A bold statement, a question, or a surprising fact.
2. STORY — 2-3 short paragraphs telling what they built, why, and how. Personal and honest.
3. IMPACT — what it achieved, what they learned, why it matters.
4. SKILLS — naturally weave in 3-5 relevant skills (don't just list them — show them in context).
5. CALL TO ACTION — a question to readers, or invitation to connect.

WRITING RULES:
- First person ("I built...", "I learned...")
- Short paragraphs (1-3 sentences max) — LinkedIn readers scan, not read
- Conversational and genuine — not corporate-speak
- Length: 150–250 words (LinkedIn's sweet spot for engagement)
- End with 3-5 relevant hashtags on a new line
- Do NOT add LinkedIn formatting like [P] or [CTA] — just write natural prose

INTERVIEW TRANSCRIPT:
${transcript}`,

    // ── PITCH SCRIPT ────────────────────────────────────────
    // Spoken word — meant to be read aloud. Conversational, energetic.
    pitch_script: `You are a pitch coach who helps TVET students present their technical projects at hackathons and demo days. Based on the interview transcript below, write a 60-90 second pitch script for the student's project "${projectTitle}".

STRUCTURE (label each section):
[HOOK] — One powerful opening sentence that grabs attention. A surprising fact, bold claim, or relatable problem.
[PROBLEM] — The specific problem or gap this project addresses. 1-2 sentences.
[SOLUTION] — What the project does and how it works. Clear, jargon-free. 2-3 sentences.
[DEMO MOMENT] — One specific thing to show or describe that makes it real ("Here's what it looks like...").
[IMPACT] — Who benefits and how much. Any numbers or outcomes from the interview.
[CLOSE] — A memorable closing line. What you're looking for (feedback, collaboration, opportunities).

WRITING RULES:
- Written to be SPOKEN ALOUD — use contractions, natural pauses, and short sentences
- First person, energetic but not over-the-top
- 60-90 seconds at normal speaking pace = approximately 150-200 words
- No technical jargon unless immediately explained
- Each section should feel like a natural continuation, not a list

INTERVIEW TRANSCRIPT:
${transcript}`,

    // ── INTERVIEW ANSWER ─────────────────────────────────────
    // Structured for a job/internship technical interview. STAR method.
    interview_answer: `You are a career coach preparing a TVET student for technical job interviews. Based on the interview transcript below about their project "${projectTitle}", write a polished interview answer using the STAR method.

STRUCTURE (use these exact labels):
**Situation:** Set the context — what was happening, what gap or need existed?
**Task:** What was the student's specific responsibility or goal?
**Action:** What did the student actually DO? (This is the longest section — be specific about technical decisions, tools used, problems solved, and WHY they made certain choices.)
**Result:** What was the outcome? Be concrete — use numbers if available. What did they learn?

WRITING RULES:
- First person, confident but not arrogant
- Show technical depth — name specific technologies and WHY they were chosen
- Show problem-solving — include at least one challenge faced and how it was overcome
- Length: 250-350 words (long enough to be credible, short enough to not lose the interviewer)
- Should feel like something a student could actually say aloud in an interview
- End with a sentence about what this experience taught them or how it shaped their approach

INTERVIEW TRANSCRIPT:
${transcript}`,
  };

  let prompt = basePrompts[outputType];

  // If the student wants a different tone/style on regeneration, append the instruction
  if (toneInstruction?.trim()) {
    prompt += `\n\nADDITIONAL INSTRUCTION: ${toneInstruction.trim()}`;
  }

  return prompt;
}

// ── Token limits per output type ─────────────────────────────
// LinkedIn posts are short; case studies need more room.
const MAX_TOKENS: Record<OutputType, number> = {
  linkedin_post:    512,
  pitch_script:     512,
  interview_answer: 768,
  case_study:      1536,
};

// ──────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ──────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // Step 1 — auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Step 2 — parse request body
    const body: GenerateRequestBody = await request.json();
    const { projectId, toneInstruction } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Step 3 — fetch project (RLS ensures ownership)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project, error: projectError } = await (supabase as any)
      .from("projects")
      .select("id, title, output_type, raw_interview_answers, interview_completed")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.interview_completed) {
      return NextResponse.json(
        { error: "Interview must be completed before generating content." },
        { status: 400 }
      );
    }

    const qaHistory: InterviewQA[] = Array.isArray(project.raw_interview_answers)
      ? project.raw_interview_answers
      : [];

    if (qaHistory.length === 0) {
      return NextResponse.json(
        { error: "No interview answers found. Please complete the interview first." },
        { status: 400 }
      );
    }

    // Step 4 — determine output type
    // If the caller specifies an outputType override (for generating private extras),
    // use that. Otherwise fall back to the project's primary output_type.
    const outputType: OutputType = (body.outputType as OutputType) ?? (project.output_type as OutputType);

    // Step 5 (was 4) — build the synthesis prompt
    const prompt = buildSynthesisPrompt(outputType, project.title, qaHistory, toneInstruction);

    // Step 6 (was 5) — call Gemini/OpenRouter
    // We use a lower temperature (0.6) for generation than for interviews (0.8)
    // because we want consistent, structured output, not creative variation.
    const result = await generateText({
      prompt,
      maxOutputTokens: MAX_TOKENS[outputType] ?? 1024,
      temperature: 0.6,
    });

    const generatedContent = result.text.trim();

    // Step 7 (was 6) — upsert to outputs table
    // We use upsert with onConflict on (project_id, output_type) so that
    // regenerating updates the existing row rather than creating a new one.
    //
    // NOTE: This requires a UNIQUE constraint on (project_id, output_type).
    // We'll add that in a migration below. Without it, we use a manual
    // check-then-insert/update pattern.
    //
    // For safety, we first check if an output already exists for this project+type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingOutput } = await (supabase as any)
      .from("outputs")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("output_type", outputType)
      .single();

    let outputId: string;

    if (existingOutput?.id) {
      // Update existing output
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from("outputs")
        .update({
          content: generatedContent,
          prompt_used: prompt,
          // Reset is_published to false when regenerating — student should review before republishing
          is_published: false,
        })
        .eq("id", existingOutput.id);

      if (updateError) throw new Error(updateError.message);
      outputId = existingOutput.id;
    } else {
      // Insert new output
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newOutput, error: insertError } = await (supabase as any)
        .from("outputs")
        .insert({
          project_id: projectId,
          user_id: user.id,
          output_type: outputType,
          content: generatedContent,
          prompt_used: prompt,
          is_published: false,
        })
        .select("id")
        .single();

      if (insertError || !newOutput) throw new Error(insertError?.message ?? "Failed to save output");
      outputId = newOutput.id;
    }

    return NextResponse.json({
      ok: true,
      outputId,
      content: generatedContent,
      outputType,
    });
  } catch (error) {
    console.error("[/api/outputs/generate] Error:", error);

    const message = error instanceof Error ? error.message : "";
    const isQuota = message.includes("429") || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED");

    return NextResponse.json(
      {
        error: isQuota
          ? "The AI is temporarily unavailable due to usage limits. Please wait 1–2 minutes and try again."
          : (message || "Failed to generate content. Please try again."),
      },
      { status: isQuota ? 429 : 500 }
    );
  }
}
