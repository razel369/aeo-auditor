import './globals.css';
import type { Metadata } from 'next';
import { SiteShell } from '@/components/SiteShell';

export const metadata: Metadata = {
  title: 'AEO Auditor · The Field Report',
  description:
    'AEO is the new SEO. We audit whether AI engines mention your brand — ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews — and ship you a written report.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,580;9..144,700&family=Inter:wght@350;380;420;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}