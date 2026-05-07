import type { Metadata } from 'next';
import { CancellationPolicyContent } from './CancellationPolicyContent';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Cancellation Policy — Refunds on WAYGO.ge',
  description:
    'Cancel within 1 hour for a full refund. 7+ days before pickup: 100% refund. 3–7 days: 50%. 24–72 hours: 25%. Under 24 hours: no refund. Deposit always returned.',
  alternates: { canonical: absoluteUrl('/cancellation-policy') },
  openGraph: {
    title: 'Cancellation Policy — Refunds on WAYGO.ge',
    description:
      'Full refund within 1 hour of booking. Tiered refunds based on cancellation timing. Security deposit always returned in full.',
    url: absoluteUrl('/cancellation-policy'),
    type: 'website',
  },
};

export default function CancellationPolicyPage() {
  return <CancellationPolicyContent />;
}
