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
 * The list is intentionally short and curated, not exhaustive. The 5-7
 * sources below are the ones we have seen cited most often across our own
 * Gemini-grounded audits and across the public AEO/GEO vendor literature —
 * not an 80% rule, and not a citation-rate benchmark we have run ourselves.
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
    why: 'Frequently appears as a cited URL across our Gemini-grounded audits. We treat it as a high-impact source for offline-memory queries (queries where the engine cannot browse).',
    howToGetOn: 'Search en.wikipedia.org for your brand. If a page does not exist, follow the notability guidelines and create one. If it exists, ensure the article has citations to primary sources.',
  },
  {
    match: 'g2.com',
    label: 'G2 listing',
    effort: 'low',
    why: 'G2 surfaces in our audits for "best X tools" prompts. Reviews shape which brand the engine names.',
    howToGetOn: 'Claim your profile at g2.com/products/new and ask 10 customers for reviews this week.',
  },
  {
    match: 'capterra.com',
    label: 'Capterra listing',
    effort: 'low',
    why: 'Capterra appears alongside G2 in our audits for category-best prompts.',
    howToGetOn: 'capterra.com/vendors/sign-up — claim your profile and ensure the description is current.',
  },
  {
    match: 'crunchbase.com',
    label: 'Crunchbase',
    effort: 'low',
    why: 'Crunchbase company facts (founding date, funding, HQ) are cited in "what is [brand]" queries in our audits.',
    howToGetOn: 'Submit your company at crunchbase.com/add-company — self-serve claims take longer than verified-researcher channel adds.',
  },
  {
    match: 'producthunt.com',
    label: 'Product Hunt',
    effort: 'low',
    why: 'Product Hunt launch pages show up in our audits for category-discover prompts, especially for dev-tools.',
    howToGetOn: 'Schedule a launch at producthunt.com/posts/new — even a "relaunch" works. Prepare 3-5 hunter comments before launch day.',
  },
  {
    match: 'reddit.com',
    label: 'Reddit thread',
    effort: 'medium',
    why: 'Reddit threads surface in our audits for comparison prompts. Genuine user discussion beats branded content.',
    howToGetOn: 'Find r/<your-category> threads where your brand is mentioned. Reply genuinely to add context. Do NOT astroturf.',
  },
  {
    match: 'news.ycombinator.com',
    label: 'Hacker News thread',
    effort: 'medium',
    why: 'Show HN threads show up in our audits for technical-evaluation prompts, especially for dev-tools.',
    howToGetOn: 'Launch with a Show HN at news.ycombinator.com/showhn.html.',
  },
  {
    match: 'linkedin.com/company',
    label: 'LinkedIn company page',
    effort: 'low',
    why: 'LinkedIn company facts show up in our audits for B2B "what does [brand] do" prompts.',
    howToGetOn: 'linkedin.com/company/setup — post weekly updates, set your industry tags correctly.',
  },
];

