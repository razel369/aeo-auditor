/**
 * POST /api/source-audit
 * Body: { brand: string, category?: string }
 * Returns: CitationCoverageReport (8 source profiles + score + action list).
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSourceAudit } from '@/lib/source-audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const brand = String(body?.brand ?? '').trim();
  if (!brand) {
    return NextResponse.json({ error: 'brand required' }, { status: 400 });
  }
  if (brand.length > 120) {
    return NextResponse.json({ error: 'brand too long' }, { status: 400 });
  }
  const category = body?.category ? String(body.category).trim().slice(0, 120) : undefined;
  const report = await runSourceAudit(brand, category);
  return NextResponse.json(report);
}

export async function GET() {
  return NextResponse.json({ ok: true, hint: 'POST { brand, category? }' });
}
