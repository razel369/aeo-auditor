import { NextRequest, NextResponse } from 'next/server';
import { runAudit, runOfflineMemoryAudit } from '@/lib/audits';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const brand = (body.brand ?? '').toString().trim();
  const category = body.category?.toString().trim();

  const requested = (body.engineMode ?? 'auto').toString();
  const engineMode = (
    ['live', 'sim'].includes(requested) ? requested : 'auto'
  ) as 'auto' | 'live' | 'sim';

  const auditKindRaw = (body.auditKind ?? 'standard').toString();
  const auditKind = auditKindRaw === 'offline_memory' ? 'offline_memory' : 'standard';

  if (!brand) return NextResponse.json({ error: 'brand required' }, { status: 400 });
  try {
    const { id, report } =
      auditKind === 'offline_memory'
        ? await runOfflineMemoryAudit(brand, category)
        : await runAudit(brand, category, engineMode);
    return NextResponse.json({ id, report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}