import Link from 'next/link';

interface Props {
  /** Where the visitor just was, conceptually. */
  cameFrom: string;
  /** What's the single next move we want them to make. */
  nextLabel: string;
  nextHref: string;
  /** Optional: a less-commitment alternative path. */
  altLabel?: string;
  altHref?: string;
  /** Optional: pitch line under the main CTA. */
  pitch?: string;
  /** Whether to invert colors (use on dark backgrounds). */
  inverted?: boolean;
}

/**
 * A persistent "what to do next" panel that lives at the bottom of every page.
 * Single primary action, optional secondary, zero tertiary noise.
 *
 * The whole site's IA collapses to one question this component answers:
 * "You're here because X. Here's what to do next. Here's the button."
 */
export function NextStep({
  cameFrom,
  nextLabel,
  nextHref,
  altLabel,
  altHref,
  pitch,
  inverted = false,
}: Props) {
  const baseBg = inverted ? 'bg-ink text-paper' : 'bg-cream';
  const eyebrow = inverted ? 'text-paper/60' : 'text-muted';
  const pitch2 = inverted ? 'text-paper/80' : 'text-ink';
  const altLink = inverted ? 'text-paper underline decoration-paper/30 underline-offset-4 hover:decoration-paper' : 'text-ink underline decoration-rule underline-offset-4 hover:decoration-signal';

  return (
    <section className={`border-y ${inverted ? 'border-ink' : 'border-rule'} ${baseBg}`}>
      <div className="max-w-8xl mx-auto px-8 py-16">
        <div className="grid grid-cols-12 gap-x-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className={`eyebrow mb-4 ${eyebrow}`}>Your next step</p>
            <h2
              className="font-display text-headline mb-4"
              style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144" }}
            >
              {cameFrom}
            </h2>
            {pitch && <p className={`text-lg max-w-2xl mb-8 ${pitch2}`}>{pitch}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={nextHref}
                className={`inline-flex items-center gap-3 px-8 py-4 uppercase tracking-eyebrow text-sm transition-colors ${
                  inverted
                    ? 'bg-paper text-ink hover:bg-signal hover:text-paper'
                    : 'bg-ink text-paper hover:bg-signal'
                }`}
              >
                {nextLabel}
                <span aria-hidden>→</span>
              </Link>
              {altLabel && altHref && (
                <Link href={altHref} className={`text-sm ${altLink}`}>
                  {altLabel}
                </Link>
              )}
            </div>
          </div>

          <aside className={`col-span-12 md:col-span-4 md:pl-8 mt-10 md:mt-0 md:border-l ${inverted ? 'border-paper/20' : 'border-rule'}`}>
            <p className={`eyebrow mb-4 ${eyebrow}`}>Or skip ahead</p>
            <ul className={`space-y-3 text-sm ${pitch2}`}>
              <li>
                <Link href="/audit" className="hover:underline underline-offset-4">
                  Run a free audit →
                </Link>
              </li>
              <li>
                <Link href="/case-study/aeo-auditor" className="hover:underline underline-offset-4">
                  Watch us dogfood →
                </Link>
              </li>
              <li>
                <Link href="/sales" className="hover:underline underline-offset-4">
                  Read the CMO memo →
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}