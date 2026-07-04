/**
 * Citation gap analysis.
 *
 * For each category, the curated list of sources that AI engines cite most
 * reliably. The audit cross-references these against the topSources actually
 * found in the answers, and reports:
 *
 *   - `covered`: sources that match an item in `topSources`.
 *   - `missing`: sources you should be on, with copy-pasteable "how to get on"
 *     instructions.
 *
 * The list is intentionally short and curated, not exhaustive. Buyers care
 * about the 5-7 sources that drive 80% of AI citations in their category.
 */

export type Effort = 'low' | 'medium' | 'high';

export interface CitationExpectation {
  /** Match key — substring matched against audit `citedSources` URLs. */
  match: string;
  /** Display label. */
  label: string;
  /** Estimated effort to land on this source. */
  effort: Effort;
  /** Why this source drives AI citations. */
  why: string;
  /** Concrete next step — a URL, a template, a checklist item. */
  howToGetOn: string;
}

/** Default list used when no category match. */
const DEFAULT_LIST: CitationExpectation[] = [
  {
    match: 'wikipedia.org',
    label: 'Wikipedia',
    effort: 'high',
    why: 'Wikipedia is in nearly every LLM training corpus. A company page or category article is one of the strongest "offline memory" signals you can build.',
    howToGetOn: 'Search en.wikipedia.org for your brand. If a page does not exist, follow the notability guidelines and create one. If it exists, ensure the article has citations to primary sources.',
  },
  {
    match: 'g2.com',
    label: 'G2 listing',
    effort: 'low',
    why: 'G2 is heavily cited by ChatGPT, Perplexity, and Google AI Overviews for "best X tools" queries.',
    howToGetOn: 'Claim your profile at g2.com/products/new and ask 10 customers for reviews this week.',
  },
  {
    match: 'capterra.com',
    label: 'Capterra listing',
    effort: 'low',
    why: 'Capterra appears in nearly every "best [software category]" list scraped by AI engines.',
    howToGetOn: 'capterra.com/vendors/sign-up — claim your profile and ensure the description is current.',
  },
  {
    match: 'crunchbase.com',
    label: 'Crunchbase',
    effort: 'low',
    why: 'Crunchbase is the canonical source for company facts. AI engines use it to confirm what you do, who funds you, and when you launched.',
    howToGetOn: 'Submit your company at crunchbase.com/add-company — most entries are approved within 48 hours.',
  },
  {
    match: 'producthunt.com',
    label: 'Product Hunt',
    effort: 'low',
    why: 'PH launch pages rank for branded queries and are cited as social proof in AI answers.',
    howToGetOn: 'Schedule a launch at producthunt.com/posts/new — even a "relaunch" works. Prepare 3-5 hunter comments before launch day.',
  },
  {
    match: 'reddit.com',
    label: 'Reddit thread',
    effort: 'medium',
    why: 'Reddit threads are heavily crawled by Perplexity and Google AI Overviews. Genuine user discussion beats branded content.',
    howToGetOn: 'Find r/<your-category> threads where your brand is mentioned. Reply genuinely to add context. Do NOT astroturf.',
  },
  {
    match: 'news.ycombinator.com',
    label: 'Hacker News thread',
    effort: 'medium',
    why: 'Show HN posts are crawled by every engine. A successful HN thread becomes a permanent citation source.',
    howToGetOn: 'Launch with a Show HN at news.ycombinator.com/showhn.html. Post during 9-11am ET Tuesday-Thursday for best signal.',
  },
  {
    match: 'linkedin.com/company',
    label: 'LinkedIn company page',
    effort: 'low',
    why: 'Confirmed by every LLM as a corporate-facts source. Especially strong for B2B audiences.',
    howToGetOn: 'linkedin.com/company/setup — post weekly updates, set your industry tags correctly.',
  },
];

