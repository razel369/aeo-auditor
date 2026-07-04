import { analyzeCompetitors, competitorsForCategory } from '../lib/competitor-library';

// Synthetic probe set: emulate what Gemini + grounding would return for
// "Stripe" in the "payments" category. Stripe.com appears in 4 of 5 prompts;
// Adyen in 2; PayPal in 1; Square in 1; Braintree in 0.
const probes = [
  { citedUrls: ['https://stripe.com/', 'https://news.ycombinator.com/item?id=1'],
    citedDomains: ['stripe.com', 'news.ycombinator.com'],
    brandMentionedUrl: true, brandMentionedText: true,
    textExcerpt: 'Stripe and Adyen dominate payment processing for developers.' },
  { citedUrls: ['https://paypal.com/', 'https://adyen.com/'],
    citedDomains: ['paypal.com', 'adyen.com'],
    brandMentionedUrl: false, brandMentionedText: true,
    textExcerpt: 'Adyen and PayPal are the most established names.' },
  { citedUrls: ['https://stripe.com/docs'],
    citedDomains: ['stripe.com'],
    brandMentionedUrl: true, brandMentionedText: false,
    textExcerpt: 'Stripe is widely used by SaaS companies.' },
  { citedUrls: ['https://squareup.com/'],
    citedDomains: ['squareup.com'],
    brandMentionedUrl: false, brandMentionedText: false,
    textExcerpt: 'Square focuses on in-person payments.' },
  { citedUrls: ['https://stripe.com/', 'https://adyen.com/', 'https://example.com/blog'],
    citedDomains: ['stripe.com', 'adyen.com', 'example.com'],
    brandMentionedUrl: true, brandMentionedText: true,
    textExcerpt: 'Stripe and Adyen are the top picks for new platforms.' },
];

const result = analyzeCompetitors({
  brand: 'Stripe', category: 'payments', probes,
});

console.log('SOV:', Math.round(result.shareOfVoice * 100) + '%');
console.log('Brand citations:', result.totalBrandCitations);
console.log('Competitor citations:', result.totalCompetitorCitations);
console.log('Sightings:');
for (const s of result.sightings) {
  console.log(`  ${s.name}: ${s.urlCount} url hits${s.textMention ? ' (text)' : ''}`);
}
console.log('\nSeed for "payments":');
for (const c of competitorsForCategory('payments')) {
  console.log(`  - ${c.name}: ${c.domains.join(', ')}`);
}
console.log('\nSeed for "project management":');
for (const c of competitorsForCategory('project management')) {
  console.log(`  - ${c.name}: ${c.domains.join(', ')}`);
}
console.log('\nSeed for "unknown category":');
console.log(competitorsForCategory('underwater basket weaving'));