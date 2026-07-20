"use client";
// NOTE: Server Actions cannot be imported directly into "use client" files
// that also define UI. We call the complete-interview endpoint via a fetch
// + redirect pattern instead (see EndInterviewButton below).
/*
 * src/components/features/InterviewChat.tsx
 *
 * The interactive chat UI for the AI interview
 * ─────────────────────────────────────────────
 * This is a CLIENT COMPONENT — it uses React state and browser APIs.
 * The parent (interview page) is a Server Component that reads the
 * project from the database and passes it as props here.
 *
 * HOW THE CHAT WORKS (continued after note above):
 *  1. On mount: if there are existing Q&As in the DB (resumed interview),
 *     show them. Otherwise, immediately call /api/interview/ask to get
 *     the first AI question.
 *  2. Student types an answer and clicks Send.
 *  3. We call POST /api/interview/ask with the full conversation history.
 *  4. Gemini returns the next question.
 *  5. We call POST /api/interview/save to persist the updated Q&As.
 *  6. Repeat until student clicks "End Interview" (enabled after min exchanges).
 *
 * MESSAGE DISPLAY:
 * We display the chat as alternating bubbles:
 *   🤖 AI question   (left-aligned, teal background)
 *   👤 Your answer   (right-aligned, white with border)
 *
 * WHY WE SHOW THE QUESTION BEFORE SAVING:
 * We show the AI's question immediately for a snappy UX, then save
 * to the DB in the background. If the save fails we show an error
 * but the user can still continue — the state lives in React until
 * they navigate away.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { OutputType, InterviewQA } from "@/types/database";
import Spinner from "@/components/ui/Spinner";

// ── Types ────────────────────────────────────────────────────
interface InterviewChatProps {
  projectId: string;
  projectTitle: string;
  outputType: OutputType;
  initialHistory: InterviewQA[]; // existing Q&As from DB (empty for new interview)
}

// A "message" in the UI — either an AI question or a student answer
// We track both Q&As (saved to DB) and display messages (shown in chat)
interface ChatMessage {
  role: "ai" | "student";
  text: string;
}

// Human-readable label for each output type (shown in the UI)
const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  case_study: "Case Study",
  linkedin_post: "LinkedIn Post",
  pitch_script: "Pitch Script",
  interview_answer: "Interview Answer",
};

// ──────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────
export default function InterviewChat({
  projectId,
  projectTitle,
  outputType,
  initialHistory,
}: InterviewChatProps) {
  // ── State ──────────────────────────────────────────────────
  // conversationHistory is the "source of truth" that we save to the DB
  const [history, setHistory] = useState<InterviewQA[]>(initialHistory);

  // chatMessages is what we display — built from history + any in-progress message
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    // On first render, convert existing history to display messages
    initialHistory.flatMap((qa) => [
      { role: "ai" as const, text: qa.question },
      { role: "student" as const, text: qa.answer },
    ])
  );

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);   // waiting for AI response
  const [isSaving, setIsSaving] = useState(false);     // saving to DB
  const [error, setError] = useState<string | null>(null);

  // Track whether the "End Interview" button should be shown
  const [canFinish, setCanFinish] = useState(initialHistory.length >= 5);

  // Track the current pending AI question (before the student answers)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  // Ref to scroll to the bottom of the chat after each new message
  const bottomRef = useRef<HTMLDivElement>(null);

  // Track if the opening question has been fetched
  const hasStarted = useRef(initialHistory.length > 0);

  // ── Scroll to bottom on new messages ───────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingQuestion, isLoading]);

  // ── Call the API to get the next question ──────────────────
  const fetchNextQuestion = useCallback(
    async (updatedHistory: InterviewQA[], latestAnswer: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/interview/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            projectTitle,
            outputType,
            conversationHistory: updatedHistory,
            currentAnswer: latestAnswer,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to get next question");
        }

        const data = await response.json();

        // Show the AI's question in the chat
        setPendingQuestion(data.question);
        setMessages((prev) => [...prev, { role: "ai", text: data.question }]);

        // Update whether the student can end the interview
        setCanFinish(data.canFinish);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, projectTitle, outputType]
  );

  // ── Save the conversation to the DB ───────────────────────
  const saveProgress = useCallback(async (updatedHistory: InterviewQA[]) => {
    setIsSaving(true);
    try {
      await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, conversationHistory: updatedHistory }),
      });
    } catch {
      // Non-fatal — user can still continue. Show a subtle warning.
      console.warn("Auto-save failed. Your progress may not be saved.");
    } finally {
      setIsSaving(false);
    }
  }, [projectId]);

  // ── Fetch the opening question on first render (new interview) ──
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      fetchNextQuestion([], "");
    }
  }, [fetchNextQuestion]);

  // ── Handle answer submission ────────────────────────────────
  const handleSendAnswer = async () => {
    const trimmedAnswer = currentAnswer.trim();
    if (!trimmedAnswer || isLoading || !pendingQuestion) return;

    // 1. Add the student's answer to the chat display
    setMessages((prev) => [...prev, { role: "student", text: trimmedAnswer }]);
    setCurrentAnswer("");

    // 2. Build the new history entry
    const newEntry: InterviewQA = {
      question: pendingQuestion,
      answer: trimmedAnswer,
    };
    const updatedHistory = [...history, newEntry];
    setHistory(updatedHistory);
    setPendingQuestion(null);

    // 3. Save to DB (non-blocking — runs in background)
    saveProgress(updatedHistory);

    // 4. Get the next question
    await fetchNextQuestion(updatedHistory, trimmedAnswer);
  };

  // Allow pressing Enter to submit (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Interview context banner ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm"
        style={{ backgroundColor: "var(--color-brand-primary)", color: "#fff" }}
      >
        <span className="text-lg">🎙️</span>
        <div>
          <span className="font-semibold">AI Interview in progress</span>
          <span className="mx-2 opacity-60">·</span>
          <span className="opacity-80">
            Generating: <strong>{OUTPUT_TYPE_LABELS[outputType]}</strong>
          </span>
          <span className="mx-2 opacity-60">·</span>
          <span className="opacity-80">{projectTitle}</span>
        </div>
        {isSaving && (
          <span className="ml-auto text-xs opacity-70 animate-pulse">
            Saving…
          </span>
        )}
      </div>

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 min-h-0"
        style={{ maxHeight: "calc(100vh - 340px)" }}
      >
        {/* Intro message when starting fresh */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-sm text-gray-400 py-8">
            Starting your interview…
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
          >
            {/* AI label */}
            {msg.role === "ai" && (
              <span className="mr-2 mt-1 text-base shrink-0">🤖</span>
            )}

            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "ai"
                  ? "rounded-tl-sm text-white"
                  : "rounded-tr-sm bg-white border border-gray-200 text-gray-800"
              }`}
              style={
                msg.role === "ai"
                  ? { backgroundColor: "var(--color-brand-primary)" }
                  : undefined
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading indicator — AI is "thinking" */}
        {isLoading && (
          <div className="flex justify-start">
            <span className="mr-2 text-base">🤖</span>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm text-white text-sm"
              style={{ backgroundColor: "var(--color-brand-primary)" }}
            >
              <span className="inline-flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-70 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button
              onClick={() => {
                setError(null);
                if (pendingQuestion) fetchNextQuestion(history, "");
              }}
              className="ml-3 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400">
            {history.length > 0
              ? `${history.length} question${history.length !== 1 ? "s" : ""} answered`
              : "Answer the question above to continue"}
          </p>
          {!canFinish && history.length > 0 && (
            <p className="text-xs text-gray-400">
              Answer {Math.max(0, (outputType === "case_study" ? 5 : 4) - history.length)} more to unlock generation
            </p>
          )}
        </div>

        {/* Textarea + send */}
        <div className="flex gap-3 items-end">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !pendingQuestion}
            placeholder={
              isLoading
                ? "Waiting for question…"
                : !pendingQuestion && !isLoading
                ? "Interview starting…"
                : "Type your answer here… (Enter to send, Shift+Enter for new line)"
            }
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm resize-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
            style={{ "--tw-ring-color": "var(--color-brand-primary)" } as React.CSSProperties}
          />
          <button
            onClick={handleSendAnswer}
            disabled={isLoading || !currentAnswer.trim() || !pendingQuestion}
            className="px-4 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
            style={{ backgroundColor: "var(--color-brand-primary)" }}
            aria-label="Send answer"
          >
            {isLoading ? <Spinner size={14} color="#fff" /> : null}
            {isLoading ? "Thinking…" : "Send →"}
          </button>
        </div>

        {/* End Interview button — shown after minimum exchanges */}
        {canFinish && !isLoading && (
          <div className="mt-4 flex items-center gap-3">
            <EndInterviewButton projectId={projectId} history={history} />
            <p className="text-xs text-gray-400">
              You can keep going for more detail, or generate now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── End Interview button ──────────────────────────────────
// Saves progress, marks interview complete via API, then navigates.
// Uses useRouter for client-side navigation after the API call.
function EndInterviewButton({
  projectId,
  history,
}: {
  projectId: string;
  history: InterviewQA[];
}) {
  const router = useRouter();
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const handleEnd = async () => {
    setIsEnding(true);
    setEndError(null);

    try {
      // 1. Save final interview state
      await fetch("/api/interview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, conversationHistory: history }),
      });

      // 2. Mark interview as complete
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to complete interview");
      }

      // 3. Navigate to generate page
      router.push(`/projects/${projectId}/generate`);
    } catch (err) {
      setEndError(err instanceof Error ? err.message : "Something went wrong");
      setIsEnding(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleEnd}
        disabled={isEnding}
        className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        style={{
          backgroundColor: "var(--color-brand-secondary)",
          color: "#1f2937",
        }}
      >
        {isEnding && <Spinner size={14} color="#1f2937" />}
        {isEnding ? "Saving…" : "Generate My Content →"}
      </button>
      {endError && (
        <p className="text-xs text-red-600 mt-1">{endError}</p>
      )}
    </div>
  );
}
