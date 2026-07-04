import { NextResponse } from 'next/server';
import { saveSourceLead } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/source-leads
 *
 * Captures a post-audit lead: someone saw their citation-coverage report and
 * asked for the Day-90 path. Distinct from /api/leads because it carries
 * brand + score context for routing.
 *
 * Required: email, brand, overallScore, actionCount.
 * Optional: name, company, category.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const brand = typeof body.brand === 'string' ? body.brand.trim() : '';
  const overallScore = Number(body.overallScore);
  const actionCount = Number(body.actionCount);

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }
  if (!brand) {
    return NextResponse.json({ error: 'brand required' }, { status: 400 });
  }
  if (!Number.isFinite(overallScore) || overallScore < 0 || overallScore > 100) {
    return NextResponse.json({ error: 'overallScore out of range' }, { status: 400 });
  }
  if (!Number.isFinite(actionCount) || actionCount < 0) {
    return NextResponse.json({ error: 'actionCount out of range' }, { status: 400 });
  }

  const id = await saveSourceLead({
    email,
    name: typeof body.name === 'string' ? body.name.trim() || undefined : undefined,
    company: typeof body.company === 'string' ? body.company.trim() || undefined : undefined,
    brand,
    category: typeof body.category === 'string' ? body.category.trim() || null : null,
    overallScore,
    actionCount,
    source: typeof body.source === 'string' ? body.source.trim() || undefined : undefined,
  });

  return NextResponse.json({ ok: true, id });
}