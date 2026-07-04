import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AuditHero } from '@/components/source-audit/AuditHero';
import { BaselineStrip } from '@/components/source-audit/BaselineStrip';
import { HowItWorks } from '@/components/source-audit/HowItWorks';
import { SourceMatrixPreview } from '@/components/source-audit/SourceMatrixPreview';
import { RecentBrandScans } from '@/components/source-audit/RecentBrandScans';
import { listRecentSourceAudits } from '@/lib/source-audit';

export const dynamic = 'force-dynamic';

export default async function AuditLandingPage() {
  let recent: Awaited<ReturnType<typeof listRecentSourceAudits>> = [];
  try { recent = await listRecentSourceAudits(6); } catch {}

  return (
    <main>
      <SiteHeader />
      <AuditHero />
      <BaselineStrip />
      <HowItWorks />
      <SourceMatrixPreview />
      {recent.length > 0 && <RecentBrandScans items={recent} />}
      <SiteFooter />
    </main>
  );
}
