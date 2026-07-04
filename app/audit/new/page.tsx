import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string }>;
}) {
  const params = await searchParams;
  const brand = (params.brand ?? '').trim();
  if (!brand) redirect('/audit');
  const qs = new URLSearchParams({ brand });
  if (params.category) qs.set('category', params.category);
  redirect(`/audit/run?${qs.toString()}`);
}