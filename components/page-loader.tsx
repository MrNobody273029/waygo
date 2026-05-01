'use client';
import { LogoLoader } from '@/components/LogoLoader';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-[3px] bg-white/10">
      <LogoLoader className="w-[480px] max-w-[85vw] h-auto text-on-background" />
    </div>
  );
}
