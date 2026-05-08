'use client';
import { useEffect } from 'react';
import { useLang } from '@/components/lang-provider';

export function AdminLangDefault() {
  const { setLang } = useLang();
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('waygo-lang') : null;
    if (!stored) setLang('ka');
  }, [setLang]);
  return null;
}
