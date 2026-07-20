/*
 * src/app/api/debug/route.ts
 *
 * GET /api/debug
 *
 * TEMPORARY diagnostic endpoint — reveals exactly what's misconfigured
 * in the production environment WITHOUT exposing secret values.
 *
 * DELETE THIS FILE before sharing the repo publicly or after debugging.
 *
 * It checks:
 *  1. Are all required env vars present? (just checks presence, not values)
 *  2. Can we connect to Supabase and query the projects table?
 *  3. Does the projects table have the output_type column?
 *  4. Can we reach the Gemini API with a minimal test prompt?
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, string> = {};

  // ── 1. Check env vars are present ───────────────────────
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GEMINI_API_KEY",
    "NEXT_PUBLIC_APP_URL",
  ];

  for (const key of requiredEnvVars) {
    const val = process.env[key];
    if (!val) {
      results[key] = "❌ MISSING";
    } else {
      // Show first 6 chars only — enough to confirm it's the right key without exposing it
      results[key] = `✅ set (starts with: ${val.slice(0, 8)}...)`;
    }
  }

  // ── 2. Supabase connectivity + schema check ──────────────
  try {
    const supabase = await createClient();

    // Check if projects table exists and has output_type column
    const { data, error } = await supabase
      .from("projects")
      .select("id, output_type")
      .limit(1);

    if (error) {
      // Distinguish between "column doesn't exist" and other errors
      if (error.message.includes("output_type")) {
        results["supabase_projects_table"] =
          "❌ output_type column MISSING — run migration 20240101000004_add_project_output_type.sql in Supabase SQL Editor";
      } else if (error.message.includes("does not exist")) {
        results["supabase_projects_table"] =
          "❌ projects table missing — run all migrations in order";
      } else {
        results["supabase_projects_table"] = `❌ Query error: ${error.message}`;
      }
    } else {
      results["supabase_projects_table"] =
        `✅ OK — output_type column present, returned ${data?.length ?? 0} rows`;
    }
  } catch (err) {
    results["supabase_projects_table"] =
      `❌ Exception: ${err instanceof Error ? err.message : String(err)}`;
  }

  // ── 3. Gemini API test ────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    results["gemini_api_test"] = "❌ Skipped — GEMINI_API_KEY not set";
  } else {
    // Check key format first
    if (!apiKey.startsWith("AIza")) {
      results["gemini_api_key_format"] =
        `⚠️ Key starts with "${apiKey.slice(0, 6)}" — expected "AIzaSy". May be invalid. Get key from https://aistudio.google.com/app/apikey`;
    } else {
      results["gemini_api_key_format"] = "✅ Key format looks correct (starts with AIza)";
    }

    // Try a minimal Gemini call with the cheapest possible prompt
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Reply with one word: hello" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(empty)";
          results[`gemini_${model}`] = `✅ OK — responded: "${text.trim()}"`;
          break; // one model working is enough
        } else {
          const body = await res.json().catch(() => ({}));
          const msg = body?.error?.message ?? `HTTP ${res.status}`;
          results[`gemini_${model}`] = `❌ ${res.status}: ${msg.slice(0, 120)}`;
        }
      } catch (err) {
        results[`gemini_${model}`] =
          `❌ Exception: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
  }

  // ── 4. Auth session check ─────────────────────────────────
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    results["auth_session"] = user
      ? `✅ Logged in as ${user.email}`
      : "ℹ️ Not logged in (expected for this endpoint — auth works)";
  } catch (err) {
    results["auth_session"] =
      `❌ Auth error: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    checks: results,
  }, { status: 200 });
}
