/**
 * Local dogfood: scan 3 brands via the source adapter pipeline.
 * Run: npx tsx scripts/dogfood.ts
 */
import { runSourceAudit } from '@/lib/source-audit';

const brands = [
  { brand: 'Stripe', category: 'fintech' },
  { brand: 'Linear', category: 'project management' },
  { brand: 'AEO Auditor', category: 'analytics' },
];

async function main() {
  for (const b of brands) {
    const report = await runSourceAudit(b.brand, b.category);
    console.log(`\n=== ${b.brand} (${b.category ?? 'no category'}) ===`);
    console.log(`Overall: ${report.overallScore}/100`);
    for (const p of report.profiles) {
      console.log(`  ${p.mode.padEnd(7)} ${p.sourceName.padEnd(12)} ${p.exists ? 'EXISTS' : '-------'}  q=${p.qualityScore}/10  ${p.url ?? '(no url)'}`);
    }
    console.log(`Actions: ${report.actions.length}`);
    for (const a of report.actions.slice(0, 3)) {
      console.log(`  [${a.priority}] +${a.impact} — ${a.text}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
