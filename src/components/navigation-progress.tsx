"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        target.getAttribute("target") === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (href !== currentUrl) {
        startTransition(() => {
          setLoading(true);
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-0.5 bg-primary animate-pulse w-full shadow-[0_0_8px_rgba(62,207,142,0.8)]" />
    </div>
  );
}
