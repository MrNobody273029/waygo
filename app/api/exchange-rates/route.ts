import { NextResponse } from 'next/server';

const NBG_URL =
  'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json';

// Next.js server-side cache: revalidate every 24 h
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch(NBG_URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`NBG responded ${res.status}`);

    const data = await res.json();
    const currencies: { code: string; rate: number; quantity: number }[] =
      data[0]?.currencies ?? [];

    const usdRow = currencies.find(c => c.code === 'USD');
    const eurRow = currencies.find(c => c.code === 'EUR');

    if (!usdRow || !eurRow) throw new Error('USD or EUR missing from NBG response');

    // NBG rate is "X GEL per quantity units of foreign currency"
    const usdRate = usdRow.rate / (usdRow.quantity || 1);
    const eurRate = eurRow.rate / (eurRow.quantity || 1);

    return NextResponse.json(
      { USD: usdRate, EUR: eurRate, updatedAt: Date.now() },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
        },
      },
    );
  } catch (err) {
    console.error('[exchange-rates] NBG fetch failed:', err);
    // Conservative fallback — clearly marked so client knows rates may be stale
    return NextResponse.json(
      { USD: 2.7, EUR: 2.95, updatedAt: Date.now(), fallback: true },
      { status: 200 },
    );
  }
}
