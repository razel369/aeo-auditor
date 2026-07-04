import { NextResponse } from 'next/server';
import { keysStatus, setKeys, clearKeys, type ProviderKey } from '@/lib/byok';

const PROVIDERS: ProviderKey[] = ['openai', 'anthropic', 'google', 'perplexity', 'deepseek', 'moonshot'];

function isProvider(s: string): s is ProviderKey {
  return (PROVIDERS as readonly string[]).includes(s);
}

export async function GET() {
  const status = await keysStatus('default');
  return NextResponse.json({ providers: status });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const partial: Partial<Record<ProviderKey, string | null>> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!isProvider(k)) continue;
    if (typeof v === 'string') partial[k] = v.trim();
    else if (v === null) partial[k] = null;
  }
  await setKeys('default', partial);
  const status = await keysStatus('default');
  return NextResponse.json({ ok: true, providers: status });
}

export async function DELETE() {
  await clearKeys('default');
  return NextResponse.json({ ok: true, providers: await keysStatus('default') });
}