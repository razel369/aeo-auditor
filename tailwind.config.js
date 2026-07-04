/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens — "The Field Report"
        paper: '#F2EDE4',     // primary bg — warm newsprint
        cream: '#EFE6D2',     // secondary bg — faint warmth
        rule: '#D9D0BC',      // hairline borders
        ink: '#0E1116',       // primary text — warm black
        inkSoft: '#1B1F26',   // secondary
        muted: '#7B8A99',     // labels, captions
        signal: '#FF5136',    // accent — red ink, "you are not mentioned"
        ok: '#2E6B4F',        // dark emerald, never lime — printed, not neon
        okBg: '#D5E1D5',      // bg variant
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
        tighter: '-0.03em',
        eyebrow: '0.18em',
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        display: ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.04em' }],
        headline: ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};