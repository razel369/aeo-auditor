import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { runAudit } from '@/lib/audits';

export const dynamic = 'force-dynamic';

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string }>;
}) {
  const params = await searchParams;
  const brand = (params.brand ?? '').trim();
  if (!brand) redirect('/');
  const { id } = await runAudit(getDb(), brand, params.category);
  redirect(`/audit/${id}`);
}