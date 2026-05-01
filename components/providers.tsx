'use client';
import { SessionProvider } from 'next-auth/react';
import { LangProvider } from '@/components/lang-provider';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>{children}</LangProvider>
    </SessionProvider>
  );
}
