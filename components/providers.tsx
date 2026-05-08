'use client';
import { SessionProvider } from 'next-auth/react';
import { LangProvider } from '@/components/lang-provider';
import { CurrencyProvider } from '@/components/currency-provider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </LangProvider>
    </SessionProvider>
  );
}
