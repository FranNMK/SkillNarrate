/*
 * src/lib/watsonx.ts
 *
 * IBM watsonx.ai REST API helper
 * ────────────────────────────────
 * This file is SERVER-ONLY. Never import it in a Client Component.
 * (If you accidentally do, TypeScript will warn you because we use
 *  server-only environment variables like WATSONX_API_KEY here.)
 *
 * HOW WATSONX.AI AUTH WORKS:
 * IBM uses short-lived "bearer tokens" for API access — similar to how
 * OAuth works. The flow is:
 *
 *  1. You have a long-lived API key (stored in env vars, never expires)
 *  2. Before calling the model, you POST to IBM's IAM service with that key
 *  3. IAM returns a bearer token that's valid for ~1 hour
 *  4. You include that bearer token in every watsonx.ai API call
 *
 * In Phase 3 we'll add token caching so we don't fetch a new one every request.
 */

const IAM_TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";

// Default model — IBM Granite chat model, optimised for instruction following
export const DEFAULT_MODEL_ID = "ibm/granite-13b-chat-v2";

// ──────────────────────────────────────────────────────────
// Step 1: Get a short-lived IBM IAM bearer token
// ──────────────────────────────────────────────────────────
export async function getIAMToken(): Promise<string> {
  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey) throw new Error("WATSONX_API_KEY environment variable is not set");

  const response = await fetch(IAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: apiKey,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get IAM token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

// ──────────────────────────────────────────────────────────
// Step 2: Call the watsonx.ai text generation endpoint
// ──────────────────────────────────────────────────────────
export interface GenerateOptions {
  prompt: string;
  modelId?: string;
  maxNewTokens?: number;
  temperature?: number;
}

export interface GenerateResult {
  generated_text: string;
  stop_reason: string;
}

export async function generateText(
  options: GenerateOptions
): Promise<GenerateResult> {
  const { prompt, modelId = DEFAULT_MODEL_ID, maxNewTokens = 800, temperature = 0.7 } =
    options;

  const projectId = process.env.WATSONX_PROJECT_ID;
  const baseUrl = process.env.WATSONX_BASE_URL;

  if (!projectId) throw new Error("WATSONX_PROJECT_ID environment variable is not set");
  if (!baseUrl) throw new Error("WATSONX_BASE_URL environment variable is not set");

  const token = await getIAMToken();

  // watsonx.ai REST API endpoint for text generation
  const url = `${baseUrl}/ml/v1/text/generation?version=2023-05-29`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model_id: modelId,
      project_id: projectId,
      input: prompt,
      parameters: {
        decoding_method: "sample",
        max_new_tokens: maxNewTokens,
        temperature,
        repetition_penalty: 1.1,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`watsonx.ai API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  // The API returns an array of results; we take the first one
  return data.results[0] as GenerateResult;
}
