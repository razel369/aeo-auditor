/**
 * Engine probe adapters.
 *
 * v0.6 pivot: combine the deterministic source-coverage layer (v0.5) with a
 * real "what would AI cite" probe layer. We do not pay for ChatGPT / Claude /
 * Perplexity APIs. Instead, we use Google Gemini 2.5 Flash with Google Search
 * Grounding (free tier: 500 RPD) and treat the grounded sources as a proxy
 * for the cited sources across all major engines.
 *
 * Why this works:
 *   - Perplexity, ChatGPT search, Claude web search, and Google AI Overviews
 *     all read from Google's index via the same family of signals.
 *   - `groundingChunks` returns the actual URLs the model used — that's
 *     exactly what we want to measure.
 *   - Free, fast, deterministic enough at the URL-set level.
 *
 * Why this isn't perfect:
 *   - We can't probe ChatGPT directly. We're inferring from Gemini.
 *   - Some engines prefer different sources (Reddit for Perplexity, etc).
 *   - For Day-90 we re-run on the same 10 prompts — drift detection works
 *     even if the absolute proxy has bias.
 *
 * Research: docs/engine-research/01-gemini-grounding.md (to be written)
 */

export interface EngineProbeResult {
  prompt: string;
  citedUrls: string[];          // URLs the engine grounded on
  citedDomains: string[];       // unique domains
  brandMentioned: boolean;      // any cited URL mentions the brand
  brandMentionedInText: boolean;// the model text itself names the brand
  textExcerpt: string;          // first ~280 chars of the model's answer
  error: string | null;
  durationMs: number;
}

export interface EngineAdapter {
  id: 'gemini-grounding';
  name: string;
  rationale: string;
  /** Probe a single buyer-intent prompt. */
  probe(prompt: string, brandTokens: string[]): Promise<EngineProbeResult>;
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GeminiGroundingChunk {
  web?: { uri?: string; title?: string };
}

interface GeminiGroundingSupport {
  segment?: { startIndex?: number; endIndex?: number; text?: string };
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

interface GeminiGroundingMetadata {
  groundingChunks?: GeminiGroundingChunk[];
  groundingSupports?: GeminiGroundingSupport[];
  webSearchQueries?: string[];
}

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  groundingMetadata?: GeminiGroundingMetadata;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string; code?: number };
}

function tokenize(brand: string): string[] {
  // Brand tokens we treat as a "cited brand" signal: the brand as-is, plus
  // each space-separated token (lower-cased), to handle "AEO Auditor" vs
  // "aeoauditor.com" vs "aeoauditor".
  const cleaned = brand.trim().toLowerCase();
  if (!cleaned) return [];
  const tokens = cleaned.split(/[\s\-_]+/).filter((t) => t.length >= 3);
  return Array.from(new Set([cleaned, ...tokens]));
}

function urlMentionsBrand(url: string, tokens: string[]): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

function textMentionsBrand(text: string, tokens: string[]): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return tokens.some((t) => lower.includes(t));
}

export function geminiAdapter(apiKey: string | undefined): EngineAdapter {
  return {
    id: 'gemini-grounding',
    name: 'Gemini 2.5 Flash (grounded)',
    rationale: 'Google Search grounding returns the URLs the model used; free at 500 RPD.',
    async probe(prompt, brandTokens) {
      const start = Date.now();
      if (!apiKey) {
        return {
          prompt, citedUrls: [], citedDomains: [],
          brandMentioned: false, brandMentionedInText: false,
          textExcerpt: '', error: 'GEMINI_API_KEY not configured',
          durationMs: Date.now() - start,
        };
      }
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      };
      let res: Response;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        }).finally(() => clearTimeout(t));
      } catch (e) {
        return {
          prompt, citedUrls: [], citedDomains: [],
          brandMentioned: false, brandMentionedInText: false,
          textExcerpt: '',
          error: `network: ${(e as Error).message}`,
          durationMs: Date.now() - start,
        };
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return {
          prompt, citedUrls: [], citedDomains: [],
          brandMentioned: false, brandMentionedInText: false,
          textExcerpt: '',
          error: `HTTP ${res.status} ${text.slice(0, 120)}`,
          durationMs: Date.now() - start,
        };
      }
      const json = (await res.json()) as GeminiResponse;
      if (json.error) {
        return {
          prompt, citedUrls: [], citedDomains: [],
          brandMentioned: false, brandMentionedInText: false,
          textExcerpt: '',
          error: json.error.message ?? `code ${json.error.code}`,
          durationMs: Date.now() - start,
        };
      }
      const cand = json.candidates?.[0];
      const text = cand?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      const grounding = cand?.groundingMetadata ?? {};
      const chunks = grounding.groundingChunks ?? [];
      const urls = chunks
        .map((c) => c.web?.uri)
        .filter((u): u is string => typeof u === 'string' && u.length > 0);
      const domains = Array.from(new Set(urls.map((u) => {
        try { return new URL(u).hostname.replace(/^www\./, ''); }
        catch { return u; }
      })));
      return {
        prompt,
        citedUrls: Array.from(new Set(urls)),
        citedDomains: domains,
        brandMentioned: urls.some((u) => urlMentionsBrand(u, brandTokens)),
        brandMentionedInText: textMentionsBrand(text, brandTokens),
        textExcerpt: text.slice(0, 280),
        error: null,
        durationMs: Date.now() - start,
      };
    },
  };
}

export const ENGINE_TOKENIZE = tokenize;