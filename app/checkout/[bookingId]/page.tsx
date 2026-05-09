'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/components/lang-provider';

export default function Checkout() {
  const params = useParams();
  const { t } = useLang();
  const bookingId = params.bookingId as string;

  return (
    <main className="pt-[62px] md:pt-[120px] min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-outline-variant/40 bg-white p-8 shadow-card text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-fixed/40">
            <span className="material-symbols-outlined text-tertiary text-[40px]">check_circle</span>
          </div>
          <span className="inline-block rounded-full bg-tertiary-fixed/40 px-4 py-1.5 text-label-sm font-bold text-tertiary mb-4">
            {t.checkout.badge}
          </span>
          <h1 className="text-h1 font-extrabold text-on-background mb-4">{t.checkout.title}</h1>
          <p className="text-secondary text-body-md mb-2">{t.checkout.desc}</p>
          <p className="text-label-sm text-slate-400 mb-8">
            {t.checkout.bookingId} <span className="font-bold text-on-background">{bookingId}</span>
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-container px-8 py-4 font-bold text-label-bold text-white hover:bg-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            {t.checkout.dashBtn}
          </Link>
        </div>
      </div>
    </main>
  );
}
