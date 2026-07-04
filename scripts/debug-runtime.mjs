// scripts/debug-runtime.mjs — load each page, capture console errors
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
const warnings = [];
page.on('console', (msg) => {
  const type = msg.type();
  if (type === 'error') errors.push(`[console.error] ${msg.text()}`);
  else if (type === 'warning') warnings.push(`[console.warn] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  errors.push(`[pageerror] ${err.message}\n${err.stack ?? ''}`);
});

const pages = ['/', '/services', '/sales', '/about', '/audit', '/case-study/aeo-auditor', '/this-does-not-exist-404'];

for (const url of pages) {
  errors.length = 0; warnings.length = 0;
  console.log(`\n=== ${url} ===`);
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(800);
  } catch (e) {
    errors.push(`[navigation] ${e.message}`);
  }
  if (errors.length === 0 && warnings.length === 0) {
    console.log('  (clean)');
  } else {
    errors.forEach((e) => console.log('  ', e));
    warnings.forEach((w) => console.log('  ', w));
  }
}

await browser.close();