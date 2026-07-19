/*
 * src/app/api/interview/save/route.ts
 *
 * POST /api/interview/save
 *
 * ── WHAT THIS ROUTE DOES ────────────────────────────────────
 * Called after every Q&A exchange to persist the conversation to
 * the database. This ensures that if the student closes their
 * browser mid-interview, their progress is not lost.
 *
 * It receives the FULL updated conversationHistory (not just the
 * latest entry) and overwrites the raw_interview_answers column.
 * This is a simple "replace the whole array" approach rather than
 * trying to append — simpler and avoids race conditions.
 *
 * ── WHY SAVE AFTER EVERY TURN? ──────────────────────────────
 * We could save only at the end, but interviews can take several
 * minutes. If the page crashes or the student navigates away,
 * they'd lose all their answers. Saving each turn costs one
 * extra DB write (~1ms) but saves a very frustrating UX problem.
 *
 * ── SECURITY ────────────────────────────────────────────────
 * We verify the user owns the project before saving.
 * The .eq("user_id", user.id) filter means RLS prevents any
 * cross-user data writes even if someone crafts a malicious request.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InterviewQA } from "@/types/database";

interface SaveRequestBody {
  projectId: string;
  conversationHistory: InterviewQA[];
}

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Parse body
    const body: SaveRequestBody = await request.json();
    const { projectId, conversationHistory } = body;

    if (!projectId || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: "projectId and conversationHistory are required" },
        { status: 400 }
      );
    }

    // Save to database — update only if user owns the project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("projects")
      .update({ raw_interview_answers: conversationHistory })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[/api/interview/save] DB error:", updateError);
      return NextResponse.json(
        { error: "Failed to save interview progress." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/interview/save] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
