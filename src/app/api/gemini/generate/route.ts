/*
 * src/app/api/gemini/generate/route.ts
 *
 * POST /api/gemini/generate
 *
 * This is a Next.js Route Handler — it runs on the server only.
 * That's critical because GEMINI_API_KEY must never be sent to the browser.
 *
 * Request body:
 *   {
 *     prompt: string           — the user's message or full prompt
 *     history?: GeminiMessage[] — prior conversation turns (Phase 3+)
 *     model?: string           — override the default model
 *   }
 *
 * Response:
 *   { text: string, finishReason: string }
 *
 * Phase 0 stub — returns a placeholder response so the route exists
 * and the contract is established. Real AI calls arrive in Phase 3.
 */

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt (string) is required" },
        { status: 400 }
      );
    }

    // TODO (Phase 3): Replace this stub with a real Gemini call.
    // Uncomment the lines below and remove the stub return:
    //
    // import { generateText } from "@/lib/gemini";
    // const result = await generateText({ prompt, history: body.history });
    // return NextResponse.json(result);

    return NextResponse.json({
      text: `[Phase 0 stub] You sent: "${prompt}"`,
      finishReason: "STUB",
      model: "gemini-2.0-flash",
      note: "Real AI responses arrive in Phase 3.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
