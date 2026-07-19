/*
 * src/app/api/interview/complete/route.ts
 *
 * POST /api/interview/complete
 *
 * Marks an interview as complete by setting interview_completed = true.
 * Called from the client-side "End Interview" button, which can't call
 * Server Actions directly. After this succeeds, the client navigates
 * to /projects/[id]/generate.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("projects")
      .update({ interview_completed: true })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/interview/complete] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
