/*
 * src/app/layout.tsx  — Root Layout
 *
 * Every page in the app is wrapped by this component.
 * Think of it as the HTML <head> + <body> shell that never re-renders.
 *
 * In Next.js App Router, every folder can have its own layout.tsx.
 * This root one handles:
 *  - The <html> and <body> tags (only allowed here, not in nested layouts)
 *  - Global CSS import
 *  - Metadata (tab title, description, Open Graph tags)
 *  - Any providers that the whole app needs (we'll add Supabase auth here in Phase 1)
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    // %s is replaced by each page's own title, e.g. "Login | SkillNarrate"
    template: "%s | SkillNarrate",
    default: "SkillNarrate — Build it. Tell it. Own it.",
  },
  description:
    "Turn your technical projects into polished case studies, LinkedIn posts, pitch scripts, and interview answers — guided by AI.",
  keywords: [
    "portfolio",
    "case study",
    "AI writing",
    "TVET",
    "technical students",
    "Gemini AI",
    "Kenya",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/*
         * We'll wrap children with a Supabase session provider in Phase 1.
         * For now, we render children directly.
         */}
        {children}
      </body>
    </html>
  );
}
