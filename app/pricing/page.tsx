import { redirect } from 'next/navigation';

export default function PricingPage() {
  // v0.4: legacy /pricing → /services. Kept so old links and search-engine
  // bookmarks don't 404.
  redirect('/services');
}