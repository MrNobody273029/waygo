import type { Metadata } from 'next';
import { HostRulesContent } from './HostRulesContent';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'How WAYGO.ge Works for Hosts — Earn by Sharing Your Car',
  description:
    'List your car on WAYGO.ge and earn up to 95% of each rental. Verified guests, insurance protection, condition reports, and secure payments through the platform.',
  alternates: { canonical: absoluteUrl('/host-rules') },
  openGraph: {
    title: 'How WAYGO.ge Works for Hosts — Earn by Sharing Your Car',
    description:
      'Earn 90–95% per rental on WAYGO.ge. Verified guests, insurance protection, and secure P2P payments in Georgia.',
    url: absoluteUrl('/host-rules'),
    type: 'website',
  },
};

export default function HostRulesPage() {
  return <HostRulesContent />;
}
