import type { Metadata } from 'next';
import { FaqContent } from './FaqContent';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, getSiteUrl, jsonLdBreadcrumb } from '@/lib/seo';
import { FAQ_ALL_EN } from '@/lib/faq';

const PAGE_URL = absoluteUrl('/faq');

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | WAYGO.ge',
  description:
    'Get answers about car rental in Georgia: booking process, insurance plans, cancellation policy, security deposit, host verification, and more. WAYGO.ge P2P car sharing platform.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'FAQ | WAYGO.ge — Car Rental Georgia',
    description:
      'Everything you need to know about renting or hosting a car on WAYGO.ge — Georgia\'s trusted P2P car sharing platform.',
    url: PAGE_URL,
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ALL_EN.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[
        jsonLdBreadcrumb([
          { name: 'Home', url: getSiteUrl() },
          { name: 'FAQ', url: PAGE_URL },
        ]),
        jsonLdFaq,
      ]} />
      <FaqContent />
    </>
  );
}
