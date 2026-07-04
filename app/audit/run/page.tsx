import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AuditRunner } from '@/components/source-audit/AuditRunner';

export const dynamic = 'force-dynamic';

export default async function AuditRunPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; category?: string }>;
}) {
  const params = await searchParams;
  const brand = (params.brand ?? '').trim();
  const category = (params.category ?? '').trim();
  if (!brand) redirect('/audit');

  return (
    <main>
      <SiteHeader />
      <AuditRunner brand={brand} category={category || null} />
      <SiteFooter />
    </main>
  );
}
