import { redirect } from 'next/navigation';
import { runAudit, runOfflineMemoryAudit } from '@/lib/audits';

export const dynamic = 'force-dynamic';

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string; auditKind?: string }>;
}) {
  const params = await searchParams;
  const brand = (params.brand ?? '').trim();
  if (!brand) redirect('/');
  if (params.auditKind === 'offline_memory') {
    const { id } = await runOfflineMemoryAudit(brand, params.category);
    redirect(`/audit/${id}`);
  }
  const { id } = await runAudit(brand, params.category);
  redirect(`/audit/${id}`);
}