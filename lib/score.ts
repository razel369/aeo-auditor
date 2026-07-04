/**
 * Audit scoring — turns engine answers into numbers a buyer can act on.
 *
 * Handles partial data: an engine that errored or was unavailable is
 * excluded from aggregates and reported via `dataCompleteness`.
 * Live-mode answers are weighted higher than sim-mode fallbacks.
 *
 * v0.3 additions:
 *   - Sentence-position weighting: mentions in opening / top-3 / closing
 *     sentences count more than mentions buried in the middle. Buyers'
 *     primacy and recency biases mean a name in sentence 2 is not the
 *     same signal as a name in sentence 9.
 *   - Offline memory rate: mentions across `*_nosearch` engines only.
 *     This is the brand-equity score — what an AI says about you when
 *     it cannot lean on web search.
 *   - Citation gap: which of the curated citation sources you are on,
 *     and which you are missing.
 */

import type { EngineAnswer, EngineId, EngineMode } from './engines';
import { citationGap } from './citation-sources';

export type Position = 'opening' | 'top_3' | 'middle' | 'closing' | 'absent';

export const POSITION_WEIGHTS: Record<Position, number> = {
  opening: 1.0,
  top_3: 1.0,
  closing: 1.0,
  middle: 0.5,
  absent: 0,
};

const OFFLINE_ENGINES: EngineId[] = ['chatgpt_nosearch', 'deepseek_nosearch', 'kimi_nosearch'];

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
  /** Mention rate weighted by sentence position (opening/top_3/closing = 1.0, middle = 0.5). */
  weightedMentionRate: number;
  /** Mentions across offline-only engines (no web search). 0 if no offline answers exist. */
  offlineMemoryRate: number;
  /** Curated sources vs top cited sources. */
  citationGap: {
    covered: import('./citation-sources').CitationExpectation[];
    missing: import('./citation-sources').CitationExpectation[];
  };
  /** Per-answer sentence position annotation, parallel to `answers`. */
  sentencePositions: Position[];
  auditKind: 'standard' | 'offline_memory';
  recommendations: Recommendation[];
}

export interface Recommendation {
  title: string;
  body: string;
  effort: 'low' | 'medium' | 'high';
}

const ALL_ENGINES: EngineId[] = [
  'chatgpt',
  'chatgpt_nosearch',
  'perplexity',
  'claude',
  'gemini',
  'google_ai',
  'deepseek_nosearch',
  'kimi_nosearch',
];

export function scoreAudit(
  brand: string,
  category: string,
  queries: string[],
  answers: EngineAnswer[],
  auditKind: 'standard' | 'offline_memory' = 'standard',
): AuditReport {
  const valid = answers.filter((a) => !a.errored && a.mode !== 'unavailable');
  const invalid = answers.filter((a) => a.errored || a.mode === 'unavailable');

  const mentions = valid.filter((a) => a.mentionsBrand).length;
  const mentionRate = valid.length ? mentions / valid.length : 0;

  const positions = valid.filter((a) => a.mentionsBrand).map((a) => a.brandPosition);
  const averagePosition = positions.length ? positions.reduce((s, p) => s + p, 0) / positions.length : 0;

  // Sentence-position scoring
  const sentencePositions: Position[] = answers.map((a) => scoreSentencePosition(a.answer, brand));
  const validPosWeights = answers
    .filter((a) => !a.errored && a.mode !== 'unavailable')
    .map((_, i) => sentencePositions[i]!)
    .map((p) => POSITION_WEIGHTS[p]);
  const weightedSum = validPosWeights.reduce((s, w) => s + w, 0);
  const weightedMentionRate = valid.length ? +(weightedSum / valid.length).toFixed(3) : 0;

  // Offline memory
  const offlineValid = valid.filter((a) => OFFLINE_ENGINES.includes(a.engine));
  const offlineMentions = offlineValid.filter((a) => a.mentionsBrand).length;
  const offlineMemoryRate = offlineValid.length ? +(offlineMentions / offlineValid.length).toFixed(3) : 0;

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

  const gap = citationGap(category, topSources);

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
    weightedMentionRate,
    offlineMemoryRate,
    citationGap: gap,
    sentencePositions,
    auditKind,
    recommendations: buildRecommendations({
      mentionRate,
      averagePosition,
      perEngineMentionRate,
      brand,
      category,
      dataCompleteness,
      liveShare,
      weightedMentionRate,
      offlineMemoryRate,
      gap,
      auditKind,
    }),
  };
}

/**
 * Where in the response text does the brand name appear?
 *
 *   opening  — sentence 1 (anchors the reader's attention)
 *   top_3    — sentences 2-3 (still within primacy zone)
 *   closing  — last sentence (recency bias)
 *   middle   — anything between top_3 and closing (visually invisible)
 *   absent   — brand not mentioned
 *
 * If the brand appears more than once, the earliest zone wins (its strongest
 * signal is the one we want to report).
 */
