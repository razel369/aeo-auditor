/**
 * Audit scoring — turns engine answers into numbers a buyer can act on.
 */

import type { EngineAnswer, EngineId } from './engines';

export interface AuditReport {
  brand: string;
  category: string;
  queries: string[];
  answers: EngineAnswer[];
  mentionRate: number; // 0..1
  averagePosition: number; // 1..N, lower better (0 = no mention)
  shareOfVoice: Record<string, number>; // brand → 0..1 share of total mentions
  perEngineMentionRate: Record<EngineId, number>;
  perEngineAvgPosition: Record<EngineId, number>;
  topSources: string[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  body: string;
  effort: 'low' | 'medium' | 'high';
}

export function scoreAudit(
  brand: string,
  category: string,
  queries: string[],
  answers: EngineAnswer[],
): AuditReport {
  const totalQueries = queries.length;
  const totalAnswers = answers.length;
  const mentions = answers.filter((a) => a.mentionsBrand).length;
  const mentionRate = totalAnswers ? mentions / totalAnswers : 0;

  const positions = answers.filter((a) => a.mentionsBrand).map((a) => a.brandPosition);
  const averagePosition = positions.length ? positions.reduce((s, p) => s + p, 0) / positions.length : 0;

  // Share of voice: count how often each brand appears across all answers.
  const mentionsByBrand = new Map<string, number>();
  mentionsByBrand.set(brand, mentions);
  for (const a of answers) {
    for (const c of a.competitorsMentioned) {
      mentionsByBrand.set(c, (mentionsByBrand.get(c) ?? 0) + (a.mentionsBrand ? 0.6 : 1));
    }
  }
  const totalSov = Array.from(mentionsByBrand.values()).reduce((s, v) => s + v, 0) || 1;
  const shareOfVoice: Record<string, number> = {};
  for (const [b, n] of mentionsByBrand) shareOfVoice[b] = +(n / totalSov).toFixed(3);

  // Per-engine stats
  const perEngineMentionRate: Record<EngineId, number> = {} as any;
  const perEngineAvgPosition: Record<EngineId, number> = {} as any;
  const engineIds: EngineId[] = ['chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai'];
  for (const id of engineIds) {
    const subset = answers.filter((a) => a.engine === id);
    const m = subset.filter((a) => a.mentionsBrand).length;
    perEngineMentionRate[id] = subset.length ? m / subset.length : 0;
    const ps = subset.filter((a) => a.mentionsBrand).map((a) => a.brandPosition);
    perEngineAvgPosition[id] = ps.length ? ps.reduce((s, p) => s + p, 0) / ps.length : 0;
  }

  // Top sources
  const sourceCount = new Map<string, number>();
  for (const a of answers) {
    for (const s of a.citedSources) sourceCount.set(s, (sourceCount.get(s) ?? 0) + 1);
  }
  const topSources = Array.from(sourceCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([s]) => s);

  return {
    brand,
    category,
    queries,
    answers,
    mentionRate: +mentionRate.toFixed(3),
    averagePosition: +averagePosition.toFixed(2),
    shareOfVoice,
    perEngineMentionRate,
    perEngineAvgPosition,
    topSources,
    recommendations: buildRecommendations({
      mentionRate,
      averagePosition,
      perEngineMentionRate,
      brand,
      category,
    }),
  };
}

function buildRecommendations(ctx: {
  mentionRate: number;
  averagePosition: number;
  perEngineMentionRate: Record<EngineId, number>;
  brand: string;
  category: string;
}): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. llms.txt
  if (ctx.mentionRate < 0.7) {
    recs.push({
      title: 'Add llms.txt to your root domain',
      body: `Most AI engines crawl your root first. A well-structured llms.txt with your company description, key product pages, and category-language dramatically increases the chance you'll appear in "best ${ctx.category}" queries.`,
      effort: 'low',
    });
  }

  // 2. Schema.org
  recs.push({
    title: 'Add Organization + Product schema to your homepage',
    body: `Structured data tells crawlers what you actually do. Without it, AI engines fall back on guesswork from your marketing copy — which is usually vague.`,
    effort: 'low',
  });

  // 3. Top-of-funnel content
  if (ctx.averagePosition > 2 || ctx.averagePosition === 0) {
    recs.push({
      title: 'Publish a definitive "[category] comparison" page',
      body: `When AI engines answer "best ${ctx.category} tools", they cite comparison-style content. Write a page that genuinely compares you to 4-5 honest alternatives — not a buyer's-guide that's secretly a sales page.`,
      effort: 'medium',
    });
  }

  // 4. Per-engine gaps
  const worst = (Object.entries(ctx.perEngineMentionRate) as [EngineId, number][])
    .sort((a, b) => a[1] - b[1])[0];
  if (worst && worst[1] < 0.5) {
    const engineNames: Record<EngineId, string> = {
      chatgpt: 'ChatGPT',
      perplexity: 'Perplexity',
      claude: 'Claude',
      gemini: 'Gemini',
      google_ai: 'Google AI Overviews',
    };
    recs.push({
      title: `${engineNames[worst[0]]} rarely mentions you — likely a freshness gap`,
      body: `${engineNames[worst[0]]} tends to weight recent content heavily. ${worst[1] < 0.3 ? 'You may not appear in their training data at all — focus on getting cited by other sources they crawl.' : 'Increase publishing cadence on your blog and ensure your about/product pages are dated and current.'}`,
      effort: 'medium',
    });
  }

  // 5. Citation sources
  recs.push({
    title: 'Get cited on review sites that AI engines already crawl',
    body: `The sites that AI engines cite most for "${ctx.category}" tend to be: G2, Capterra, GetApp, Product Hunt, and Hacker News Show HN posts. Make sure each has an up-to-date listing.`,
    effort: 'medium',
  });

  // 6. Competitive note
  recs.push({
    title: 'Run a monthly audit',
    body: `AI engines update their training data constantly. Your mention rate can drop 10-20% in a quarter without any change on your site. A monthly AEO audit catches this early.`,
    effort: 'low',
  });

  return recs;
}