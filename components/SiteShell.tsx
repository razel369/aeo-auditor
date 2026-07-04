'use client';

import { usePathname } from 'next/navigation';
import { StickyAction } from './StickyAction';

const STICKY_TEXT = 'Want to see your AI citation gap? Free, 90 seconds, no signup.';
const STICKY_EXCLUDE = [
  '/contact',
  '/onboarding/welcome',
  '/onboarding/baseline',
  '/audit/new',
];

/**
 * SiteShell wraps the entire site. Renders the persistent sticky-action bar
 * everywhere except conversion pages. The page-level components (SiteHeader,
 * LinearTrail, NextStep, SiteFooter) live inside each page so they can be
 * styled per-page (e.g. inverted on dark hero).
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  return (
    <>
      {children}
      <StickyAction text={STICKY_TEXT} href="/audit" ctaLabel="Run audit" excludeOn={STICKY_EXCLUDE} />
    </>
  );
}