const BY_CATEGORY: Record<string, CitationExpectation[]> = {
  'project management': [
    { match: 'en.wikipedia.org/wiki/Comparison_of_project_management_software', label: 'Wikipedia comparison article', effort: 'high', why: 'We have seen this page cited in our audits for PM-tool prompts.', howToGetOn: 'Wikipedia talk page first → request an edit if the article already lists your category. Do not edit directly without consensus.' },
    { match: 'g2.com/categories/project-management', label: 'G2 category page', effort: 'low', why: 'G2 PM category surfaces in our audits for category-best prompts.', howToGetOn: 'g2.com/products/new — claim, ask customers for reviews.' },
    { match: 'capterra.com/categories/project-management', label: 'Capterra category', effort: 'low', why: 'Capterra PM shows up alongside G2 in our audits.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'reddit.com/r/projectmanagement', label: 'r/projectmanagement threads', effort: 'medium', why: 'Buyer comparison threads surface in our audits.', howToGetOn: 'Join, contribute genuinely, never astroturf.' },
    { match: 'linkedin.com/company', label: 'LinkedIn company page', effort: 'low', why: 'B2B PM tools: company facts cited in "what does [brand] do" prompts.', howToGetOn: 'linkedin.com/company/setup.' },
    { match: 'news.ycombinator.com', label: 'Hacker News Show HN', effort: 'medium', why: 'Engineering-led PM tools show up in our HN-grounded prompts.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
  ],
  'payment processing': [
    { match: 'en.wikipedia.org/wiki/Payment_processor', label: 'Wikipedia payments article', effort: 'high', why: 'Wikipedia payments content shows up in our audits for definitional prompts.', howToGetOn: 'Wikipedia Talk page → request a mention in the relevant company list.' },
    { match: 'stripe.com', label: 'Stripe partners directory', effort: 'low', why: 'Stripe partner pages surface in our audits for payment-ecosystem prompts.', howToGetOn: 'docs.stripe.com/partners — apply for the partner program.' },
    { match: 'g2.com/categories/payment-processing', label: 'G2 payments category', effort: 'low', why: 'Standard category-best source in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'crunchbase.com', label: 'Crunchbase', effort: 'low', why: 'Company facts cited in "what is [brand]" prompts in our audits.', howToGetOn: 'crunchbase.com/add-company.' },
    { match: 'producthunt.com', label: 'Product Hunt launch', effort: 'low', why: 'PH pages surface in category-discover prompts in our audits.', howToGetOn: 'producthunt.com/posts/new.' },
  ],
  productivity: [
    { match: 'en.wikipedia.org/wiki/Productivity_software', label: 'Wikipedia productivity software', effort: 'high', why: 'Wikipedia productivity content shows up in our audits for definitional prompts.', howToGetOn: 'Wikipedia notability + Talk page first.' },
    { match: 'g2.com/categories/productivity', label: 'G2 productivity', effort: 'low', why: 'Standard category-best source in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'capterra.com/categories/productivity', label: 'Capterra productivity', effort: 'low', why: 'Standard category-best source in our audits.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'reddit.com/r/productivity', label: 'r/productivity threads', effort: 'medium', why: 'Buyer comparison threads surface in our audits.', howToGetOn: 'Reddit — engage genuinely.' },
    { match: 'producthunt.com', label: 'Product Hunt launch', effort: 'low', why: 'Productivity category is active on PH and surfaces in our audits.', howToGetOn: 'producthunt.com/posts/new.' },
  ],
  'frontend deployment': [
    { match: 'en.wikipedia.org/wiki/Platform_as_a_service', label: 'Wikipedia PaaS article', effort: 'high', why: 'Wikipedia PaaS content shows up in our audits for definitional prompts.', howToGetOn: 'Wikipedia Talk page first.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'GitHub orgs surface in our audits for technical-evaluation prompts.', howToGetOn: 'Keep your GitHub org public, star your own repos.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'HN Show HN posts surface in our audits for infra-tool prompts.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
    { match: 'g2.com/categories/application-development', label: 'G2 dev category', effort: 'low', why: 'G2 dev category shows up in our audits.', howToGetOn: 'g2.com/products/new.' },
  ],
  design: [
    { match: 'en.wikipedia.org/wiki/Comparison_of_vector_graphics_editors', label: 'Wikipedia design comparison', effort: 'high', why: 'Wikipedia comparison articles show up in our audits for design-tool prompts.', howToGetOn: 'Wikipedia — request Talk page inclusion.' },
    { match: 'g2.com/categories/design', label: 'G2 design', effort: 'low', why: 'G2 design category surfaces in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'producthunt.com', label: 'Product Hunt', effort: 'low', why: 'PH surfaces in our audits for design-tool prompts.', howToGetOn: 'producthunt.com/posts/new.' },
    { match: 'reddit.com/r/design', label: 'r/design threads', effort: 'medium', why: 'Reddit threads surface in our audits for design comparison prompts.', howToGetOn: 'Engage genuinely.' },
  ],
  crm: [
    { match: 'en.wikipedia.org/wiki/Customer_relationship_management', label: 'Wikipedia CRM article', effort: 'high', why: 'Wikipedia category content shows up in our audits.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/crm', label: 'G2 CRM', effort: 'low', why: 'G2 CRM category surfaces in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'capterra.com/categories/crm', label: 'Capterra CRM', effort: 'low', why: 'Capterra CRM shows up alongside G2 in our audits.', howToGetOn: 'capterra.com/vendors/sign-up.' },
    { match: 'linkedin.com/company', label: 'LinkedIn company page', effort: 'low', why: 'B2B CRM tools: LinkedIn company facts surface in our audits for "what does [brand] do" prompts.', howToGetOn: 'linkedin.com/company/setup.' },
    { match: 'crunchbase.com', label: 'Crunchbase', effort: 'low', why: 'Company facts surface in our audits.', howToGetOn: 'crunchbase.com/add-company.' },
  ],
  analytics: [
    { match: 'en.wikipedia.org/wiki/Web_analytics', label: 'Wikipedia web analytics', effort: 'high', why: 'Wikipedia content shows up in our audits for definitional prompts.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/product-analytics', label: 'G2 analytics', effort: 'low', why: 'G2 analytics surfaces in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'GitHub orgs surface in our audits for technical-evaluation prompts.', howToGetOn: 'Keep your GitHub org public.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'Show HN posts surface in our audits for analytics-tool prompts.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
  ],
  monitoring: [
    { match: 'en.wikipedia.org/wiki/Application_performance_management', label: 'Wikipedia APM article', effort: 'high', why: 'Wikipedia category content shows up in our audits.', howToGetOn: 'Wikipedia Talk page.' },
    { match: 'g2.com/categories/application-performance-monitoring', label: 'G2 monitoring', effort: 'low', why: 'G2 APM category surfaces in our audits.', howToGetOn: 'g2.com/products/new.' },
    { match: 'github.com', label: 'GitHub org', effort: 'low', why: 'OSS-friendly monitoring shows up in HN-grounded prompts.', howToGetOn: 'Keep your GitHub org public.' },
    { match: 'news.ycombinator.com', label: 'Show HN', effort: 'medium', why: 'Show HN posts surface in our audits for monitoring prompts.', howToGetOn: 'news.ycombinator.com/showhn.html.' },
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