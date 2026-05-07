import type { Metadata } from 'next';
import { GuestRulesContent } from './GuestRulesContent';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How WAYGO.ge Works for Guests — Renting a Car in Georgia',
  description:
    'Learn how to rent a car on WAYGO.ge: browse verified cars, choose insurance, send a booking request, and complete KYC verification. Simple, safe P2P car rental in Georgia.',
  alternates: { canonical: absoluteUrl('/guest-rules') },
  openGraph: {
    title: 'How WAYGO.ge Works for Guests — Renting a Car in Georgia',
    description:
      'Step-by-step guide to renting a car in Georgia through WAYGO.ge: verification, insurance, booking, pickup, and condition reports.',
    url: absoluteUrl('/guest-rules'),
    type: 'website',
  },
};

export default function GuestRulesPage() {
  return <GuestRulesContent />;
}
