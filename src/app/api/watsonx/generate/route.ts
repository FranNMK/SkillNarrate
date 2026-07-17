/*
 * src/app/api/watsonx/generate/route.ts
 *
 * POST /api/watsonx/generate
 *
 * This is a Next.js Route Handler — it runs on the server (never in the browser).
 * That's important because the watsonx API key must NEVER be exposed to users.
 *
 * Flow:
 *  1. Frontend sends a POST with { prompt, modelId? }
 *  2. This route fetches a short-lived IBM IAM token using the API key
 *  3. It calls the watsonx.ai REST endpoint with that token
 *  4. It streams or returns the generated text back to the frontend
 *
 * In Phase 0 this is a stub that returns a placeholder response.
 * Real implementation lands in Phase 3 (the AI interview engine).
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    // TODO (Phase 3): Replace this stub with a real watsonx.ai call.
    // See src/lib/watsonx.ts for the helper function we'll use.
    return NextResponse.json({
      generated_text: `[Phase 0 stub] You sent: "${prompt}"`,
      model: "ibm/granite-13b-chat-v2",
      note: "Real AI responses arrive in Phase 3.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