export function scoreSentencePosition(answer: string, brand: string): Position {
  if (!answer || !brand) return 'absent';
  const lower = answer.toLowerCase();
  const brandLower = brand.toLowerCase();
  const idx = lower.indexOf(brandLower);
  if (idx === -1) return 'absent';

  // Split into sentences on .!? followed by whitespace or end of string.
  // Preserves order so we can map character offset → sentence index.
  const sentences: { start: number; text: string }[] = [];
  const re = /[^.!?]+[.!?]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) {
    sentences.push({ start: m.index, text: m[0] });
  }
  if (sentences.length === 0) return 'absent';

  // Find first sentence whose range contains the brand offset.
  let sentenceIdx = sentences.findIndex((s) => idx >= s.start && idx < s.start + s.text.length);
  if (sentenceIdx === -1) sentenceIdx = sentences.length - 1;

  if (sentenceIdx === 0) return 'opening';
  if (sentenceIdx <= 2) return 'top_3';
  if (sentenceIdx === sentences.length - 1) return 'closing';
  return 'middle';
}

function buildRecommendations(ctx: {
  mentionRate: number;
  averagePosition: number;
  perEngineMentionRate: Record<EngineId, number>;
  brand: string;
  category: string;
  dataCompleteness: number;
  liveShare: number;
  weightedMentionRate: number;
  offlineMemoryRate: number;
  gap: { covered: unknown[]; missing: import('./citation-sources').CitationExpectation[] };
  auditKind: 'standard' | 'offline_memory';
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

  // 2. Offline memory — new v0.3
  if (ctx.offlineMemoryRate < 0.5 && ctx.offlineMemoryRate > 0) {
    recs.push({
      title: 'Your offline memory is weak',
      body: `When AI engines cannot search the web, only ${Math.round(ctx.offlineMemoryRate * 100)}% of answers name you. That means your brand is barely in the training data. Get cited on sources models ingest directly — Wikipedia, Wikidata, Crunchbase, G2, Reddit.`,
      effort: 'high',
    });
  } else if (ctx.offlineMemoryRate >= 0.5) {
    recs.push({
      title: 'You have offline memory — defend it',
      body: `${Math.round(ctx.offlineMemoryRate * 100)}% of offline answers name you. Publish quarterly Wikipedia-quality updates and keep your Crunchbase / Wikidata entries current — these are the sources that lock in your offline position.`,
      effort: 'medium',
    });
  }

  // 3. Sentence-position leverage
  if (ctx.weightedMentionRate > 0 && ctx.weightedMentionRate < ctx.mentionRate * 0.6) {
    recs.push({
      title: 'You are mentioned, but not remembered',
      body: `Your raw mention rate is ${(ctx.mentionRate * 100).toFixed(0)}% but your weighted rate (where in the response the brand appears) is only ${(ctx.weightedMentionRate * 100).toFixed(0)}%. Most mentions are buried mid-paragraph. Buyers remember opening and closing sentences. Add a direct comparison early in your comparison pages.`,
      effort: 'medium',
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
    .filter(([id]) => !(OFFLINE_ENGINES as readonly string[]).includes(id))
    .sort((a, b) => a[1] - b[1])[0];
  if (worst && worst[1] < 0.5) {
    const engineNames: Record<EngineId, string> = {
      chatgpt: 'ChatGPT',
      'chatgpt_nosearch': 'ChatGPT (offline)',
      perplexity: 'Perplexity',
      claude: 'Claude',
      gemini: 'Gemini',
      google_ai: 'Google AI Overviews',
      deepseek_nosearch: 'DeepSeek (offline)',
      kimi_nosearch: 'Kimi (offline)',
    };
    recs.push({
      title: `${engineNames[worst[0]]} rarely mentions you — likely a freshness gap`,
      body: `${engineNames[worst[0]]} tends to weight recent content heavily. ${worst[1] < 0.3 ? 'You may not appear in their training data at all — focus on getting cited by other sources they crawl.' : 'Increase publishing cadence on your blog and ensure your about/product pages are dated and current.'}`,
      effort: 'medium',
    });
  }

  // 6. Citation gap — sources you should be on
  if (ctx.gap.missing.length > 0) {
    const top = ctx.gap.missing.slice(0, 3);
    recs.push({
      title: `Get cited on ${top.map((m) => m.label).join(', ')}`,
      body: `Engines are not citing you on ${top.length} high-leverage sources. Each of these has a copy-pasteable "how to get on" instruction below in the Citation Gap section.`,
      effort: 'low',
    });
  }

  // 7. Cadence
  recs.push({
    title: 'Run a monthly audit',
    body: `AI engines update their training data constantly. Your mention rate can drop 10-20% in a quarter without any change on your site. A monthly AEO audit catches this early.`,
    effort: 'low',
  });

  return recs;
}