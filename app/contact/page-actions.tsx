'use server';

import { redirect } from 'next/navigation';
import { saveLead } from '@/lib/db';

/**
 * Server action used by the /contact form.
 * Accepts FormData from the browser, validates, persists, redirects.
 */
export async function submitContactForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim();
  const arrBand = String(formData.get('arrBand') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();
  const source = String(formData.get('source') ?? 'contact-form');

  if (!name || !email) {
    redirect('/contact?error=missing-fields');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect('/contact?error=invalid-email');
  }

  await saveLead({
    name,
    email,
    company: company || undefined,
    arrBand: arrBand || undefined,
    message: message || undefined,
    source,
  });

  // Pass the company name through so the welcome page can personalize.
  const qs = company ? `?brand=${encodeURIComponent(company)}` : '';
  redirect(`/onboarding/welcome${qs}`);
}