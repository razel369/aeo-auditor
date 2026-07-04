import Link from 'next/link';
import React from 'react';
import { Wordmark } from './Wordmark';

/**
 * Page header. Sits above every page.
 * Rule (hairline) below it. Looks like a newspaper masthead.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="max-w-8xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Wordmark size="md" />
          <span className="hidden md:inline text-xs text-muted italic font-display">
            The Field Report for AI visibility
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-ink hover:text-signal transition-colors">
            Audit
          </Link>
          <Link href="/pricing" className="text-ink hover:text-signal transition-colors">
            Pricing
          </Link>
          <Link href="/sales" className="text-ink hover:text-signal transition-colors">
            For CMOs
          </Link>
          <Link href="/about" className="text-ink hover:text-signal transition-colors">
            Method
          </Link>
        </nav>
      </div>
    </header>
  );
}