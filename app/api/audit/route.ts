import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { runAudit } from '@/lib/audits';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const brand = (body.brand ?? '').toString().trim();
  const category = body.category?.toString().trim();

  const requested = (body.engineMode ?? 'auto').toString();
  const engineMode: 'auto' | 'live' | 'sim' =
    requested === 'live' || requested === 'sim' ? requested : 'auto';

  if (!brand) return NextResponse.json({ error: 'brand required' }, { status: 400 });
  try {
    const { id, report } = await runAudit(getDb(), brand, category, engineMode);
    return NextResponse.json({ id, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}