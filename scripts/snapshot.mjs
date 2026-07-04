// scripts/snapshot.mjs — capture each page as PNG for visual review.
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const OUT = path.resolve('docs/snapshots');
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
const page = await context.newPage();

const pages = [
  { name: '01-home', url: '/' },
  { name: '02-services', url: '/services' },
  { name: '03-sales', url: '/sales' },
  { name: '04-about', url: '/about' },
  { name: '05-not-found', url: '/this-does-not-exist-404' },
];

// First, run an audit to get a real id
const auditRes = await fetch(`${BASE}/api/audit`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ brand: 'Linear', categoryHint: 'project management' }),
});
const audit = await auditRes.json();
pages.push({ name: '06-audit-linear', url: `/audit/${audit.id}` });

for (const p of pages) {
  console.log('->', p.url);
  await page.goto(`${BASE}${p.url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800); // let fonts settle
  const file = path.join(OUT, `${p.name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('   saved', file);
}

await browser.close();