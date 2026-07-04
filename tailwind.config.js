/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0c10',
        panel: '#15171c',
        panel2: '#1c1f26',
        text: '#e7e9ee',
        dim: '#9aa1ad',
        accent: '#7aa2f7',
        accent2: '#bb9af7',
        ok: '#9ece6a',
        warn: '#e0af68',
        err: '#f7768e',
        border: '#2a2f3a',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};