const BY_CATEGORY: Record<string, CitationExpectation[]> = {
  'project management': [
    { match: 'en.wikipedia.org/wiki/Comparison_of_project_management_software', label: 'Wikipedia comparison article', effort: 'high', why: 'This single Wikipedia page is one of the most-cited sources for "best project management software" queries across all engines.', howToGetOn: 'Wikipedia talk page first → request an edit if the article already lists your category. Do not edit directly without consensus.' },
    { match: 'g2.com/categories/project-management', label: 'G2 category page', effort: 'low', why: 'G2 PM category is cited in 60%+ of audits.', howToGetOn: 'g2.com/products/new — claim, ask customers for reviews.' },
    { match: 'capterra.com/categories/project-management', label: 'Capterra category', effort: 'low', why: 'Capterra PM rank is a signal source for AI engines.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'reddit.com/r/projectmanagement', label: 'r/projectmanagement threads', effort: 'medium', why: 'Buyers asking "which PM tool should I use" on Reddit get cited answers from Perplexity.', howToGetOn: 'Join, contribute genuinely, never astroturf.' },
    { match: 'linkedin.com/company', label: 'LinkedIn company page', effort: 'low', why: 'PM tools are bought by managers. LinkedIn corporate facts are heavily referenced.', howToGetOn: 'linkedin.com/company/setup.' },
    { match: 'news.ycombinator.com', label: 'Hacker News Show HN', effort: 'medium', why: 'Engineering-led PM tools get cited from HN threads more than any other source.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
  ],
  'payment processing': [
    { match: 'en.wikipedia.org/wiki/Payment_processor', label: 'Wikipedia payments article', effort: 'high', why: 'AI engines cite this page for "what is [payment brand]" queries.', howToGetOn: 'Wikipedia Talk page → request a mention in the relevant company list.' },
    { match: 'stripe.com', label: 'Stripe partners directory', effort: 'low', why: 'If you integrate with Stripe, getting listed there is the single biggest AI citation win.', howToGetOn: 'docs.stripe.com/partners — apply for the partner program.' },
    { match: 'g2.com/categories/payment-processing', label: 'G2 payments category', effort: 'low', why: 'Standard citation source.', howToGetOn: 'g2.com/products/new.' },
    { match: 'crunchbase.com', label: 'Crunchbase', effort: 'low', why: 'Crunchbase company facts are heavily cited by Perplexity.', howToGetOn: 'crunchbase.com/add-company.' },
    { match: 'producthunt.com', label: 'Product Hunt launch', effort: 'low', why: 'PH gets crawled by AI engines and is a default "top X" source.', howToGetOn: 'producthunt.com/posts/new.' },
  ],
  productivity: [
    { match: 'en.wikipedia.org/wiki/Productivity_software', label: 'Wikipedia productivity software', effort: 'high', why: 'Cited by all engines for "what is [productivity brand]" queries.', howToGetOn: 'Wikipedia notability + Talk page first.' },
    { match: 'g2.com/categories/productivity', label: 'G2 productivity', effort: 'low', why: 'Default citation source.', howToGetOn: 'g2.com/products/new.' },
    { match: 'capterra.com/categories/productivity', label: 'Capterra productivity', effort: 'low', why: 'Default citation source.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'reddit.com/r/productivity', label: 'r/productivity threads', effort: 'medium', why: 'Heavy Perplexity source for "best X for productivity" queries.', howToGetOn: 'Reddit — engage genuinely.' },
    { match: 'producthunt.com', label: 'Product Hunt launch', effort: 'low', why: 'Productivity is one of PHs strongest categories. Launch here.', howToGetOn: 'producthunt.com/posts/new.' },
  ],
  'frontend deployment': [
    { match: 'en.wikipedia.org/wiki/Platform_as_a_service', label: 'Wikipedia PaaS article', effort: 'high', why: 'AI engines cite this for "what is [hosting brand]" queries.', howToGetOn: 'Wikipedia Talk page first.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'For developer-facing platforms, your GitHub org is heavily crawled by AI engines via Perplexity.', howToGetOn: 'Keep your GitHub org public, star your own repos.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'Infra tools get heavily cited from HN. One Show HN can lift mentions 4-6x.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
    { match: 'g2.com/categories/application-development', label: 'G2 dev category', effort: 'low', why: 'Default citation source.', howToGetOn: 'g2.com/products/new.' },
  ],
  design: [
    { match: 'en.wikipedia.org/wiki/Comparison_of_vector_graphics_editors', label: 'Wikipedia design comparison', effort: 'high', why: 'Vector graphics editors are compared heavily in AI answers.', howToGetOn: 'Wikipedia — request Talk page inclusion.' },
    { match: 'g2.com/categories/design', label: 'G2 design', effort: 'low', why: 'Default citation source for design tools.', howToGetOn: 'g2.com/products/new.' },
    { match: 'producthunt.com', label: 'Product Hunt', effort: 'low', why: 'Design tools are PHs bread and butter.', howToGetOn: 'producthunt.com/posts/new.' },
    { match: 'reddit.com/r/design', label: 'r/design threads', effort: 'medium', why: 'Strong Perplexity source for "what design tool" queries.', howToGetOn: 'Engage genuinely.' },
  ],
  crm: [
    { match: 'en.wikipedia.org/wiki/Customer_relationship_management', label: 'Wikipedia CRM article', effort: 'high', why: 'AI engines cite Wikipedia for category explanations.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/crm', label: 'G2 CRM', effort: 'low', why: 'G2 CRM category is cited in ~70% of audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'capterra.com/categories/crm', label: 'Capterra CRM', effort: 'low', why: 'Default citation source.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'linkedin.com/company', label: 'LinkedIn company page', effort: 'low', why: 'CRMs are B2B; LinkedIn is the strongest signal.', howToGetOn: 'linkedin.com/company/setup.' },
    { match: 'crunchbase.com', label: 'Crunchbase', effort: 'low', why: 'Company facts citation.', howToGetOn: 'crunchbase.com/add-company.' },
  ],
  analytics: [
    { match: 'en.wikipedia.org/wiki/Web_analytics', label: 'Wikipedia web analytics', effort: 'high', why: 'AI cites Wikipedia for category explanations.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/product-analytics', label: 'G2 analytics', effort: 'low', why: 'Default citation source.', howToGetOn: 'g2.com/products/new.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'Analytics tools benefit from open-source presence.', howToGetOn: 'Keep your GitHub org public.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'Analytics is HN-typical. Launch here.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
  ],
  monitoring: [
    { match: 'en.wikipedia.org/wiki/Application_performance_management', label: 'Wikipedia APM article', effort: 'high', why: 'Category definition citation.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/application-performance-monitoring', label: 'G2 monitoring', effort: 'low', why: 'G2 has a heavy APM category.', howToGetOn: 'g2.com/products/new.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'OSS-friendly monitoring wins on HN.', howToGetOn: 'Keep your GitHub org public.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'Dev-tools category; HN is primary.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
  ],
};

/** Normalize a URL for matching. */
function norm(url: string): string {
  return url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
}

export function citationGap(category: string, topSources: string[]) {
  const expected = BY_CATEGORY[category] ?? DEFAULT_LIST;
  const normalizedTop = topSources.map(norm);
  const covered: CitationExpectation[] = [];
  const missing: CitationExpectation[] = [];
  for (const exp of expected) {
    const hit = normalizedTop.some((u) => u.includes(exp.match.toLowerCase()));
    if (hit) covered.push(exp);
    else missing.push(exp);
  }
  return { covered, missing };
}