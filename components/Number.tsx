import React from 'react';

/**
 * Display a numeric stat with a small label and a deliberate scale.
 * Used on the landing hero and audit page header.
 */
export function Stat({
  value,
  label,
  tone = 'ink',
  large = false,
}: {
  value: string;
  label: string;
  tone?: 'ink' | 'signal' | 'ok';
  large?: boolean;
}) {
  const tones = {
    ink: 'text-ink',
    signal: 'text-signal',
    ok: 'text-ok',
  } as const;
  return (
    <div className="flex flex-col gap-1">
      <span className={`${tones[tone]} ${large ? 'text-7xl' : 'text-4xl'} font-display leading-none`} style={{ fontWeight: 580 }}>
        {value}
      </span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}