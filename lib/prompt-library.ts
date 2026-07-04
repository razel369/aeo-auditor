/**
 * Buyer-intent prompt library.
 *
 * v0.6: 10 prompts per audit. Five are generic (good for any brand with a
 * category). Five are category-aware — they substitute the user's category
 * into the slot.
 *
 * Goal: real queries a buyer actually types into ChatGPT/Perplexity/Claude
 * that the brand wants to be cited for. We do not game; we measure.
 */

export interface PromptSeed {
  text: string;
  /** 'generic' = category-blind, 'category' = needs a category string. */
  kind: 'generic' | 'category';
}

export const GENERIC_PROMPTS: PromptSeed[] = [
  { kind: 'generic', text: 'What are the most established companies in this space right now?' },
  { kind: 'generic', text: 'Which brands do experts most often recommend?' },
  { kind: 'generic', text: 'What are the most-cited companies in industry publications?' },
  { kind: 'generic', text: 'Which brands have the strongest reputation among practitioners?' },
  { kind: 'generic', text: 'What are the longest-running, most-mentioned players in this category?' },
];

export const CATEGORY_PROMPTS: PromptSeed[] = [
  { kind: 'category', text: 'What are the best {CATEGORY} tools available today?' },
  { kind: 'category', text: 'Which {CATEGORY} software do most reviewers recommend?' },
  { kind: 'category', text: 'Top-rated {CATEGORY} platforms according to user reviews.' },
  { kind: 'category', text: 'What {CATEGORY} brands should I shortlist for my team?' },
  { kind: 'category', text: 'Which {CATEGORY} companies appear most often in buyer guides?' },
];

const FALLBACK_CATEGORY = 'B2B SaaS';

export function buildPrompts(category: string | null): string[] {
  const cat = (category?.trim() || FALLBACK_CATEGORY).toLowerCase();
  const prompts: string[] = [];
  for (const p of GENERIC_PROMPTS) prompts.push(p.text);
  for (const p of CATEGORY_PROMPTS) {
    prompts.push(p.text.replace(/\{CATEGORY\}/g, cat));
  }
  return prompts;
}