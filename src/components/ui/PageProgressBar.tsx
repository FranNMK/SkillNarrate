"use client";
/*
 * src/components/ui/PageProgressBar.tsx
 *
 * A thin teal bar that appears at the top of the page whenever the user
 * navigates between pages (soft navigations via <Link> or router.push).
 *
 * HOW IT WORKS:
 * Next.js App Router fires navigation events. We listen to route changes
 * via usePathname() — when the pathname changes we play the progress animation.
 * The bar is purely CSS-animated (no JS timers needed beyond a one-shot reset).
 */

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function Bar() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const prev = useRef<string>("");

  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (prev.current && prev.current !== current) {
      // New route — fire the bar
      setActive(false);
      // Tiny timeout so React can re-render the removed bar before we re-add it
      const t = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(t);
    }
    prev.current = current;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!active) return;
    // Auto-remove after animation completes (1.6s)
    const t = setTimeout(() => setActive(false), 1700);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="sn-progress fixed top-0 left-0 h-[3px] z-[9999] pointer-events-none rounded-r-full"
      style={{ backgroundColor: "var(--color-brand-primary)" }}
    />
  );
}

export default function PageProgressBar() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
