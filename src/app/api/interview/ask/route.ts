/*
 * src/app/api/interview/ask/route.ts
 *
 * POST /api/interview/ask
 *
 * ── WHAT THIS ROUTE DOES ────────────────────────────────────
 * This is the heart of the AI interview. Every time the student
 * types an answer, the frontend calls this route. We:
 *
 *  1. Verify the student is logged in (server-side session check)
 *  2. Verify they own the project (RLS handles this too, but we
 *     check explicitly so we can give a clear error message)
 *  3. Build a prompt that:
 *       a) Sets the AI's persona and goal (system context)
 *       b) Passes the entire conversation history so Gemini
 *          "remembers" what was said before
 *       c) Tells Gemini the student's latest answer
 *       d) Instructs Gemini to ask ONE adaptive follow-up question
 *  4. Call the Gemini API
 *  5. Return the AI's next question
 *
 * ── HOW GEMINI CONVERSATION HISTORY WORKS ───────────────────
 * Gemini is "stateless" — it doesn't remember previous calls.
 * To make it feel conversational, we send the FULL chat history
 * on every request, structured as alternating user/model turns:
 *
 *   [ { role: "user",  parts: [{ text: "Q1 answer..." }] },
 *     { role: "model", parts: [{ text: "Q2 question..." }] },
 *     { role: "user",  parts: [{ text: "Q2 answer..." }] },
 *     ...current answer appended by generateText()... ]
 *
 * This is the standard pattern for stateless LLM conversations.
 * The trade-off: each request gets larger as the conversation grows.
 * For a 7-question interview, this is well within Gemini's context limit.
 *
 * ── WHY SERVER-SIDE ONLY ────────────────────────────────────
 * GEMINI_API_KEY must never be sent to the browser. If it were,
 * anyone could open DevTools and steal your API key. By putting
 * the Gemini call in a Route Handler (server-only), the key stays
 * on the server and the browser only sees the text response.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText, type GeminiMessage } from "@/lib/gemini";
import type { OutputType, InterviewQA } from "@/types/database";

// ── Types for the request body ────────────────────────────
interface AskRequestBody {
  projectId: string;
  projectTitle: string;
  outputType: OutputType;
  conversationHistory: InterviewQA[]; // the Q&As so far
  currentAnswer: string;              // the student's latest answer
}

// ── How many Q&As before we allow "end interview" ────────
// We use a tiered minimum: shorter for LinkedIn (3), longer for case study (5).
// But the AI can always ask more if needed — this is just the minimum.
const MIN_EXCHANGES: Record<OutputType, number> = {
  linkedin_post:     3,
  pitch_script:      4,
  interview_answer:  4,
  case_study:        5,
};

// ── System prompt per output type ────────────────────────
// The system prompt sets the AI's persona and goal. It:
//   - Tells Gemini it's an interviewer, not a chatbot
//   - Explains what the final output will be (so questions are relevant)
//   - Instructs it to adapt based on previous answers
//   - Keeps questions focused and single (not a list)
function buildSystemPrompt(outputType: OutputType, projectTitle: string): string {
  const outputContext: Record<OutputType, string> = {
    case_study: `a professional case study with sections for: Project Overview, Problem Statement, Solution & Implementation, Technologies Used, Results & Impact, and Key Learnings. Ask questions that reveal depth of thinking, technical decisions, and measurable outcomes.`,
    linkedin_post: `an engaging LinkedIn post that showcases the student's skills and achievement. Focus on: what they built, the impact it has, the skills they demonstrated, and why it matters to their career. Keep questions conversational and achievement-focused.`,
    pitch_script: `a 60-90 second verbal pitch for a hackathon or demo. Focus on: the problem being solved, the solution, how it works, what makes it unique, and the ask or next step. Questions should draw out clarity and passion.`,
    interview_answer: `a polished STAR-format answer (Situation, Task, Action, Result) for a technical job interview. Focus on: the context/challenge, the student's specific role and decisions, the technical approach taken, and the concrete results or learnings.`,
  };

  return `You are an expert career coach interviewing a Kenyan TVET (Technical and Vocational Education and Training) student about their technical project called "${projectTitle}".

Your goal is to gather enough information to write ${outputContext[outputType]}

RULES:
- Ask exactly ONE question per turn. Never ask multiple questions at once.
- Make each question relevant to what the student just told you — don't follow a fixed script.
- If an answer is vague, ask for more specific details (numbers, names, examples).
- If an answer mentions something interesting, follow up on it before moving on.
- Keep your question clear and encouraging — this student may not be used to talking about their work professionally.
- Do NOT explain what you're doing — just ask the next natural question.
- Do NOT say "Great answer!" or "Thank you" — get straight to the question.
- Questions should be specific to a TVET student (they may have built hardware, software, or mixed systems; they may have limited resources).`;
}

// ── Build the first question (opening message) ────────────
// This is called when conversationHistory is empty.
function buildOpeningPrompt(outputType: OutputType, projectTitle: string): string {
  const openers: Record<OutputType, string> = {
    case_study: `Start the interview by asking the student to describe the problem or need that their project "${projectTitle}" was designed to solve. Be specific and encouraging.`,
    linkedin_post: `Start the interview by asking what achievement or skill the student is most proud of in their project "${projectTitle}". Make it feel like a friendly conversation.`,
    pitch_script: `Start the interview by asking the student to describe in one sentence what problem their project "${projectTitle}" solves and who it helps.`,
    interview_answer: `Start the interview by asking the student to describe the context and challenge they faced that led them to build "${projectTitle}".`,
  };
  return openers[outputType];
}

// ── Convert our InterviewQA format to Gemini's history format ─
// Gemini expects alternating user/model turns. Our QA pairs map as:
//   question (from AI)  → role: "model"
//   answer (from user)  → role: "user"
function buildGeminiHistory(history: InterviewQA[]): GeminiMessage[] {
  const messages: GeminiMessage[] = [];
  for (const qa of history) {
    // The AI asked a question
    messages.push({ role: "model", parts: [{ text: qa.question }] });
    // The student answered
    messages.push({ role: "user", parts: [{ text: qa.answer }] });
  }
  return messages;
}

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
    const body: AskRequestBody = await request.json();
    const { projectId, projectTitle, outputType, conversationHistory, currentAnswer } = body;

    if (!projectId || !projectTitle || !outputType) {
      return NextResponse.json(
        { error: "projectId, projectTitle, and outputType are required" },
        { status: 400 }
      );
    }

    // Step 3 — verify the project belongs to this user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project, error: projectError } = await (supabase as any)
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Step 4 — build the Gemini prompt
    const systemPrompt = buildSystemPrompt(outputType, projectTitle);
    const isFirstQuestion = !conversationHistory || conversationHistory.length === 0;

    let prompt: string;
    let history: GeminiMessage[];

    if (isFirstQuestion) {
      // No prior answers yet — generate the opening question
      prompt = buildOpeningPrompt(outputType, projectTitle);
      history = [];
    } else {
      // We have prior answers — ask an adaptive follow-up
      // The history contains all prior Q&As; currentAnswer is the latest response
      history = buildGeminiHistory(conversationHistory);
      prompt = `The student just answered: "${currentAnswer}"

Based on everything they've told you so far, ask the single most useful follow-up question that will help you write the ${outputType.replace(/_/g, " ")} for their project.`;
    }

    // Step 5 — call Gemini
    // We prepend the system prompt as the first user message because Gemini
    // doesn't have a dedicated "system" role like OpenAI's API.
    // This is the standard pattern for Gemini system instructions.
    const systemMessage: GeminiMessage = {
      role: "user",
      parts: [{ text: systemPrompt }],
    };
    const systemAck: GeminiMessage = {
      role: "model",
      parts: [{ text: "Understood. I will interview the student and ask one focused question at a time." }],
    };

    const result = await generateText({
      prompt,
      history: isFirstQuestion ? [systemMessage, systemAck] : [systemMessage, systemAck, ...history],
      maxOutputTokens: 256, // Questions should be short — 256 tokens is plenty
      temperature: 0.8,     // Slightly creative so questions feel varied, not robotic
    });

    // Step 6 — also return how many exchanges have happened and the minimum
    // so the frontend knows whether to show the "End Interview" button
    const exchangeCount = conversationHistory?.length ?? 0;
    const minExchanges = MIN_EXCHANGES[outputType] ?? 4;

    return NextResponse.json({
      question: result.text.trim(),
      exchangeCount,
      minExchanges,
      canFinish: exchangeCount >= minExchanges,
    });
  } catch (error) {
    console.error("[/api/interview/ask] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate question. Please try again." },
      { status: 500 }
    );
  }
}
