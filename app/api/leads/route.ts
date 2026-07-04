import { NextResponse } from 'next/server';
import { saveLead } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/leads
 *
 * Captures a contact form submission. Writes to the `leads` table.
 * Returns the new lead id.
 *
 * Required: name, email.
 * Optional: company, arrBand, message, source.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  const id = await saveLead({
    name,
    email,
    company: typeof body.company === 'string' ? body.company.trim() : undefined,
    arrBand: typeof body.arrBand === 'string' ? body.arrBand.trim() : undefined,
    message: typeof body.message === 'string' ? body.message.trim() : undefined,
    source: typeof body.source === 'string' ? body.source.trim() : undefined,
  });

  return NextResponse.json({ ok: true, id });
}