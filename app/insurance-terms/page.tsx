import type { Metadata } from 'next';
import { InsuranceTermsContent } from './InsuranceTermsContent';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Insurance Terms — Coverage Plans on WAYGO.ge',
  description:
    'WAYGO.ge offers three insurance tiers: Basic (0 GEL/day, 1,000 GEL deductible), Standard (18 GEL/day, 400 GEL deductible), and Premium (35 GEL/day, zero deductible). Choose at booking.',
  alternates: { canonical: absoluteUrl('/insurance-terms') },
  openGraph: {
    title: 'Insurance Terms — Coverage Plans on WAYGO.ge',
    description:
      'Three insurance tiers for every WAYGO.ge rental: Basic, Standard, and Premium. Understand your coverage and deductible before booking.',
    url: absoluteUrl('/insurance-terms'),
    type: 'website',
  },
};

export default function InsuranceTermsPage() {
  return <InsuranceTermsContent />;
}
