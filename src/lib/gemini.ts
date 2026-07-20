/*
 * src/lib/gemini.ts
 *
 * Google Gemini API helper
 * ─────────────────────────
 * SERVER-ONLY. Never import this in a Client Component — it uses
 * GEMINI_API_KEY which must stay on the server.
 *
 * HOW GEMINI AUTH WORKS (much simpler than IBM IAM):
 * Unlike watsonx.ai which requires fetching a short-lived bearer token first,
 * Google Gemini uses a single long-lived API key passed as a query parameter
 * or in the Authorization header on every request. That's it — no token exchange.
 *
 * API ENDPOINT PATTERN:
 *   POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
 *
 * We default to "gemini-2.0-flash" which is:
 *  - Fast (optimised for low latency)
 *  - Free tier available on Google AI Studio
 *  - Great for conversational tasks like our interview engine
 *
 * If gemini-2.0-flash isn't available on your key, fall back to "gemini-1.5-flash".
 * Both behave identically for our use case.
 */

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Model fallback chain — we try each in order until one succeeds.
// WHY A FALLBACK CHAIN?
// Google's free tier quotas are per-model, not shared. If gemini-2.0-flash
// exhausts its daily limit (15 RPM / 1500 RPD on free tier), gemini-2.0-flash-lite
// has its own separate quota. Trying both means a 429 on one model does NOT
// break the whole app — we silently retry on the next model.
//
// gemini-2.0-flash      → fastest, most capable, try first
// gemini-2.0-flash-lite → lighter sibling with its own separate quota; confirmed
//                          present on the key via the ListModels API (gemini-1.5-flash
//                          is no longer available on v1beta and returns 404).
export const DEFAULT_MODEL = "gemini-2.0-flash";
const MODEL_FALLBACK_CHAIN = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

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
   * Each item is a { role, parts } object following the Gemini API shape.
   * We'll use this in Phase 3 for the conversational interview.
   */
  history?: GeminiMessage[];
  /** Gemini model to use. Defaults to DEFAULT_MODEL. */
  model?: string;
  /**
   * Max tokens to generate. Gemini calls these "maxOutputTokens".
   * 1024 is plenty for a LinkedIn post or interview answer.
   * Increase to 2048 for longer case studies.
   */
  maxOutputTokens?: number;
  /**
   * Temperature controls creativity vs. precision.
   * 0.0 = deterministic/factual, 1.0 = creative/varied.
   * 0.7 is a good default for our use case.
   */
  temperature?: number;
}

export interface GenerateResult {
  text: string;
  /** Finish reason from the API — "STOP" means normal completion */
  finishReason: string;
}

// ──────────────────────────────────────────────────────────
// Main generate function
// ──────────────────────────────────────────────────────────

export async function generateText(options: GenerateOptions): Promise<GenerateResult> {
  const {
    prompt,
    history = [],
    model,                    // if caller specifies a model, use only that
    maxOutputTokens = 1024,
    temperature = 0.7,
  } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  // Build the contents array.
  // Gemini's API represents conversation as an array of { role, parts } objects.
  // We append the current user prompt at the end of any existing history.
  const contents: GeminiMessage[] = [
    ...history,
    { role: "user", parts: [{ text: prompt }] },
  ];

  // Decide which models to try.
  // If the caller specified a model explicitly, use only that (no fallback).
  // Otherwise, walk the fallback chain until one succeeds.
  const modelsToTry = model ? [model] : MODEL_FALLBACK_CHAIN;
  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    const url = `${GEMINI_BASE_URL}/${currentModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens,
          temperature,
          candidateCount: 1,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Gemini returns: data.candidates[0].content.parts[0].text
      const candidate = data.candidates?.[0];
      const text: string = candidate?.content?.parts?.[0]?.text ?? "";
      const finishReason: string = candidate?.finishReason ?? "UNKNOWN";
      return { text, finishReason };
    }

    // 429 = rate-limited / quota exhausted → try next model in chain
    // 404 = model not found (wrong model id for this API version) → try next model in chain
    // Any other error (400, 403, 500) → don't bother retrying, throw immediately
    const errorBody = await response.text();
    lastError = new Error(`Gemini API error ${response.status} (${currentModel}): ${errorBody}`);

    if (response.status !== 429 && response.status !== 404) {
      throw lastError;
    }

    // Log the transient error and try the next model
    console.warn(`[Gemini] ${currentModel} returned ${response.status} (${response.status === 429 ? "quota exhausted" : "model not found"}), trying next model…`);
  }

  // All models exhausted
  throw lastError ?? new Error("All Gemini models exhausted or unavailable.");
}
