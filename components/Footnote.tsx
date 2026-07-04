import React from 'react';

/** A footnote reference rendered as a superscript number (set in mono). */
export function Footnote({ index }: { index: number }) {
  return (
    <sup className="text-signal font-data text-[0.65em] ml-0.5 cursor-help" title={`See footnote ${index}`}>
      [{index}]
    </sup>
  );
}

/** A footnote block at the bottom of a page. */
export function FootnoteBlock({ items }: { items: { index: number; text: string; href?: string }[] }) {
  return (
    <ol className="border-t border-rule pt-6 mt-10 space-y-2 text-xs text-muted">
      {items.map((f) => (
        <li key={f.index} className="flex gap-3">
          <span className="font-data text-signal">[{f.index}]</span>
          <span>
            {f.text}
            {f.href && (
              <>
                {' '}
                <a href={f.href} className="underline hover:text-ink">
                  {f.href}
                </a>
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}