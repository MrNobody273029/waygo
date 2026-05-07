import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms & Conditions — WAYGO.ge',
  description:
    'Terms and conditions for using WAYGO.ge peer-to-peer car rental platform in Georgia. Understand the rights and obligations of guests and hosts.',
  alternates: { canonical: absoluteUrl('/terms') },
  openGraph: {
    title: 'Terms & Conditions — WAYGO.ge',
    description:
      'Terms and conditions for using WAYGO.ge peer-to-peer car rental in Georgia.',
    url: absoluteUrl('/terms'),
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
