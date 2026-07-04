'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Step {
  n: number;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
}

const STEPS: Step[] = [
  { n: 1, label: 'See the gap', href: '/audit', match: (p) => p.startsWith('/audit') },
  { n: 2, label: 'See our work', href: '/case-study/aeo-auditor', match: (p) => p.startsWith('/case-study') },
  { n: 3, label: 'See the offer', href: '/services', match: (p) => p.startsWith('/services') },
  { n: 4, label: 'Read the memo', href: '/sales', match: (p) => p.startsWith('/sales') },
  { n: 5, label: 'Talk to us', href: '/contact', match: (p) => p.startsWith('/contact') || p.startsWith('/onboarding') },
  { n: 6, label: 'Get started', href: '/onboarding/welcome', match: (p) => p === '/onboarding/welcome' || p === '/onboarding/baseline' },
];

interface Props {
  inverted?: boolean;
}

/**
 * A linear breadcrumb of the site's 5-step primary path.
 * Each step is a real link. The current step is highlighted. Done steps
 * show in signal color. Shows the visitor exactly where they are.
 *
 * Hidden on the homepage (the trail starts there) and on /about (a side
 * reference page, not on the primary path).
 */
export function LinearTrail({ inverted = false }: Props) {
  const pathname = usePathname() ?? '/';

  // Skip on pages that are not on the primary path.
  if (pathname === '/' || pathname.startsWith('/about')) return null;

  const currentIndex = STEPS.findIndex((s) => s.match(pathname));
  if (currentIndex < 0) return null;

  const ink = inverted ? 'text-paper' : 'text-ink';
  const muted = inverted ? 'text-paper/50' : 'text-muted';
  const rule = inverted ? 'border-paper/20' : 'border-rule';

  return (
    <nav aria-label="Reading path" className={`border-b ${rule}`}>
      <div className="max-w-8xl mx-auto px-8 py-3">
        <ol className="flex items-center gap-3 text-xs font-data overflow-x-auto whitespace-nowrap">
          <li className={`eyebrow ${muted} mr-2`}>Your reading path</li>
          {STEPS.map((step, i) => {
            const isCurrent = i === currentIndex;
            const isDone = i < currentIndex;
            return (
              <li key={step.n} className="flex items-center gap-3">
                <Link
                  href={step.href}
                  className={`flex items-baseline gap-1.5 transition-colors ${
                    isCurrent ? ink : `${muted} hover:${ink}`
                  }`}
                >
                  <span className={`font-data ${isDone ? 'text-signal' : ''}`}>
                    {String(step.n).padStart(2, '0')}
                  </span>
                  <span className={`uppercase tracking-eyebrow ${isCurrent ? 'font-medium' : ''}`}>
                    {step.label}
                  </span>
                </Link>
                {i < STEPS.length - 1 && (
                  <span className={`font-data ${muted}`}>·</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}