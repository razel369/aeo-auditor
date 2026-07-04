'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
  /** The headline copy in the sticky bar. */
  text: string;
  /** CTA href. */
  href: string;
  /** CTA label. */
  ctaLabel: string;
  /** Pages where the bar should NOT appear. Match by path prefix. */
  excludeOn?: string[];
}

/**
 * A persistent thin bar that appears after the visitor scrolls past 600px.
 * Surfaces ONE action — the same primary action across the site so the
 * visitor always knows what to do next.
 *
 * Hidden on conversion pages (/contact, /audit/new, /onboarding/welcome, /onboarding/baseline)
 * because those pages already have a single primary action.
 */
export function StickyAction({ text, href, ctaLabel, excludeOn = [] }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (excludeOn.some((p) => path === p || path.startsWith(p + '/'))) return;

    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [excludeOn]);

  return (
    <div
      role="region"
      aria-label="Primary action"
      className={`fixed top-0 left-0 right-0 z-50 bg-ink text-paper border-b border-ink transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-8xl mx-auto px-8 py-3 flex items-center justify-between gap-6">
        <p className="text-sm font-display truncate" style={{ fontWeight: 500 }}>
          {text}
        </p>
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2 bg-paper text-ink uppercase tracking-eyebrow text-xs hover:bg-signal hover:text-paper transition-colors"
        >
          {ctaLabel}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}