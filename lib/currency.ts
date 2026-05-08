export type Currency = 'GEL' | 'USD' | 'EUR';

export interface ExchangeRates {
  USD: number;
  EUR: number;
  updatedAt: number;
  fallback?: boolean;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GEL: '₾',
  USD: '$',
  EUR: '€',
};

export const CURRENCY_OPTIONS: { value: Currency; symbol: string }[] = [
  { value: 'GEL', symbol: '₾' },
  { value: 'USD', symbol: '$' },
  { value: 'EUR', symbol: '€' },
];

/** Convert a GEL amount and format for display. Falls back to GEL if rates unavailable. */
export function formatPrice(
  gelAmount: number,
  currency: Currency,
  rates: ExchangeRates | null,
): string {
  if (currency === 'GEL' || !rates) {
    return `${Math.round(gelAmount)} ₾`;
  }
  const rate = currency === 'USD' ? rates.USD : rates.EUR;
  const converted = Math.round(gelAmount / rate);
  return currency === 'USD' ? `$${converted}` : `€${converted}`;
}

/** Raw conversion without formatting (for sending to API) */
export function convertGel(
  gelAmount: number,
  currency: Currency,
  rates: ExchangeRates | null,
): number {
  if (currency === 'GEL' || !rates) return gelAmount;
  const rate = currency === 'USD' ? rates.USD : rates.EUR;
  return Math.round(gelAmount / rate);
}
