import Link from 'next/link';
import React from 'react';
import { Wordmark } from './Wordmark';

/**
 * Page header. Sits above every page.
 * Positioning has shifted from "audit tool" to "AI citation agency".
 */
export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Wordmark size="md" />
          <span className="hidden md:inline text-xs text-muted italic font-display">
            The AI citation agency
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/services" className="text-ink hover:text-signal transition-colors font-medium">How we work</Link>
          <Link href="/audit" className="text-ink hover:text-signal transition-colors">Free audit</Link>
          <Link href="/case-study/aeo-auditor" className="text-ink hover:text-signal transition-colors">Case study</Link>
          <Link href="/sales" className="text-ink hover:text-signal transition-colors">For CMOs</Link>
        </nav>
      </div>
    </header>
  );
}