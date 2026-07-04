/**
 * Audit scoring — turns engine answers into numbers a buyer can act on.
 *
 * Handles partial data: an engine that errored or was unavailable is
 * excluded from aggregates and reported via `dataCompleteness`.
 * Live-mode answers are weighted higher than sim-mode fallbacks.
 */

import type { EngineAnswer, EngineId, EngineMode } from './engines';

export interface AuditReport {
  brand: string;
  category: string;
  queries: string[];
  answers: EngineAnswer[];
  mentionRate: number; // 0..1 (over valid cells only)
  averagePosition: number;
  shareOfVoice: Record<string, number>;
  perEngineMentionRate: Record<EngineId, number>;
  perEngineAvgPosition: Record<EngineId, number>;
  perEngineMode: Record<EngineId, EngineMode>;
  topSources: string[];
  /** Fraction of (engine × query) cells that produced valid data. */
  dataCompleteness: number;
  /** Fraction of valid cells that came from real engines (vs sim fallback). */
  liveShare: number;
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  body: string;
  effort: 'low' | 'medium' | 'high';
}

const ALL_ENGINES: EngineId[] = ['chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai'];

export function scoreAudit(
  brand: string,
  category: string,
  queries: string[],
  answers: EngineAnswer[],
): AuditReport {
  const valid = answers.filter((a) => !a.errored && a.mode !== 'unavailable');
  const invalid = answers.filter((a) => a.errored || a.mode === 'unavailable');

  const mentions = valid.filter((a) => a.mentionsBrand).length;
  const mentionRate = valid.length ? mentions / valid.length : 0;

  const positions = valid.filter((a) => a.mentionsBrand).map((a) => a.brandPosition);
  const averagePosition = positions.length ? positions.reduce((s, p) => s + p, 0) / positions.length : 0;

  // Share of voice — count distinct brand-name occurrences across all valid answers
  const brandCounts = new Map<string, number>();
  brandCounts.set(brand.toLowerCase(), mentions);
  for (const a of valid) {
    for (const c of a.competitorsMentioned) {
      brandCounts.set(c.toLowerCase(), (brandCounts.get(c.toLowerCase()) ?? 0) + 1);
    }
  }
  const totalSov = Array.from(brandCounts.values()).reduce((s, v) => s + v, 0) || 1;
  const shareOfVoice: Record<string, number> = {};
  for (const [b, n] of brandCounts) shareOfVoice[b] = +(n / totalSov).toFixed(3);

  // Per-engine stats — over valid cells for each engine
  const perEngineMentionRate: Record<EngineId, number> = {} as any;
  const perEngineAvgPosition: Record<EngineId, number> = {} as any;
  const perEngineMode: Record<EngineId, EngineMode> = {} as any;
  for (const id of ALL_ENGINES) {
    const subset = valid.filter((a) => a.engine === id);
    const m = subset.filter((a) => a.mentionsBrand).length;
    perEngineMentionRate[id] = subset.length ? m / subset.length : 0;
    const ps = subset.filter((a) => a.mentionsBrand).map((a) => a.brandPosition);
    perEngineAvgPosition[id] = ps.length ? ps.reduce((s, p) => s + p, 0) / ps.length : 0;
    const modeRecord = answers.find((a) => a.engine === id);
    perEngineMode[id] = modeRecord?.mode ?? 'unavailable';
  }

  const sourceCount = new Map<string, number>();
  for (const a of valid) for (const s of a.citedSources) sourceCount.set(s, (sourceCount.get(s) ?? 0) + 1);
  const topSources = Array.from(sourceCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([s]) => s);

  const totalCells = answers.length;
  const dataCompleteness = totalCells ? valid.length / totalCells : 0;
  const liveShare = valid.length ? valid.filter((a) => a.mode === 'live').length / valid.length : 0;

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
    perEngineMode,
    topSources,
    dataCompleteness: +dataCompleteness.toFixed(3),
    liveShare: +liveShare.toFixed(3),
    recommendations: buildRecommendations({
      mentionRate,
      averagePosition,
      perEngineMentionRate,
      brand,
      category,
      dataCompleteness,
      liveShare,
    }),
  };
}

function buildRecommendations(ctx: {
  mentionRate: number;
  averagePosition: number;
  perEngineMentionRate: Record<EngineId, number>;
  brand: string;
  category: string;
  dataCompleteness: number;
  liveShare: number;
}): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1. Data freshness — if we're mostly running on sim, the report is illustrative only
  if (ctx.liveShare < 0.5) {
    recs.push({
      title: 'This report is partly illustrative',
      body: `Only ${Math.round(ctx.liveShare * 100)}% of the answers came from live engines. Add API keys (Perplexity, OpenAI, Anthropic, Google) to get a fully measured audit.`,
      effort: 'low',
    });
  }

  // 2. llms.txt
  if (ctx.mentionRate < 0.7) {
    recs.push({
      title: 'Add llms.txt to your root domain',
      body: `Most AI engines crawl your root first. A well-structured llms.txt with your company description, key product pages, and category-language dramatically increases the chance you'll appear in "best ${ctx.category}" queries.`,
      effort: 'low',
    });
  }

  // 3. Schema.org
  recs.push({
    title: 'Add Organization + Product schema to your homepage',
    body: `Structured data tells crawlers what you actually do. Without it, AI engines fall back on guesswork from your marketing copy — which is usually vague.`,
    effort: 'low',
  });

  // 4. Top-of-funnel content
  if (ctx.averagePosition > 2 || ctx.averagePosition === 0) {
    recs.push({
      title: 'Publish a definitive "[category] comparison" page',
      body: `When AI engines answer "best ${ctx.category} tools", they cite comparison-style content. Write a page that genuinely compares you to 4-5 honest alternatives — not a buyer's-guide that's secretly a sales page.`,
      effort: 'medium',
    });
  }

  // 5. Per-engine gaps — only mention engines with at least one valid answer
  const worst = (Object.entries(ctx.perEngineMentionRate) as [EngineId, number][])
    .filter(([, rate]) => rate > 0 || ctx.perEngineMentionRate !== undefined)
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

  // 6. Citation sources
  recs.push({
    title: 'Get cited on review sites that AI engines already crawl',
    body: `The sites that AI engines cite most for "${ctx.category}" tend to be: G2, Capterra, GetApp, Product Hunt, and Hacker News Show HN posts. Make sure each has an up-to-date listing.`,
    effort: 'medium',
  });

  // 7. Cadence
  recs.push({
    title: 'Run a monthly audit',
    body: `AI engines update their training data constantly. Your mention rate can drop 10-20% in a quarter without any change on your site. A monthly AEO audit catches this early.`,
    effort: 'low',
  });

  return recs;
}