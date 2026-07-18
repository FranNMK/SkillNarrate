/*
 * src/app/(marketing)/layout.tsx
 *
 * Shared layout for all public marketing pages: /, /about, /support
 *
 * WHY A ROUTE GROUP "(marketing)"?
 * We need /, /about, and /support to share the Navbar + Footer,
 * but /login, /signup, and /dashboard should NOT have these.
 *
 * A route group (folder in parentheses) shares a layout without
 * affecting the URL. So /about is still /about — not /marketing/about.
 *
 * WAIT — but / is the root page (src/app/page.tsx), not inside this group!
 * True. In Next.js App Router, the ROOT layout (src/app/layout.tsx)
 * wraps ALL pages. We can't put the Navbar there because logged-in pages
 * would also get it.
 *
 * Instead, we put /, /about, /support INSIDE this (marketing) group,
 * keeping them at their correct URLs but giving them the shared layout.
 * The root src/app/page.tsx gets replaced by src/app/(marketing)/page.tsx
 * which Next.js resolves to the same "/" route — both can't exist at once.
 *
 * We already have src/app/page.tsx so we DON'T create another page.tsx here.
 * Instead we use this layout.tsx as a transparent shell for about/ and support/
 * and apply the navbar/footer at a higher level from layout.tsx.
 *
 * SIMPLEST APPROACH: apply Navbar+Footer in the ROOT layout only for
 * marketing pages, detected by path. But that's fragile.
 *
 * CLEANEST APPROACH (what we're doing):
 * - src/app/(marketing)/layout.tsx wraps about/ and support/ with Nav+Footer
 * - src/app/page.tsx (the homepage) imports Navbar/Footer directly
 *   because it needs the full-screen hero without a route group page conflict.
 */

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
