/*
 * src/lib/gemini.ts
 *
 * AI generation helper — powered by OpenRouter
 * ─────────────────────────────────────────────
 * SERVER-ONLY. Never import this in a Client Component — it uses
 * GEMINI_API_KEY (now an OpenRouter key) which must stay on the server.
 *
 * WHY OPENROUTER?
 * The Google AI Studio free tier (native Gemini API) has a hard daily cap
 * of 1,500 requests per project. OpenRouter proxies the same Gemini models
 * through an OpenAI-compatible endpoint with per-token pricing and no daily
 * hard cap, so the app never goes dark mid-session.
 *
 * HOW OPENROUTER AUTH WORKS:
 * Pass your key as a standard Bearer token in the Authorization header.
 * The endpoint is OpenAI-compatible: POST /v1/chat/completions
 * Model IDs use the format "provider/model-name" (e.g. "google/gemini-2.5-flash").
 *
 * COST:
 * google/gemini-2.5-flash      → $0.30 / 1M input tokens  (primary)
 * google/gemini-2.5-flash-lite → $0.10 / 1M input tokens  (fallback)
 * A full 7-question interview is ~2,000 tokens ≈ $0.0006 total.
 *
 * API ENDPOINT:
 *   POST https://openrouter.ai/api/v1/chat/completions
 *   Authorization: Bearer <GEMINI_API_KEY>
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// Model fallback chain — try each in order until one succeeds.
// If the primary is rate-limited (429) or unavailable (404), we fall back
// to the lighter model which has its own separate rate limit bucket.
//
// google/gemini-2.5-flash      → best quality, try first
// google/gemini-2.5-flash-lite → cheaper, reliable fallback
export const DEFAULT_MODEL = "google/gemini-2.5-flash";
const MODEL_FALLBACK_CHAIN = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GenerateOptions {
  /** The user's message or a full prompt string */
  prompt: string;
  /**
   * Optional prior conversation turns for multi-turn chat.
   * Each item is a { role, parts } object in Gemini's shape — we convert
   * to OpenAI's { role, content } shape internally before sending.
   */
  history?: GeminiMessage[];
  /** Model to use. Defaults to DEFAULT_MODEL. */
  model?: string;
  /**
   * Max tokens to generate. 1024 is plenty for interview questions.
   * Increase to 2048 for longer case studies.
   */
  maxOutputTokens?: number;
  /**
   * Temperature controls creativity vs. precision.
   * 0.0 = deterministic/factual, 1.0 = creative/varied.
   */
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  /** Finish reason from the API — "stop" means normal completion */
  finishReason: string;
}

// ──────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────

// Convert our GeminiMessage format (role: "model") to OpenAI format (role: "assistant").
// OpenRouter uses the OpenAI convention so "model" must become "assistant".
function toOpenAIMessages(
  history: GeminiMessage[],
  prompt: string
): { role: "user" | "assistant" | "system"; content: string }[] {
  const messages = history.map((m) => ({
    role: (m.role === "model" ? "assistant" : "user") as "user" | "assistant",
    content: m.parts.map((p) => p.text).join(""),
  }));
  messages.push({ role: "user", content: prompt });
  return messages;
}

// ──────────────────────────────────────────────────────────
// Main generate function
// ──────────────────────────────────────────────────────────

export async function generateText(options: GenerateOptions): Promise<GenerateResult> {
  const {
    prompt,
    history = [],
    model,
    maxOutputTokens = 1024,
    temperature = 0.7,
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  const messages = toOpenAIMessages(history, prompt);

  // If the caller specified a model explicitly, use only that (no fallback).
  // Otherwise walk the fallback chain until one succeeds.
  const modelsToTry = model ? [model] : MODEL_FALLBACK_CHAIN;
  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    const response = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter recommends these headers for attribution / rate-limit tiers
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "SkillNarrate",
      },
      body: JSON.stringify({
        model: currentModel,
        messages,
        max_tokens: maxOutputTokens,
        temperature,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const choice = data.choices?.[0];
      const text: string = choice?.message?.content ?? "";
      const finishReason: string = choice?.finish_reason ?? "UNKNOWN";
      return { text, finishReason };
    }

    // 429 = rate-limited → try next model in chain
    // 404 = model not found → try next model in chain
    // Any other error (400, 401, 500) → throw immediately, no point retrying
    const errorBody = await response.text();
    lastError = new Error(`OpenRouter API error ${response.status} (${currentModel}): ${errorBody}`);

    if (response.status !== 429 && response.status !== 404) {
      throw lastError;
    }

    console.warn(
      `[OpenRouter] ${currentModel} returned ${response.status} (${
        response.status === 429 ? "rate limited" : "model not found"
      }), trying next model…`
    );
  }

  // All models exhausted
  throw lastError ?? new Error("All models exhausted or unavailable.");
}
