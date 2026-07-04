import Link from 'next/link';
import React from 'react';

/**
 * The AEO Auditor wordmark.
 *
 * A small mark — "æ" set in Fraunces opsz 144 — sits next to "AEO AUDITOR"
 * set in Inter 500, all-caps, with a deliberately wide letter-spacing.
 * It's a printed stamp, not a tech logo.
 */
export function Wordmark({ size = 'md', asLink = true }: { size?: 'sm' | 'md' | 'lg'; asLink?: boolean }) {
  const marks = {
    sm: { ae: 'text-2xl', label: 'text-[10px]' },
    md: { ae: 'text-[34px]', label: 'text-[11px]' },
    lg: { ae: 'text-5xl', label: 'text-sm' },
  } as const;
  const s = marks[size];

  const inner = (
    <span className="inline-flex items-baseline gap-2 select-none">
      <span
        className={`${s.ae} font-display`}
        style={{ lineHeight: 0.9, fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1" }}
        aria-hidden
      >
        æ
      </span>
      <span
        className={`${s.label} uppercase tracking-eyebrow font-medium text-ink`}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        AEO Auditor
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
      {inner}
    </Link>
  );
}