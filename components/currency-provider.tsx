'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  formatPrice as _fmt,
  convertGel as _convert,
  type Currency,
  type ExchangeRates,
} from '@/lib/currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: ExchangeRates | null;
  /** Format a GEL amount for display in the current currency */
  formatPrice: (gelAmount: number) => string;
  /** Convert a GEL amount to the current currency (number only) */
  convertGel: (gelAmount: number) => number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'GEL',
  setCurrency: () => {},
  rates: null,
  formatPrice: n => `${Math.round(n)} ₾`,
  convertGel: n => n,
  loading: false,
});

const CURRENCY_KEY = 'waygo-currency';
const RATES_KEY = 'waygo-exchange-rates';
const RATES_TTL = 24 * 60 * 60 * 1000; // 24 h

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('GEL');
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore saved currency preference
    const saved = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    if (saved === 'GEL' || saved === 'USD' || saved === 'EUR') {
      setCurrencyState(saved);
    }

    // Use cached rates if fresh, otherwise fetch
    try {
      const cached = localStorage.getItem(RATES_KEY);
      if (cached) {
        const parsed: ExchangeRates = JSON.parse(cached);
        if (Date.now() - parsed.updatedAt < RATES_TTL) {
          setRates(parsed);
          setLoading(false);
          return;
        }
      }
    } catch {
      /* ignore malformed cache */
    }

    fetchRates();
  }, []);

  async function fetchRates() {
    setLoading(true);
    try {
      const res = await fetch('/api/exchange-rates');
      if (!res.ok) throw new Error('Rate fetch failed');
      const data: ExchangeRates = await res.json();
      setRates(data);
      try {
        localStorage.setItem(RATES_KEY, JSON.stringify(data));
      } catch {
        /* storage quota */
      }
    } catch {
      // No rates — display falls back to GEL
      setRates(null);
    } finally {
      setLoading(false);
    }
  }

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
  }

  const formatPrice = useCallback(
    (gelAmount: number) => _fmt(gelAmount, currency, rates),
    [currency, rates],
  );

  const convertGel = useCallback(
    (gelAmount: number) => _convert(gelAmount, currency, rates),
    [currency, rates],
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rates, formatPrice, convertGel, loading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
