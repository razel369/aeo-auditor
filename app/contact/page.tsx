import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { submitContactForm } from './page-actions';

export const metadata: Metadata = {
  title: 'Talk to us · AEO Auditor',
  description:
    'Book a 30-minute call. We will run your free audit live on the call, walk through the citation gap, and tell you which tier actually fits.',
};

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const errorMessage = searchParams?.error
    ? searchParams.error === 'invalid-email'
      ? 'That email looks off. Mind checking it?'
      : 'Name and email are both required.'
    : null;

  return (
    <main>
      <SiteHeader />

      {/* ─── MASTHEAD ─────────────────────────────────────────── */}
      <section className="border-b border-ink">
        <div className="max-w-8xl mx-auto px-8 py-16">
          <p className="eyebrow mb-4">Contact · Get on the calendar</p>
          <h1
            className="font-display text-display text-ink mb-6 max-w-5xl"
            style={{ fontWeight: 580, fontVariationSettings: "'opsz' 144, 'SOFT' 30" }}
          >
            Talk to us. <span className="italic">Bring your brand.</span>
          </h1>
          <p className="text-ink max-w-2xl leading-relaxed text-lg">
            We will run your free audit live on the call, walk you through the
            citation gap, and tell you honestly which of our tiers — if any — is
            the right move. If we are not the right fit, we will tell you that too.
          </p>
        </div>
      </section>

      {/* ─── TWO COL: form on left, expectations on right ─────── */}
      <section className="border-b border-rule">
        <div className="max-w-8xl mx-auto px-8 py-20">
          {errorMessage && (
            <div className="mb-10 border border-signal bg-paper px-6 py-4 text-sm text-ink">
              <p className="eyebrow text-signal mb-1">Form error</p>
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-12 gap-x-12">
            {/* form */}
            <div className="col-span-12 md:col-span-7">
              <form action={submitContactForm} className="space-y-7">
                <input type="hidden" name="source" value="contact-form" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <Field name="name" label="Name" required placeholder="Avi Cohen" />
                  <Field name="email" label="Work email" type="email" required placeholder="avi@yourcompany.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  <Field name="company" label="Company" placeholder="Yourcompany Inc." />
                  <div>
                    <label className="eyebrow block mb-2">ARR band</label>
                    <select
                      name="arrBand"
                      defaultValue="$1-5M"
                      className="w-full bg-paper border border-rule px-4 py-3 font-display text-lg focus:outline-none focus:border-ink"
                      style={{ fontWeight: 500 }}
                    >
                      <option value="<1M">Under $1M</option>
                      <option value="$1-5M">$1M – $5M</option>
                      <option value="$5-20M">$5M – $20M</option>
                      <option value="$20-50M">$20M – $50M</option>
                      <option value=">50M">Over $50M</option>
                      <option value="not-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-2">What is going on?</label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="We noticed organic traffic falling off a cliff. Our category is dev-tools / fintech / vertical SaaS. Looking to understand what ChatGPT and Perplexity actually say about us."
                    className="w-full bg-paper border border-rule px-4 py-3 text-base focus:outline-none focus:border-ink leading-relaxed"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-rule">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-paper uppercase tracking-eyebrow text-sm hover:bg-signal transition-colors"
                  >
                    Send &amp; book a call
                    <span aria-hidden>→</span>
                  </button>
                  <p className="text-xs text-muted font-data">
                    We will reply within one business day. Usually faster.
                  </p>
                </div>
              </form>
            </div>

            {/* expectations column */}
            <aside className="col-span-12 md:col-span-5 md:pl-12 mt-12 md:mt-0 md:border-l md:border-rule">
              <p className="eyebrow mb-6">What happens after you send this</p>
              <ol className="space-y-7 text-sm">
                {[
                  {
                    n: '01',
                    t: 'We read it',
                    b: 'A real person on the team reads every form. We do not auto-reply with a Calendly link to a fake SDR.',
                  },
                  {
                    n: '02',
                    t: 'We reply with a Calendly link',
                    b: 'Within one business day, usually within a few hours. The link is to a 30-minute call, not a discovery call.',
                  },
                  {
                    n: '03',
                    t: 'We run your audit live',
                    b: 'On the call, with you watching, we run a real audit of your brand. You see the mention rate, the offline-memory rate, and the citation gap. We do not charge for this.',
                  },
                  {
                    n: '04',
                    t: 'We tell you whether to hire us',
                    b: 'If we cannot move your mention rate, we say so. If we can, we walk you through which tier makes sense. The call ends with a clear next step — either yes with a contract, or no with a parting tip.',
                  },
                ].map((s) => (
                  <li key={s.n} className="flex gap-5">
                    <span className="font-data text-muted text-base mt-0.5 shrink-0">{s.n}</span>
                    <div>
                      <p className="font-display text-lg text-ink mb-1" style={{ fontWeight: 580 }}>{s.t}</p>
                      <p className="text-ink leading-relaxed">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── ALT ROUTES ─────────────────────────────────────── */}
      <section className="border-b border-rule bg-cream">
        <div className="max-w-8xl mx-auto px-8 py-14">
          <p className="eyebrow mb-6">If you are not ready to talk</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <Link href="/audit" className="block group">
              <p className="eyebrow mb-2">Run a free audit</p>
              <p
                className="font-display text-2xl text-ink group-hover:text-signal transition-colors mb-2"
                style={{ fontWeight: 580 }}
              >
                See your citation gap in 90 seconds →
              </p>
              <p className="text-muted leading-relaxed">No signup, no email. The audit lives at a permalink forever.</p>
            </Link>
            <Link href="/services" className="block group">
              <p className="eyebrow mb-2">See pricing</p>
              <p
                className="font-display text-2xl text-ink group-hover:text-signal transition-colors mb-2"
                style={{ fontWeight: 580 }}
              >
                Three tiers, flat fee, no surprises →
              </p>
              <p className="text-muted leading-relaxed">All engagements have a Day-90 lift guarantee in writing.</p>
            </Link>
            <Link href="/case-study/aeo-auditor" className="block group">
              <p className="eyebrow mb-2">Watch us dogfood</p>
              <p
                className="font-display text-2xl text-ink group-hover:text-signal transition-colors mb-2"
                style={{ fontWeight: 580 }}
              >
                Public log of getting AEO Auditor itself cited →
              </p>
              <p className="text-muted leading-relaxed">Every placement we make for ourselves is logged on the page.</p>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow block mb-2">
        {label}
        {required && <span className="text-signal ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-paper border border-rule px-4 py-3 font-display text-lg focus:outline-none focus:border-ink"
        style={{ fontWeight: 500 }}
      />
    </div>
  );
}