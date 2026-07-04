import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AEO Auditor — find out if AI engines mention your brand',
  description: 'Run a real audit across ChatGPT, Perplexity, Claude, Gemini and Google AI Overviews. Mention rate, share of voice, source citations in 90 seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}