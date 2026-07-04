import React from 'react';

/**
 * Footer: a small colophon — name, status, last-complied date.
 * Treats the project as a publication.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-rule mt-24">
      <div className="max-w-8xl mx-auto px-8 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-sm text-ink">
            AEO Auditor — built like a magazine, priced like a SaaS, run by people who think SEO is dying.
          </p>
          <p className="text-xs text-muted mt-2 font-data">
            v0.1 · Compiled {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Light mode is the only mode
          </p>
        </div>
        <div className="text-xs text-muted font-data flex flex-col md:items-end gap-1">
          <span>Engines: simulated in v0.1</span>
          <span>Production-mode swap: env.ENGINE_MODE=production</span>
        </div>
      </div>
    </footer>
  );
}