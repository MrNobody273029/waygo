import type { Metadata } from 'next';
import SafetyContent from './SafetyContent';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Safety on WAYGO.ge — How We Protect Hosts and Guests',
  description:
    'Learn how WAYGO.ge keeps you safe: verified hosts and guests, KYC identity checks, condition reports, photo documentation, insurance plans, and deposit protection.',
  alternates: { canonical: absoluteUrl('/safety') },
  openGraph: {
    title: 'Safety on WAYGO.ge — How We Protect Hosts and Guests',
    description:
      'WAYGO.ge uses KYC verification, condition reports, insurance plans, and deposit protection to keep every rental safe.',
    url: absoluteUrl('/safety'),
    type: 'website',
  },
};

export default function SafetyPage() {
  return <SafetyContent />;
}
